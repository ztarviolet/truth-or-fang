import { useEffect, useState } from 'react';
import { useSocket } from './hooks/useSocket';
import Home from './pages/Home';
import HostLobby from './pages/HostLobby';
import PlayerLobby from './pages/PlayerLobby';
import RoleCard from './pages/RoleCard';
import NightPhase from './pages/NightPhase';
import DayPhase from './pages/DayPhase';
import VotePhase from './pages/VotePhase';
import GameOver from './pages/GameOver';
import './App.css';

export default function App() {
  const { emit, on, socketId } = useSocket();

  const [screen, setScreen] = useState('home');
  const [roomCode, setRoomCode] = useState('');
  const [myName, setMyName] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState([]);
  const [myRole, setMyRole] = useState(null);
  const [myBonus, setMyBonus] = useState(null);
  const [monsterTeam, setMonsterTeam] = useState([]);
  const [phase, setPhase] = useState('night');
  const [turn, setTurn] = useState(1);
  const [eliminated, setEliminated] = useState(null);
  const [alivePlayers, setAlivePlayers] = useState([]);
  const [canVote, setCanVote] = useState(true);
  const [gameOverData, setGameOverData] = useState(null);
  const [inspectorResult, setInspectorResult] = useState(null);
  const [error, setError] = useState('');
  const [bonusUsed, setBonusUsed] = useState(false);
  const [fading, setFading] = useState(false);
  const [hostLeft, setHostLeft] = useState(false);
  const [lobbyHostName, setLobbyHostName] = useState('');

  useEffect(() => {
    if (fading) {
      const t = setTimeout(() => setFading(false), 2500);
      return () => clearTimeout(t);
    }
  }, [fading]);

  useEffect(() => {
    const offs = [
      on('room_created', ({ code }) => {
        setRoomCode(code);
        setScreen('hostLobby');
      }),
      on('joined', ({ code }) => {
        setRoomCode(code);
        setScreen('playerLobby');
      }),
      on('lobby_update', ({ players, hostName }) => { setPlayers(players); if (hostName) setLobbyHostName(hostName); }),
      on('role_assigned', ({ role, bonusCard }) => {
        setMyRole(role);
        setMyBonus(bonusCard);
        setBonusUsed(false);
        setFading(true);
        setTimeout(() => setScreen('roleCard'), 2500);
      }),
      on('monster_team', ({ monsters }) => setMonsterTeam(monsters)),
      on('phase_change', ({ phase, turn, eliminated, alivePlayers }) => {
        setPhase(phase);
        setTurn(turn);
        if (eliminated !== undefined) setEliminated(eliminated);
        if (alivePlayers) setAlivePlayers(alivePlayers);
        if (phase === 'night') setScreen('night');
        if (phase === 'day') setScreen('day');
        if (phase === 'vote') setScreen('vote');
      }),
      on('vote_result', ({ eliminated, alivePlayers }) => {
        setEliminated(eliminated);
        if (alivePlayers) setAlivePlayers(alivePlayers);
      }),
      on('silenced', () => setCanVote(false)),
      on('inspector_result', (data) => setInspectorResult(data)),
      on('game_over', (data) => {
        setGameOverData(data);
        setScreen('gameOver');
      }),
      on('host_left', () => {
        setLobbyHostName('');
        setHostLeft(true);
        setTimeout(() => {
          setScreen('home');
          setRoomCode('');
          setPlayers([]);
          setHostLeft(false);
        }, 3000);
      }),
      on('error', (msg) => setError(msg)),
    ];
    return () => offs.forEach(off => off && off());
  }, [on]);

  const [backMode, setBackMode] = useState(null);

  const handleHost = (name) => {
    setMyName(name);
    setIsHost(true);
    setBackMode('host');
    emit('create_room', { hostName: name });
  };

  const handleJoin = (name, code) => {
    setMyName(name);
    emit('join_room', { code, name });
  };

  const handleStart = () => {
    setFading(true);
    setTimeout(() => emit('start_game', { code: roomCode }), 2500);
  };
  const handleAdvancePhase = () => emit('advance_phase', { code: roomCode });

  const afterRoleCard = () => setScreen(phase === 'night' ? 'night' : 'day');

  return (
    <div className="app">
      {fading && <div className="school-fade" />}
      {error && <div className="error-toast" onClick={() => setError('')}>⚠️ {error}</div>}
      {inspectorResult && (
        <div className="inspector-toast" onClick={() => setInspectorResult(null)}>
          🔍 {inspectorResult.pronoun} is {inspectorResult.result}
        </div>
      )}

      {screen === 'home' && <Home onHost={handleHost} onJoin={handleJoin} initialMode={backMode} />}
      {screen === 'hostLobby' && <HostLobby code={roomCode} players={players} onStart={handleStart} onBack={() => { emit('close_room', { code: roomCode }); setScreen('home'); setRoomCode(''); setPlayers([]); }} />}
      {screen === 'playerLobby' && <PlayerLobby code={roomCode} name={myName} players={players} hostName={lobbyHostName} hostLeft={hostLeft} onLeave={() => { setScreen('home'); setRoomCode(''); setPlayers([]); setHostLeft(false); setLobbyHostName(''); }} />}
      {screen === 'roleCard' && <RoleCard role={myRole} bonusCard={myBonus} onConfirm={afterRoleCard} />}
      {screen === 'night' && (
        <NightPhase
          role={myRole}
          alivePlayers={alivePlayers.length ? alivePlayers : players}
          myId={socketId()}
          monsterTeam={monsterTeam}
          turn={turn}
          emit={emit}
          code={roomCode}
          isHost={isHost}
          onAdvance={handleAdvancePhase}
          myBonus={myBonus}
          bonusUsed={bonusUsed}
          onBonusUsed={() => setBonusUsed(true)}
        />
      )}
      {screen === 'day' && (
        <DayPhase
          eliminated={eliminated}
          alivePlayers={alivePlayers}
          isHost={isHost}
          onAdvance={handleAdvancePhase}
        />
      )}
      {screen === 'vote' && (
        <VotePhase
          alivePlayers={alivePlayers}
          myId={socketId()}
          canVote={canVote}
          emit={emit}
          code={roomCode}
        />
      )}
      {screen === 'gameOver' && gameOverData && (
        <GameOver winner={gameOverData.winner} players={gameOverData.players} />
      )}
    </div>
  );
}
