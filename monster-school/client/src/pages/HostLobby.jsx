import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useSound } from '../hooks/useSound';

export default function HostLobby({ code, players, onStart, onBack }) {
  const { playPop, playJoin, playDescanso, stopDescanso } = useSound();
  const isFirst = useRef(true);
  const [networkIp, setNetworkIp] = useState(window.location.hostname);

  useEffect(() => {
    fetch(`http://${window.location.hostname}:3001/network-ip`)
      .then(r => r.json())
      .then(({ ip }) => setNetworkIp(ip))
      .catch(() => {});
  }, []);

  const joinUrl = `http://${networkIp}:5173?join=${code}`;

  useEffect(() => {
    playDescanso();
    return () => stopDescanso();
  }, []);

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    if (players.length > 0) playJoin();
  }, [players.length]);

  return (
    <div className="screen center lobby-bg">
      <div className="lobby-content">
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
              <div key={p.id} className="notebook-line">
                <span className="notebook-num">{i + 1}.</span>
                {/* amazonq-ignore-next-line */}
                <span key={`${p.id}-name`} className="notebook-name pencil-write">{p.name}</span>
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
