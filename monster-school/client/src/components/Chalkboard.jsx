import { useEffect, useState } from 'react';

export default function Chalkboard({ lines = [], onDone, children }) {
  const [visibleLines, setVisibleLines] = useState([]);

  useEffect(() => {
    setVisibleLines([]);
    lines.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines(prev => [...prev, i]);
        if (i === lines.length - 1 && onDone) setTimeout(onDone, 600);
      }, i * 500);
    });
  }, [lines.join('|')]);

  return (
    <div className="cb-frame">
      <div className="cb-board">
        <div className="cb-tray" />
        {/* chalk dust spots */}
        <span className="cb-dust" style={{ top: '12%', left: '8%' }} />
        <span className="cb-dust" style={{ top: '70%', left: '85%' }} />
        <span className="cb-dust" style={{ top: '40%', left: '92%' }} />

        <div className="cb-content">
          {lines.length > 0
            ? lines.map((line, i) => (
                <p
                  key={i}
                  className={`cb-line ${visibleLines.includes(i) ? 'cb-line-visible' : ''}`}
                  style={{ animationDelay: `${i * 0.5}s` }}
                >
                  {line}
                </p>
              ))
            : children}
        </div>
      </div>
    </div>
  );
}
