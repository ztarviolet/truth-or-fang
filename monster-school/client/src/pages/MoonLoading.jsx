import { useEffect, useState } from 'react';

const STARS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 2,
}));

export default function MoonLoading({ onDone }) {
  const [phase, setPhase] = useState('fade-in'); // fade-in | visible | fade-out

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('visible'), 600);
    const t2 = setTimeout(() => setPhase('fade-out'), 2800);
    const t3 = setTimeout(() => onDone(), 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className={`moon-loading ${phase}`}>
      {STARS.map(s => (
        <div
          key={s.id}
          className="moon-star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      <div className="moon-circle">🌕</div>
      <p className="moon-text">Gathering the monsters...</p>
    </div>
  );
}
