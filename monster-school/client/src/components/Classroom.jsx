const COLORS = ['#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6','#1abc9c','#e67e22','#e91e63','#00bcd4','#8bc34a','#ff5722','#607d8b'];

export function Crewmate({ color = '#4fc3f7', dead = false, isHost = false, selected = false, size = 1, roleSkin = null }) {
  const w = 38 * size, h = 48 * size;
  const c = selected ? '#e74c3c' : color;
  const isVampire = roleSkin === 'Vampire' || roleSkin === 'Lord Vampire';
  return (
    <svg width={w} height={h} viewBox="0 0 38 48" fill="none"
      style={{
        opacity: dead ? 0.3 : 1,
        filter: selected
          ? 'drop-shadow(0 0 8px #e74c3c)'
          : dead
            ? 'grayscale(1)'
            : `drop-shadow(0 2px 4px rgba(0,0,0,0.5))`,
        transition: 'filter 0.2s, opacity 0.2s',
      }}>
      {/* sombra cuerpo */}
      <ellipse cx="19" cy="44" rx="11" ry="3" fill="rgba(0,0,0,0.3)" />
      {isVampire && (
        <path d="M7 22 C3 28 4 39 14 44 L19 37 L24 44 C34 39 35 28 31 22 C28 27 25 30 19 30 C13 30 10 27 7 22Z" fill="#3a153f" opacity="0.92" />
      )}
      {/* cuerpo */}
      <ellipse cx="19" cy="30" rx="13" ry="14" fill={c} />
      {roleSkin === 'Mommy' && (
        <>
          <path d="M8 27 C14 24 23 24 30 27" stroke="#efe0bd" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          <path d="M7 32 C14 35 23 35 31 32" stroke="#d9c79f" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
          <path d="M10 37 C16 39 22 39 28 37" stroke="#efe0bd" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
        </>
      )}
      {/* highlight cuerpo */}
      <ellipse cx="14" cy="24" rx="4" ry="6" fill="rgba(255,255,255,0.12)" />
      {roleSkin === 'Wolfman' && (
        <>
          <path d="M8 9 L12 0 L17 9Z" fill={c} stroke="#3b2510" strokeWidth="1.2" />
          <path d="M21 9 L26 0 L30 10Z" fill={c} stroke="#3b2510" strokeWidth="1.2" />
          <path d="M12 5 L13.5 9 L10.5 9Z" fill="#f0c99a" opacity="0.8" />
          <path d="M26 5 L27.5 9 L24.5 9Z" fill="#f0c99a" opacity="0.8" />
        </>
      )}
      {/* cabeza */}
      <ellipse cx="19" cy="16" rx="12" ry="11" fill={c} />
      {roleSkin === 'Mommy' && (
        <>
          <path d="M9 13 C15 10 23 10 29 13" stroke="#efe0bd" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          <path d="M8 18 C15 21 23 21 30 18" stroke="#d9c79f" strokeWidth="2" strokeLinecap="round" opacity="0.88" />
        </>
      )}
      {/* highlight cabeza */}
      <ellipse cx="14" cy="11" rx="4" ry="4" fill="rgba(255,255,255,0.15)" />
      {/* visor */}
      <ellipse cx="21" cy="14" rx="7" ry="5" fill="#a8d8f0" opacity="0.95" />
      <ellipse cx="22" cy="13" rx="3" ry="2.5" fill="white" opacity="0.6" />
      {isVampire && (
        <>
          <path d="M17 18 L19 24 L21 18Z" fill="#fff7e8" />
          <path d="M22 18 L24 24 L26 18Z" fill="#fff7e8" />
        </>
      )}
      {roleSkin === 'Lord Vampire' && (
        <path d="M11 6 L14 1 L19 5 L24 1 L27 6 L25 9 L13 9Z" fill="#ffd166" stroke="#8a5a00" strokeWidth="1" />
      )}
      {/* mochila */}
      <rect x="29" y="23" width="7" height="11" rx="3" fill={isHost ? '#ffd166' : '#1a4a6e'} />
      <rect x="30" y="25" width="5" height="7" rx="2" fill={isHost ? '#ffb300' : '#0d2d45'} />
      {roleSkin === 'Mommy' && (
        <path d="M33 20 C36 18 38 20 36 23 C34 25 31 24 32 21Z" fill="#efe0bd" stroke="#b7a071" strokeWidth="1" />
      )}
      {/* piernas */}
      <rect x="12" y="41" width="6" height="7" rx="3" fill={c} />
      <rect x="20" y="41" width="6" height="7" rx="3" fill={c} />
      {/* sombra piernas */}
      <rect x="12" y="45" width="6" height="3" rx="2" fill="rgba(0,0,0,0.2)" />
      <rect x="20" y="45" width="6" height="3" rx="2" fill="rgba(0,0,0,0.2)" />
    </svg>
  );
}

function Seat({ player, myId, index, onClick, selected, isVoting, roleSkin }) {
  const isMe = player?.id === myId;
  const color = COLORS[index % COLORS.length];
  const rowDepth = Math.floor(index / 4); // 0=front, 1=mid, 2=back
  const scale = 1 - rowDepth * 0.08;
  const brightness = 1 - rowDepth * 0.12;

  return (
    <div
      className={`seat-wrapper ${isVoting && !isMe ? 'seat-votable' : ''} ${selected ? 'seat-selected' : ''}`}
      style={{ transform: `scale(${scale})`, filter: `brightness(${brightness})`, animationDelay: `${index * 90}ms` }}
      onClick={onClick}
    >
      {/* monito */}
      <div className="seat-crewmate">
        <Crewmate color={color} selected={selected} size={1} roleSkin={roleSkin} />
        <span className={`seat-name ${isMe ? 'seat-name-me' : ''} ${selected ? 'seat-name-selected' : ''}`}>
          {player.name}{isMe ? ' 👤' : ''}
        </span>
      </div>
      <div className="seat-desk">
        <div className="seat-desk-top">
          <span className="seat-notebook" />
          <span className="seat-pencil" />
        </div>
        <div className="seat-desk-front" />
        <div className="seat-metal seat-metal-l" />
        <div className="seat-metal seat-metal-r" />
        <div className="seat-chair-back" />
        <div className="seat-chair-seat" />
        <div className="seat-chair-leg seat-chair-leg-l" />
        <div className="seat-chair-leg seat-chair-leg-r" />
      </div>
    </div>
  );
}

function ClassroomDecor() {
  return (
    <>
      <div className="classroom-window">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="classroom-clock">
        <span className="clock-hand clock-hour" />
        <span className="clock-hand clock-minute" />
      </div>
      <div className="classroom-poster poster-rules">
        <span>ABC</span>
        <i />
        <i />
      </div>
      <div className="classroom-poster poster-moon">
        <span />
      </div>
      <div className="classroom-bookshelf">
        {Array.from({ length: 10 }).map((_, i) => <span key={i} style={{ '--book': i }} />)}
      </div>
      <div className="classroom-lockers">
        {Array.from({ length: 4 }).map((_, i) => <span key={i} />)}
      </div>
      <div className="classroom-trash">
        <span />
      </div>
    </>
  );
}

export default function Classroom({ players = [], hostName = '', myId = null, onSeatClick = null, selectedId = null, isVoting = false, boardContent = null, roleSkins = {} }) {
  const rows = [];
  for (let i = 0; i < players.length; i += 4) rows.push(players.slice(i, i + 4));

  return (
    <div className="classroom-room">
      {/* Pared + pizarrón */}
      <div className="classroom-wall">
        <ClassroomDecor />
        <div className="classroom-blackboard">
          <div className="cb-board-inner">
            {boardContent
              ? boardContent
              : <span className="classroom-board-text">🧟 Monster School</span>
            }
          </div>
          <div className="cb-tray-bar" />
        </div>
      </div>

      {/* Escritorio del maestro */}
      <div className="classroom-teacher-row">
        <div className="classroom-teacher-desk-3d">
          <div className="teacher-desk-top">
            <div className="teacher-desk-front" />
          </div>
          <div className="teacher-crewmate-wrap">
            <Crewmate color="#ffd166" isHost size={1.1} />
            <span className="teacher-name-tag">{hostName || 'Host'}</span>
          </div>
        </div>
      </div>

      {/* Filas de butacas */}
      <div className="classroom-floor">
        {rows.map((row, ri) => (
          <div key={ri} className="classroom-row" style={{ '--row': ri }}>
            {row.map((p, ci) => {
              const idx = ri * 4 + ci;
              return (
                <Seat
                  key={p.id}
                  player={p}
                  myId={myId}
                  index={idx}
                  selected={selectedId === p.id}
                  isVoting={isVoting}
                  roleSkin={roleSkins[p.id]}
                  onClick={() => onSeatClick && onSeatClick(p)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
