const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { assignRoles, checkVictory, ROLES, MONSTER_ROLES } = require('./gameLogic');

const app = express();
const allowedOrigin = process.env.CLIENT_ORIGIN || true;
app.use(cors({ origin: allowedOrigin }));
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: allowedOrigin } });

const rooms = {}; // roomCode -> room state

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getRoom(code) { return rooms[code]; }

io.on('connection', (socket) => {

  // HOST creates room
  socket.on('create_room', ({ hostName }) => {
    const code = generateCode();
    rooms[code] = {
      code,
      host: socket.id,
      hostName,
      players: {},
      phase: 'lobby', // lobby | night | day | vote | ended
      turn: 0,
      nightActions: {},
      eliminatedThisTurn: null,
      protectorSaves: 2,
      hunterCooldown: 0,
      shamanCooldown: 0,
      mommySilenced: {},
      vampireCount: 0,
      log: [],
    };
    socket.join(code);
    socket.emit('room_created', { code });
  });

  // PLAYER joins room
  socket.on('join_room', ({ code, name }) => {
    const room = getRoom(code);
    if (!room) return socket.emit('error', 'Room not found');
    if (room.phase !== 'lobby') return socket.emit('error', 'Game already started');

    room.players[socket.id] = { id: socket.id, name, isAlive: true };
    socket.join(code);
    socket.emit('joined', { code, name });
    io.to(code).emit('lobby_update', {
      players: Object.values(room.players).map(p => ({ id: p.id, name: p.name })),
      hostName: room.hostName,
    });
  });

  // HOST closes room
  socket.on('close_room', ({ code }) => {
    const room = getRoom(code);
    if (!room || room.host !== socket.id) return;
    socket.to(code).emit('host_left');
    delete rooms[code];
  });

  // HOST starts game
  socket.on('start_game', ({ code }) => {
    const room = getRoom(code);
    if (!room || room.host !== socket.id) return;
    if (Object.keys(room.players).length < 6) return socket.emit('error', 'Need at least 6 players');

    const assignments = assignRoles(Object.keys(room.players));
    Object.keys(room.players).forEach(id => {
      room.players[id] = { ...room.players[id], ...assignments[id] };
    });

    room.phase = 'night';
    room.turn = 1;

    // Send each player their role privately
    Object.values(room.players).forEach(p => {
      io.to(p.id).emit('role_assigned', {
        role: p.role,
        isMonster: p.isMonster,
        bonusCard: p.bonusCard,
      });
    });

    // Notify monsters of each other
    const monsterList = Object.values(room.players)
      .filter(p => MONSTER_ROLES.includes(p.role))
      .map(p => ({ id: p.id, name: p.name, role: p.role }));

    monsterList.forEach(m => {
      io.to(m.id).emit('monster_team', { monsters: monsterList });
    });

    io.to(code).emit('phase_change', { phase: 'night', turn: room.turn });
  });

  // BONUS CARD
  socket.on('use_bonus_card', ({ code, targetId }) => {
    const room = getRoom(code);
    if (!room) return;
    const player = room.players[socket.id];
    if (!player || !player.bonusCard || player.bonusUsed) return;

    if (player.bonusCard === 'Silver Shield') {
      // Register vote but don't spend yet — resolved at night end
      if (!room.shieldVotes) room.shieldVotes = {};
      room.shieldVotes[socket.id] = targetId;
      socket.emit('bonus_confirmed', { card: player.bonusCard, pending: true });
    } else if (player.bonusCard === 'Full Moon') {
      player.bonusUsed = true;
      room.nightActions[`bonus_${socket.id}`] = { card: player.bonusCard, actorId: socket.id, targetId };
      socket.emit('bonus_confirmed', { card: player.bonusCard });
    }
    // Garlic Necklace is automatic — no manual activation
  });

  // NIGHT ACTION: monster chooses victim
  socket.on('night_action', ({ code, targetId, action }) => {
    const room = getRoom(code);
    if (!room || room.phase !== 'night') return;
    const actor = room.players[socket.id];
    if (!actor || !actor.isAlive) return;

    room.nightActions[action] = { actorId: socket.id, targetId };

    // Check if all required actions are done, then resolve night
    resolveNightIfReady(room, code);
  });

  // INSPECTOR checks a player
  socket.on('inspector_check', ({ code, targetId }) => {
    const room = getRoom(code);
    if (!room) return;
    const target = room.players[targetId];
    if (!target) return;
    const result = target.isMonster ? 'a monster' : 'a student';
    socket.emit('inspector_result', {
      name: target.name,
      result,
      pronoun: 'He/She',
    });
  });

  // DAY VOTE
  socket.on('cast_vote', ({ code, targetId }) => {
    const room = getRoom(code);
    if (!room || room.phase !== 'vote') return;
    const voter = room.players[socket.id];
    if (!voter || !voter.isAlive || !voter.canVote) return;

    if (!room.votes) room.votes = {};
    room.votes[socket.id] = targetId;

    const aliveVoters = Object.values(room.players).filter(p => p.isAlive && p.canVote).length;
    if (Object.keys(room.votes).length >= aliveVoters) {
      resolveVote(room, code);
    }
  });

  // CHAT MESSAGE
  socket.on('chat_message', ({ code, message }) => {
    const room = getRoom(code);
    if (!room) return;
    const player = room.players[socket.id];
    if (!player || !player.isAlive) return;
    io.to(code).emit('chat_message', { name: player.name, message, id: socket.id });
  });

  // HOST advances phase
  socket.on('advance_phase', ({ code }) => {
    const room = getRoom(code);
    if (!room || room.host !== socket.id) return;

    if (room.phase === 'day') {
      room.phase = 'vote';
      room.votes = {};
      io.to(code).emit('phase_change', { phase: 'vote', turn: room.turn });
    } else if (room.phase === 'night') {
      resolveNight(room, code);
    }
  });

  socket.on('disconnect', () => {
    Object.keys(rooms).forEach(code => {
      const room = rooms[code];
      if (room.players[socket.id]) {
        if (room.phase === 'lobby') {
          delete room.players[socket.id];
          io.to(code).emit('lobby_update', {
            players: Object.values(room.players).map(p => ({ id: p.id, name: p.name })),
            hostName: room.hostName,
          });
        } else {
          room.players[socket.id].isAlive = false;
          io.to(code).emit('player_disconnected', { id: socket.id, name: room.players[socket.id].name });
        }
      }
    });
  });
});

function resolveNightIfReady(room, code) {
  const monsters = Object.values(room.players).filter(p => p.isAlive && MONSTER_ROLES.includes(p.role));
  if (room.nightActions['monster_kill']) {
    resolveNight(room, code);
  }
}

function resolveNight(room, code) {
  const killAction = room.nightActions['monster_kill'];
  const vampireAction = room.nightActions['vampire_transform'];
  let eliminated = null;

  // --- Silver Shield: activate only if all 4 holders voted for the same target ---
  const shieldHolders = Object.values(room.players).filter(p => p.bonusCard === 'Silver Shield' && p.isAlive);
  const shieldVotes = room.shieldVotes || {};
  let shieldProtectedId = null;

  if (shieldHolders.length > 0) {
    const votes = shieldHolders.map(p => shieldVotes[p.id]).filter(Boolean);
    const allSameTarget = votes.length === shieldHolders.length && votes.every(v => v === votes[0]);
    if (allSameTarget) {
      shieldProtectedId = votes[0];
      // Spend all shield cards
      shieldHolders.forEach(p => { p.bonusUsed = true; p.bonusCard = null; });
      io.to(code).emit('shield_activated', { targetId: shieldProtectedId });
    }
    // If not unanimous, cards are NOT spent
  }
  room.shieldVotes = {};

  // --- Garlic Necklace: auto-block vampire transform ---
  if (vampireAction) {
    const target = room.players[vampireAction.targetId];
    if (target && target.bonusCard === 'Garlic Necklace' && !target.bonusUsed) {
      target.bonusUsed = true;
      target.bonusCard = null;
      io.to(target.id).emit('garlic_activated');
      io.to(vampireAction.actorId).emit('transform_blocked', { targetName: target.name });
      delete room.nightActions['vampire_transform'];
    }
  }

  // --- Kill action ---
  if (killAction) {
    const target = room.players[killAction.targetId];
    const protectAction = room.nightActions['protect'];
    const isShieldProtected = shieldProtectedId === killAction.targetId;
    const isProtectorSaved = protectAction && protectAction.targetId === killAction.targetId && room.protectorSaves > 0;

    if (isProtectorSaved) {
      room.protectorSaves--;
      room.log.push(`${target.name} was saved by The Protector!`);
    } else if (isShieldProtected) {
      room.log.push(`${target.name} was protected by the Silver Shield!`);
    } else if (target && target.isAlive) {
      target.isAlive = false;
      eliminated = { id: target.id, name: target.name, role: target.role };
      room.log.push(`${target.name} was eliminated at night.`);
    }
  }

  // --- Full Moon: Wolfman kills a second target ---
  const fullMoonAction = Object.values(room.nightActions).find(a => a.card === 'Full Moon');
  if (fullMoonAction) {
    const actor = room.players[fullMoonAction.actorId];
    const target = room.players[fullMoonAction.targetId];
    const isShieldProtected = shieldProtectedId === fullMoonAction.targetId;
    if (actor?.role === 'Wolfman' && target?.isAlive && !isShieldProtected) {
      target.isAlive = false;
      room.log.push(`${target.name} was eliminated by Full Moon!`);
    }
  }

  // --- Mommy silence ---
  const mommyAction = room.nightActions['mommy_silence'];
  if (mommyAction) {
    const target = room.players[mommyAction.targetId];
    if (target) {
      target.canVote = false;
      target.silencedTurns = 5;
      io.to(target.id).emit('silenced', { turns: 5 });
    }
  }

  // --- Lord Vampire transform (every 2 turns, garlic already handled above) ---
  const vampireActionFinal = room.nightActions['vampire_transform'];
  if (vampireActionFinal && room.turn % 2 === 0) {
    const target = room.players[vampireActionFinal.targetId];
    const vampireCount = Object.values(room.players).filter(p => p.role === ROLES.VAMPIRE && p.isAlive).length;
    if (target && !target.isMonster && vampireCount < 5) {
      target.role = ROLES.VAMPIRE;
      target.isMonster = true;
      io.to(target.id).emit('transformed', { newRole: ROLES.VAMPIRE });
      const monsterList = Object.values(room.players)
        .filter(p => MONSTER_ROLES.includes(p.role) && p.isAlive)
        .map(p => ({ id: p.id, name: p.name, role: p.role }));
      monsterList.forEach(m => io.to(m.id).emit('monster_team', { monsters: monsterList }));
      room.log.push(`${target.name} was transformed into a Vampire!`);
    }
  }

  // --- Tick silenced turns ---
  Object.values(room.players).forEach(p => {
    if (p.silencedTurns > 0) {
      p.silencedTurns--;
      if (p.silencedTurns === 0) p.canVote = true;
    }
  });

  room.nightActions = {};
  room.phase = 'day';
  room.turn++;

  const victory = checkVictory(room.players);
  if (victory) return endGame(room, code, victory);

  io.to(code).emit('phase_change', {
    phase: 'day',
    turn: room.turn,
    eliminated,
    log: room.log.slice(-5),
    alivePlayers: Object.values(room.players).filter(p => p.isAlive).map(p => ({ id: p.id, name: p.name })),
  });
}

function resolveVote(room, code) {
  const tally = {};
  Object.values(room.votes).forEach(targetId => {
    tally[targetId] = (tally[targetId] || 0) + 1;
  });

  const maxVotes = Math.max(...Object.values(tally));
  const candidates = Object.keys(tally).filter(id => tally[id] === maxVotes);
  // Tie: no one is eliminated
  if (candidates.length > 1) {
    room.votes = {};
    const victory = checkVictory(room.players);
    if (victory) return endGame(room, code, victory);
    room.phase = 'night';
    io.to(code).emit('vote_result', {
      eliminated: null,
      tie: true,
      alivePlayers: Object.values(room.players).filter(p => p.isAlive).map(p => ({ id: p.id, name: p.name })),
    });
    setTimeout(() => io.to(code).emit('phase_change', { phase: 'night', turn: room.turn }), 6000);
    return;
  }

  const eliminatedId = candidates[0];
  const eliminated = room.players[eliminatedId];

  if (eliminated) {
    eliminated.isAlive = false;

    // Siblings: if one sibling dies, the other dies too
    if (eliminated.role === ROLES.SIBLINGS) {
      const otherSibling = Object.values(room.players).find(
        p => p.role === ROLES.SIBLINGS && p.isAlive && p.id !== eliminatedId
      );
      if (otherSibling) {
        otherSibling.isAlive = false;
        io.to(code).emit('sibling_died', { name: otherSibling.name });
      }
    }

    // If Lord Vampire dies, all vampires die
    if (eliminated.role === ROLES.LORD_VAMPIRE) {
      Object.values(room.players).forEach(p => {
        if (p.role === ROLES.VAMPIRE && p.isAlive) {
          p.isAlive = false;
          io.to(p.id).emit('vampire_lord_dead');
        }
      });
    }
  }

  room.votes = {};
  const victory = checkVictory(room.players);
  if (victory) return endGame(room, code, victory);

  room.phase = 'night';
  io.to(code).emit('vote_result', {
    eliminated: eliminated ? { id: eliminated.id, name: eliminated.name, role: eliminated.role, isMonster: eliminated.isMonster } : null,
    alivePlayers: Object.values(room.players).filter(p => p.isAlive).map(p => ({ id: p.id, name: p.name })),
  });

  setTimeout(() => {
    io.to(code).emit('phase_change', { phase: 'night', turn: room.turn });
  }, 6000);
}

function endGame(room, code, winner) {
  room.phase = 'ended';
  io.to(code).emit('game_over', {
    winner,
    players: Object.values(room.players).map(p => ({ name: p.name, role: p.role, isAlive: p.isAlive })),
  });
}

server.listen(3001, '0.0.0.0', () => console.log('Monster School server running on port 3001'));
