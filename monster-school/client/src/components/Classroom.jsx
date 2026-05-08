const COLORS = ['#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6','#1abc9c','#e67e22','#e91e63','#00bcd4','#8bc34a','#ff5722','#607d8b'];

export function Crewmate({ color = '#4fc3f7', dead = false, isHost = false, selected = false, size = 1 }) {
  const w = 38 * size, h = 48 * size;
  const c = selected ? '#e74c3c' : color;
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
      {/* cuerpo */}
      <ellipse cx="19" cy="30" rx="13" ry="14" fill={c} />
      {/* highlight cuerpo */}
      <ellipse cx="14" cy="24" rx="4" ry="6" fill="rgba(255,255,255,0.12)" />
      {/* cabeza */}
      <ellipse cx="19" cy="16" rx="12" ry="11" fill={c} />
      {/* highlight cabeza */}
      <ellipse cx="14" cy="11" rx="4" ry="4" fill="rgba(255,255,255,0.15)" />
      {/* visor */}
      <ellipse cx="21" cy="14" rx="7" ry="5" fill="#a8d8f0" opacity="0.95" />
      <ellipse cx="22" cy="13" rx="3" ry="2.5" fill="white" opacity="0.6" />
      {/* mochila */}
      <rect x="29" y="23" width="7" height="11" rx="3" fill={isHost ? '#ffd166' : '#1a4a6e'} />
      <rect x="30" y="25" width="5" height="7" rx="2" fill={isHost ? '#ffb300' : '#0d2d45'} />
      {/* piernas */}
      <rect x="12" y="41" width="6" height="7" rx="3" fill={c} />
      <rect x="20" y="41" width="6" height="7" rx="3" fill={c} />
      {/* sombra piernas */}
      <rect x="12" y="45" width="6" height="3" rx="2" fill="rgba(0,0,0,0.2)" />
      <rect x="20" y="45" width="6" height="3" rx="2" fill="rgba(0,0,0,0.2)" />
    </svg>
  );
}

function Seat({ player, myId, index, onClick, selected, isVoting }) {
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
        <Crewmate color={color} selected={selected} size={1} />
        <span className={`seat-name ${isMe ? 'seat-name-me' : ''} ${selected ? 'seat-name-selected' : ''}`}>
          {player.name}{isMe ? ' 👤' : ''}
        </span>
      </div>
      {/* butaca 3D */}
      <div className="seat-chair">
        <div className="seat-back" />
        <div className="seat-cushion" />
        <div className="seat-leg seat-leg-l" />
        <div className="seat-leg seat-leg-r" />
      </div>
    </div>
  );
}

export default function Classroom({ players = [], hostName = '', myId = null, onSeatClick = null, selectedId = null, isVoting = false, boardContent = null }) {
  const rows = [];
  for (let i = 0; i < players.length; i += 4) rows.push(players.slice(i, i + 4));

  return (
    <div className="classroom-room">
      {/* Pared + pizarrón */}
      <div className="classroom-wall">
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
