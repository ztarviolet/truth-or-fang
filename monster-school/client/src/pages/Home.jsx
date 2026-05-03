import { useState } from 'react';
import { useSound } from '../hooks/useSound';

export default function Home({ onHost, onJoin, initialMode }) {
  const params = new URLSearchParams(window.location.search);
  const joinCode = params.get('join') || '';
  const [name, setName] = useState('');
  const [code, setCode] = useState(joinCode);
  const [mode, setMode] = useState(initialMode || (joinCode ? 'join' : null));
  const { playPop } = useSound();

  const handleHost = () => {
    if (name.trim()) onHost(name.trim());
  };

  const handleJoin = () => {
    if (name.trim() && code.trim()) onJoin(name.trim(), code.trim().toUpperCase());
  };

  return (
    <div className="screen center home">
      <div className="title-block">
        <h1>🧟 Monster School</h1>
        <p className="subtitle">Truth or Fang?</p>
      </div>

      {!mode && (
        <div className="btn-group">
          <button className="btn btn-host" onClick={() => { playPop(); setMode('host'); }}>🎓 Host a Game</button>
          <button className="btn btn-join" onClick={() => { playPop(); setMode('join'); }}>🎮 Join Game</button>
        </div>
      )}

      {mode && (
        <div className="card">
          <input
            className="input"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={20}
          />
          {mode === 'join' && (
            <input
              className="input"
              placeholder="Room code"
              value={code}
              onChange={e => setCode(e.target.value)}
              maxLength={6}
            />
          )}
          <div className="btn-group">
            <button className="btn btn-secondary" onClick={() => { playPop(); setMode(null); }}>← Back</button>
            <button
              className="btn btn-primary"
              onClick={() => { playPop(); mode === 'host' ? handleHost() : handleJoin(); }}
            >
              {mode === 'host' ? 'Create Room' : 'Join Room'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
