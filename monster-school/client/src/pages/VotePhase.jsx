import { useState } from 'react';

export default function VotePhase({ alivePlayers, myId, canVote, emit, code }) {
  const [voted, setVoted] = useState(null);

  const handleVote = (targetId) => {
    if (voted || !canVote) return;
    setVoted(targetId);
    emit('cast_vote', { code, targetId });
  };

  const targets = alivePlayers.filter(p => p.id !== myId);

  return (
    <div className="screen center">
      <div className="phase-header vote">
        <h2>🗳️ Vote!</h2>
        <p className="hint">"Who is the monster?"</p>
      </div>

      {!canVote && (
        <div className="silenced-banner">🤐 You are silenced and cannot vote this round.</div>
      )}

      {canVote && !voted && (
        <div className="player-grid large">
          {targets.map(p => (
            <button
              key={p.id}
              className="player-chip selectable vote-btn"
              onClick={() => handleVote(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {voted && (
        <div className="voted-confirm">
          ✅ You voted. Waiting for results...
        </div>
      )}
    </div>
  );
}
