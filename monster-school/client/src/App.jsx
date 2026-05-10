import { useEffect, useState } from 'react';
import { useSocket } from './hooks/useSocket';
import { useSound } from './hooks/useSound';
import Home from './pages/Home';
import MoonLoading from './pages/MoonLoading';
import QuestionCard from './pages/QuestionCard';
import HostLobby from './pages/HostLobby';
import PlayerLobby from './pages/PlayerLobby';
import RoleCard from './pages/RoleCard';
import NightPhase from './pages/NightPhase';
import DayPhase from './pages/DayPhase';
import VotePhase from './pages/VotePhase';
import GameOver from './pages/GameOver';
import NightResult from './pages/NightResult';
import VoteResult from './pages/VoteResult';
import './App.css';

export default function App() {
  const { emit, on, socketId } = useSocket();
  const { playHalloween, stopHalloween, playBeep } = useSound();

  const [screen, setScreen] = useState('home');
  const [showMoon, setShowMoon] = useState(false);
  const [pendingScreen, setPendingScreen] = useState(null);
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
  const [chatMessages, setChatMessages] = useState([]);
  const [disconnectMsg, setDisconnectMsg] = useState('');
  const [nightEliminated, setNightEliminated] = useState(null);
  const [voteResult, setVoteResult] = useState(null);

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
        setShowMoon(true);
      }),
      on('joined', ({ code }) => {
        setRoomCode(code);
        setScreen('playerLobby');
        setShowMoon(true);
      }),
      on('lobby_update', ({ players, hostName }) => { setPlayers(players); if (hostName) setLobbyHostName(hostName); }),
      on('role_assigned', ({ role, bonusCard }) => {
        setMyRole(role);
        setMyBonus(bonusCard);
        setBonusUsed(false);
        setFading(true);
        setTimeout(() => setScreen('escritorio'), 2500);
        setTimeout(() => setScreen('roleCard'), 6000);
        setTimeout(() => setScreen('question'), 9500);
      }),
      on('monster_team', ({ monsters }) => setMonsterTeam(monsters)),
      on('chat_message', (msg) => setChatMessages(prev => [...prev, msg])),
      on('phase_change', ({ phase, turn, eliminated, alivePlayers }) => {
        setPhase(phase);
        setTurn(turn);
        if (alivePlayers) setAlivePlayers(alivePlayers);
        if (phase === 'night') setScreen('night');
        if (phase === 'day') {
          setChatMessages([]);
          setNightEliminated(eliminated || null);
          setScreen('nightResult');
        }
        if (phase === 'vote') setScreen('vote');
      }),
      on('vote_result', ({ eliminated, alivePlayers, tie }) => {
        if (alivePlayers) setAlivePlayers(alivePlayers);
        setVoteResult({ eliminated, tie });
        setScreen('voteResult');
      }),
      on('transformed', ({ newRole }) => {
        setMyRole(newRole);
        setScreen('transformedCard');
      }),
      on('garlic_activated', () => {
        setError('🧄 Your Garlic Necklace blocked the vampire transformation!');
      }),
      on('transform_blocked', ({ targetName }) => {
        setError(`🧄 ${targetName} had a Garlic Necklace — transformation blocked!`);
      }),
      on('shield_activated', () => {
        setError('🛡️ Silver Shield activated! The target is protected tonight.');
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
      on('player_disconnected', ({ name }) => {
        playBeep();
        setDisconnectMsg(`${name} has disconnected`);
        setTimeout(() => setDisconnectMsg(''), 4000);
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

  const handleSendChat = (message) => emit('chat_message', { code: roomCode, message });

  const handleStart = () => {
    setFading(true);
    setTimeout(() => emit('start_game', { code: roomCode }), 2500);
  };
  const handleAdvancePhase = () => emit('advance_phase', { code: roomCode });

  const afterRoleCard = () => setScreen(phase === 'night' ? 'night' : 'day');

  return (
    <div className="app">
      {showMoon && (
        <MoonLoading onDone={() => { setShowMoon(false); stopHalloween(); }} />
      )}
      {fading && <div className="school-fade" />}
      {error && <div className="error-toast" onClick={() => setError('')}>⚠️ {error}</div>}
      {disconnectMsg && (
        <div className="disconnect-toast">🔌 {disconnectMsg}</div>
      )}
      {inspectorResult && (
        <div className="inspector-toast" onClick={() => setInspectorResult(null)}>
          🔍 {inspectorResult.pronoun} is {inspectorResult.result}
        </div>
      )}

      {screen === 'home' && <Home onHost={handleHost} onJoin={handleJoin} initialMode={backMode} />}
      {screen === 'hostLobby' && <HostLobby code={roomCode} players={players} onStart={handleStart} onBack={() => { emit('close_room', { code: roomCode }); setScreen('home'); setRoomCode(''); setPlayers([]); setIsHost(false); setBackMode(null); }} />}
      {screen === 'playerLobby' && <PlayerLobby code={roomCode} name={myName} players={players} hostName={lobbyHostName} hostLeft={hostLeft} onLeave={() => { setScreen('home'); setRoomCode(''); setPlayers([]); setHostLeft(false); setLobbyHostName(''); }} />}
      {screen === 'escritorio' && <div className="escritorio-reveal" />}
      {screen === 'roleCard' && <RoleCard role={myRole} bonusCard={myBonus} onConfirm={afterRoleCard} />}
      {screen === 'transformedCard' && <RoleCard role={myRole} bonusCard={myBonus} onConfirm={() => setScreen('night')} />}
      {screen === 'nightResult' && (
        <NightResult
          eliminated={nightEliminated}
          onDone={() => setScreen('day')}
        />
      )}
      {screen === 'voteResult' && (
        <VoteResult
          result={voteResult}
          onDone={() => setScreen('night')}
        />
      )}
      {screen === 'question' && <QuestionCard onDone={afterRoleCard} />}
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
          hostName={lobbyHostName}
          players={players}
        />
      )}
      {screen === 'day' && (
        <DayPhase
          eliminated={nightEliminated}
          alivePlayers={alivePlayers}
          isHost={isHost}
          onAdvance={handleAdvancePhase}
          role={myRole}
          myBonus={myBonus}
          monsterTeam={monsterTeam}
          hostName={lobbyHostName}
          myId={socketId()}
          myName={myName}
          chatMessages={chatMessages}
          onSendChat={handleSendChat}
        />
      )}
      {screen === 'vote' && (
        <VotePhase
          alivePlayers={alivePlayers}
          myId={socketId()}
          canVote={canVote}
          emit={emit}
          code={roomCode}
          role={myRole}
          myBonus={myBonus}
          monsterTeam={monsterTeam}
          hostName={lobbyHostName}
          myName={myName}
          chatMessages={chatMessages}
          onSendChat={handleSendChat}
        />
      )}
      {screen === 'gameOver' && gameOverData && (
        <GameOver winner={gameOverData.winner} players={gameOverData.players} />
      )}
    </div>
  );
}
