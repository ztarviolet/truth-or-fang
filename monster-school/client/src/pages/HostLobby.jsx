import { useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useSound } from '../hooks/useSound';

const CLIENT_URL = import.meta.env.VITE_SERVER_URL
  ? import.meta.env.VITE_SERVER_URL.replace(':3001', ':5173')
  : window.location.origin;

export default function HostLobby({ code, players, onStart, onBack }) {
  const joinUrl = `${CLIENT_URL}?join=${code}`;
  const { playPop, playJoin } = useSound();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    if (players.length > 0) playJoin();
  }, [players.length]);

  return (
    <div className="screen center">
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
        <div className="player-grid">
          {players.map(p => (
            <span key={p.id} className="player-chip pop">{p.name}</span>
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
  );
}
