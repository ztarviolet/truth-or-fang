export default function GameOver({ winner, players }) {
  const isMonsterWin = winner === 'monsters';

  return (
    <div className="screen center">
      <div className={`gameover-banner ${isMonsterWin ? 'monsters-win' : 'normies-win'}`}>
        {isMonsterWin ? '👹 Monsters Win!' : '🎓 Normies Win!'}
      </div>

      <p className="gameover-subtitle">
        {isMonsterWin
          ? 'The monsters have taken over Monster School...'
          : 'The students have expelled all monsters!'}
      </p>

      <div className="final-list">
        <p className="label">Final Roles</p>
        {players.map((p, i) => (
          <div key={i} className={`final-player ${p.isAlive ? 'alive' : 'dead'}`}>
            <span>{p.isAlive ? '✅' : '💀'} {p.name}</span>
            <span className="role-tag">{p.role}</span>
          </div>
        ))}
      </div>

      <button className="btn btn-primary" onClick={() => window.location.reload()}>
        🔄 Play Again
      </button>
    </div>
  );
}
