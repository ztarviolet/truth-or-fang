const PHRASES = {
  accuse: [
    'He is a monster!', 'She is suspicious.', 'They are monsters.',
    'You are the monster!', 'You are nervous.', 'You are his/her accomplice.',
    'You have an alliance.', "He didn't speak at all during the game.",
  ],
  defend: [
    'I am not a monster.', 'He is my friend.', 'She is innocent.',
    'We are students.', 'Your argument is very bad and lacks structure.',
    "You don't have any proof.",
    'Why are you trying to blame me? Is this to cover for you?',
  ],
  ask: [
    'Are you the monster?', 'Is he a monster?', 'Is she a student?',
    'Are they monsters?', 'Why are you protecting her/him?',
  ],
};

export default function DayPhase({ eliminated, alivePlayers, isHost, onAdvance, log }) {
  return (
    <div className="screen">
      <div className="phase-header day">
        <h2>☀️ Day Phase</h2>
        <p className="hint">"Good morning, Monster School!"</p>
      </div>

      {eliminated ? (
        <div className="eliminated-banner">
          💀 <strong>{eliminated.name}</strong> was eliminated last night!
          <span className="role-reveal"> They were: {eliminated.role}</span>
        </div>
      ) : (
        <div className="safe-banner">🌟 Everyone survived the night!</div>
      )}

      <div className="alive-list">
        <p className="label">Alive ({alivePlayers.length})</p>
        <div className="player-grid">
          {alivePlayers.map(p => (
            <span key={p.id} className="player-chip">{p.name}</span>
          ))}
        </div>
      </div>

      <div className="phrases-panel">
        {Object.entries(PHRASES).map(([type, list]) => (
          <div key={type} className="phrase-group">
            <p className="label">{type.charAt(0).toUpperCase() + type.slice(1)}</p>
            <div className="phrase-list">
              {list.map((ph, i) => <span key={i} className="phrase-chip">{ph}</span>)}
            </div>
          </div>
        ))}
      </div>

      {isHost && (
        <button className="btn btn-primary sticky-btn" onClick={onAdvance}>
          🗳️ Start Vote
        </button>
      )}
    </div>
  );
}
