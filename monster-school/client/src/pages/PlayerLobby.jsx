import { useSound } from '../hooks/useSound';

export default function PlayerLobby({ code, name, players, onLeave, hostLeft, hostName }) {
  const { playPop } = useSound();

  return (
    <div className="screen center lobby-bg">
      <div className="lobby-content">
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
              <div key={p.id} className="notebook-line">
                <span className="notebook-num">{i + 1}.</span>
                <span key={`${p.id}-name`} className="notebook-name pencil-write">
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
