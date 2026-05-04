import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useSound } from '../hooks/useSound';

const CLIENT_URL = import.meta.env.VITE_SERVER_URL
  ? import.meta.env.VITE_SERVER_URL.replace(':3001', ':5173')
  : window.location.origin;

export default function HostLobby({ code, players, onStart, onBack }) {
  const joinUrl = `${CLIENT_URL}?join=${code}`;
  const { playPop, playJoin, playDescanso, stopDescanso } = useSound();
  const isFirst = useRef(true);
  const [lanternPos, setLanternPos] = useState({ x: 20, y: 30 });
  const [intro, setIntro] = useState(true);
  const animRef = useRef(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    playDescanso();
    return () => stopDescanso();
  }, []);

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    if (players.length > 0) playJoin();
  }, [players.length]);

  useEffect(() => {
    const duration = 3000;
    const animate = () => {
      const t = (Date.now() - startTime.current) / duration;
      if (t >= 1) { setIntro(false); return; }
      // figura de 8 lenta por el fondo
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
      <h2>🏫 Monster School Lobby</h2>

      <div className="room-code-block">
        <p className="label">Room Code</p>
        <h1 className="room-code">{code}</h1>
      </div>

      <div className="qr-block">
        <QRCodeSVG value={joinUrl} size={160} bgColor="#1a1a2e" fgColor="#e0c97f" />
        <p className="qr-hint">Scan to join</p>
      </div>

      <button className="btn btn-secondary" onClick={() => { playPop(); onBack(); }}>🚪 Close Room</button>

      <div className="player-list">
        <p className="label">Players ({players.length})</p>
        <div className="notebook">
          {players.map((p, i) => (
            <div key={p.id} className="notebook-line pop">
              <span className="notebook-num">{i + 1}.</span>
              <span className="notebook-name">{p.name}</span>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 6 - players.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="notebook-line empty" />
          ))}
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={onStart}
        disabled={players.length < 6}
      >
        {players.length < 6 ? `Need ${6 - players.length} more players` : '🧛 Start Game'}
      </button>
      </div>
    </div>
  );
}
