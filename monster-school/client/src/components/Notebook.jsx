import { useState, useEffect, useRef } from 'react';

const QUICK_MESSAGES = [
  "I'm not the monster!",
  "I think it's you.",
  "Trust me, I'm a student.",
  "That's suspicious...",
  "I saw something last night.",
  "Vote them out!",
  "I have no idea who it is.",
  "Leave me alone!",
  "We need to discuss this.",
  "I'm innocent!",
];

export default function Notebook({ myName, messages, onSend }) {
  const [open, setOpen] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) {
      setHasNew(false);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (messages.length > 0) {
      setHasNew(true);
    }
  }, [messages.length, open]);

  return (
    <>
      {/* Tab button */}
      <button className="notebook-tab" onClick={() => setOpen(o => !o)}>
        📓 Chat {hasNew && !open && <span className="notebook-badge">!</span>}
      </button>

      {open && (
        <div className="notebook-overlay" onClick={() => setOpen(false)}>
          <div className="notebook-book" onClick={e => e.stopPropagation()}>
            {/* Espiral */}
            <div className="notebook-spiral">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="notebook-ring" />
              ))}
            </div>

            <div className="notebook-inner">
              <div className="notebook-header">
                <span>📓 Class Discussion</span>
                <button className="notebook-close" onClick={() => setOpen(false)}>✕</button>
              </div>

              {/* Mensajes */}
              <div className="notebook-messages">
                {messages.length === 0 && (
                  <p className="notebook-empty">No messages yet...</p>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`notebook-msg ${m.name === myName ? 'notebook-msg-me' : ''}`}>
                    <span className="notebook-msg-name">{m.name === myName ? 'You' : m.name}:</span>
                    <span className="notebook-msg-text">{m.message}</span>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Botones predeterminados */}
              <div className="notebook-quick">
                {QUICK_MESSAGES.map((msg, i) => (
                  <button
                    key={i}
                    className="notebook-quick-btn"
                    onClick={() => onSend(msg)}
                  >
                    {msg}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
