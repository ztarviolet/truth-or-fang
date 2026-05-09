import { useEffect } from 'react';
import Chalkboard from '../components/Chalkboard';

export default function VoteResult({ result, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 6000);
    return () => clearTimeout(t);
  }, []);

  const { eliminated, tie } = result || {};

  return (
    <div className="screen center" style={{ background: '#1a1a1a' }}>
      <Chalkboard>
        <div className="chalk-emoji">🗳️</div>
        <h2 className="chalk-title">Vote Result</h2>
        <div className="board-divider">— — — — — — —</div>
        {tie ? (
          <p className="chalk-desc" style={{ color: '#ffd166' }}>🤝 It's a tie! No one was eliminated.</p>
        ) : eliminated ? (
          <>
            <div className="chalk-emoji" style={{ fontSize: '2rem' }}>☠️</div>
            <p className="chalk-desc">
              <strong style={{ color: '#ff6b6b' }}>{eliminated.name}</strong> was eliminated by vote.
            </p>
            <p className="chalk-instruction">
              They were: <strong>{eliminated.role}</strong>
            </p>
            <div className={`chalk-badge ${eliminated.isMonster ? 'monster' : 'normie'}`} style={{ marginTop: 8 }}>
              {eliminated.isMonster ? '👹 MONSTER' : '🧑‍🎓 STUDENT'}
            </div>
          </>
        ) : (
          <p className="chalk-desc" style={{ color: '#80ffdb' }}>No one was eliminated.</p>
        )}
        <p className="chalk-hint" style={{ marginTop: 16, opacity: 0.6 }}>Night begins soon...</p>
      </Chalkboard>
    </div>
  );
}
