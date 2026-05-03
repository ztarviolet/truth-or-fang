import { useSound } from '../hooks/useSound';

export default function PlayerLobby({ code, name, players, onLeave, hostLeft, hostName }) {
  const { playPop } = useSound();

  return (
    <div className="screen center">
      <h2>🎮 Waiting Room</h2>
      <p className="label">Room: <strong>{code}</strong></p>
      <p className="label">You are: <strong>{name}</strong></p>

      <div className="player-list">
        <p className="label">Host</p>
        <div className="player-grid">
          {hostName
            ? <span className="player-chip host">🎓 {hostName}</span>
            : <span className="player-chip">...</span>
          }
        </div>
      </div>

      <div className="player-list">
        <p className="label">Players ({players.length})</p>
        <div className="player-grid">
          {players.map(p => (
            <span key={p.id} className={`player-chip ${p.name === name ? 'me' : ''}`}>
              {p.name} {p.name === name ? '(you)' : ''}
            </span>
          ))}
        </div>
      </div>

      {hostLeft
        ? <p className="waiting-text">🚪 The host has left the room. Returning to home...</p>
        : <p className="waiting-text">⏳ Waiting for host to start...</p>
      }

      {!hostLeft && <button className="btn btn-secondary" onClick={() => { playPop(); onLeave(); }}>← Leave Room</button>}
    </div>
  );
}
