import { useState, useEffect, useRef } from 'react';
import { useSound } from '../hooks/useSound';
import ZombieWalker from '../components/ZombieWalker';

export default function Home({ onHost, onJoin, initialMode }) {
  const params = new URLSearchParams(window.location.search);
  const joinCode = params.get('join') || '';
  const [name, setName] = useState('');
  const [code, setCode] = useState(joinCode);
  const [mode, setMode] = useState(initialMode || (joinCode ? 'join' : null));
  const [zombieDrop, setZombieDrop] = useState(false);
  const { playPop, playHalloween, stopAllMusic, playBeep } = useSound();
  const titleRef    = useRef(null);
  const subtitleRef = useRef(null);

  const activateMode = (m) => {
    playPop();
    setMode(m);
    setZombieDrop(true);
    setTimeout(() => setZombieDrop(false), 1000);
  };

  useEffect(() => {
    playHalloween();
    return () => stopAllMusic();
  }, []);

  const handleHost = () => {
    if (name.trim()) { onHost(name.trim()); }
  };

  const handleJoin = () => {
    if (name.trim() && code.trim()) { onJoin(name.trim(), code.trim().toUpperCase()); }
  };

  return (
    <div className="screen center home">
      <div className="title-block" style={{ position: 'relative' }}>
        <ZombieWalker titleRef={titleRef} subtitleRef={subtitleRef} dropping={zombieDrop} onHost={() => activateMode('host')} onJoin={() => activateMode('join')} />
        <h1 ref={titleRef}>{[...'🧟 Monster School'].map((l, i) => <span key={i} className={l === ' ' ? 'zw-title-space' : 'zw-title-letter'}>{l === ' ' ? '\u00a0\u00a0' : l}</span>)}</h1>
        <p className="subtitle" ref={subtitleRef}>{[...'Truth or Fang?'].map((l, i) => <span key={i} className={l === ' ' ? 'zw-sub-space' : 'zw-sub-letter'}>{l === ' ' ? '\u00a0\u00a0' : l}</span>)}</p>
      </div>

      {!mode && (
        <div className="btn-group">
          <button className="btn btn-host" onClick={() => activateMode('host')}>🎓 Host a Game</button>
          <button className="btn btn-join" onClick={() => activateMode('join')}>🎮 Join Game</button>
        </div>
      )}

      {mode && (
        <div className="card">
          <input
            className="input"
            placeholder="Your name"
            value={name}
            onChange={e => { playBeep(); setName(e.target.value); }}
            maxLength={20}
          />
          {mode === 'join' && (
            <input
              className="input"
              placeholder="Room code"
              value={code}
              onChange={e => { playBeep(); setCode(e.target.value); }}
              maxLength={6}
              readOnly={!!joinCode}
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
