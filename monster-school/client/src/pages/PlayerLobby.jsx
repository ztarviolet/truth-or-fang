export default function PlayerLobby({ code, name, players }) {
  return (
    <div className="screen center">
      <h2>🎮 Waiting Room</h2>
      <p className="label">Room: <strong>{code}</strong></p>
      <p className="label">You are: <strong>{name}</strong></p>

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

      <p className="waiting-text">⏳ Waiting for host to start...</p>
    </div>
  );
}
