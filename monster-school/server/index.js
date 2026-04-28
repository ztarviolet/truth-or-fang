const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { assignRoles, checkVictory, ROLES, MONSTER_ROLES } = require('./gameLogic');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

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
        room.players[socket.id].isAlive = false;
        io.to(code).emit('player_disconnected', { id: socket.id, name: room.players[socket.id].name });
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
  let eliminated = null;

  if (killAction) {
    const target = room.players[killAction.targetId];
    const protectAction = room.nightActions['protect'];

    if (protectAction && protectAction.targetId === killAction.targetId && room.protectorSaves > 0) {
      room.protectorSaves--;
      room.log.push(`${target.name} was saved by The Protector!`);
    } else if (target && target.isAlive) {
      target.isAlive = false;
      eliminated = { id: target.id, name: target.name, role: target.role };
      room.log.push(`${target.name} was eliminated at night.`);
    }
  }

  // Handle Mommy silencing
  const mommyAction = room.nightActions['mommy_silence'];
  if (mommyAction) {
    const target = room.players[mommyAction.targetId];
    if (target) {
      target.canVote = false;
      target.silencedTurns = 5;
      io.to(target.id).emit('silenced', { turns: 5 });
    }
  }

  // Handle Lord Vampire transform (every 2 turns)
  const vampireAction = room.nightActions['vampire_transform'];
  if (vampireAction && room.turn % 2 === 0) {
    const target = room.players[vampireAction.targetId];
    const vampireCount = Object.values(room.players).filter(p => p.role === ROLES.VAMPIRE && p.isAlive).length;
    if (target && !target.isMonster && vampireCount < 5) {
      target.role = ROLES.VAMPIRE;
      target.isMonster = true;
      io.to(target.id).emit('transformed', { newRole: ROLES.VAMPIRE });
      room.log.push(`${target.name} was transformed into a Vampire!`);
    }
  }

  // Tick silenced turns
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
    alivePlayers: Object.values(room.players)
      .filter(p => p.isAlive)
      .map(p => ({ id: p.id, name: p.name })),
  });
}

function resolveVote(room, code) {
  const tally = {};
  Object.values(room.votes).forEach(targetId => {
    tally[targetId] = (tally[targetId] || 0) + 1;
  });

  const maxVotes = Math.max(...Object.values(tally));
  const candidates = Object.keys(tally).filter(id => tally[id] === maxVotes);
  const eliminatedId = candidates[Math.floor(Math.random() * candidates.length)];
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
    eliminated: eliminated ? { id: eliminated.id, name: eliminated.name, role: eliminated.role } : null,
    alivePlayers: Object.values(room.players)
      .filter(p => p.isAlive)
      .map(p => ({ id: p.id, name: p.name })),
  });

  setTimeout(() => {
    io.to(code).emit('phase_change', { phase: 'night', turn: room.turn });
  }, 5000);
}

function endGame(room, code, winner) {
  room.phase = 'ended';
  io.to(code).emit('game_over', {
    winner,
    players: Object.values(room.players).map(p => ({ name: p.name, role: p.role, isAlive: p.isAlive })),
  });
}

server.listen(3001, () => console.log('Monster School server running on port 3001'));
