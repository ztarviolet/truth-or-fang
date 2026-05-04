import { useEffect, useRef, useState } from 'react';
import { useSound } from '../hooks/useSound';

export default function PlayerLobby({ code, name, players, onLeave, hostLeft, hostName }) {
  const { playPop } = useSound();
  const [lanternPos, setLanternPos] = useState({ x: 20, y: 30 });
  const [intro, setIntro] = useState(true);
  const animRef = useRef(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const duration = 3000;
    const animate = () => {
      const t = (Date.now() - startTime.current) / duration;
      if (t >= 1) { setIntro(false); return; }
      const x = 50 + 40 * Math.sin(t * Math.PI * 2);
      const y = 50 + 30 * Math.sin(t * Math.PI * 4);
      setLanternPos({ x, y });
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="screen center lobby-bg">
      {intro && (
        <div
          className="lantern-overlay"
          style={{ '--lx': `${lanternPos.x}%`, '--ly': `${lanternPos.y}%` }}
        />
      )}
      <div className={`lobby-content ${intro ? 'hidden' : 'zoom-in'}`}>
      <h2>🎮 Waiting Room</h2>
      <p className="label">Room: <strong>{code}</strong></p>
      <p className="label">You are: <strong>{name}</strong></p>

      <div className="player-list">
        <p className="label">Host</p>
        <div className="notebook">
          <div className="notebook-line">
            <span className="notebook-num">👑</span>
            <span className="notebook-name">{hostName || '...'}</span>
          </div>
        </div>
      </div>

      <div className="player-list">
        <p className="label">Players ({players.length})</p>
        <div className="notebook">
          {players.map((p, i) => (
            <div key={p.id} className="notebook-line pop">
              <span className="notebook-num">{i + 1}.</span>
              <span className="notebook-name">
                {p.name} {p.name === name ? '(you)' : ''}
              </span>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 6 - players.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="notebook-line empty" />
          ))}
        </div>
      </div>

      {hostLeft
        ? <p className="waiting-text">🚪 The host has left the room. Returning to home...</p>
        : <p className="waiting-text">⏳ Waiting for host to start...</p>
      }

      {!hostLeft && <button className="btn btn-secondary" onClick={() => { playPop(); onLeave(); }}>← Leave Room</button>}
      </div>
    </div>
  );
}
