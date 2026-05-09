import { useEffect } from 'react';
import Chalkboard from '../components/Chalkboard';

export default function NightResult({ eliminated, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="screen center" style={{ background: '#1a1a1a' }}>
      <Chalkboard>
        <div className="chalk-emoji">🌙</div>
        <h2 className="chalk-title">Night is over</h2>
        <div className="board-divider">— — — — — — —</div>
        {eliminated ? (
          <>
            <div className="chalk-emoji" style={{ fontSize: '2rem' }}>💀</div>
            <p className="chalk-desc">
              <strong style={{ color: '#ff6b6b' }}>{eliminated.name}</strong> was eliminated during the night.
            </p>
            <p className="chalk-instruction">They were: {eliminated.role}</p>
          </>
        ) : (
          <p className="chalk-desc" style={{ color: '#80ffdb' }}>🌟 Everyone survived the night!</p>
        )}
        <p className="chalk-hint" style={{ marginTop: 16, opacity: 0.6 }}>Continuing to day phase...</p>
      </Chalkboard>
    </div>
  );
}
