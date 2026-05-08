import RoleTab from '../components/RoleTab';
import ClassroomPhase from './ClassroomPhase';
import Notebook from '../components/Notebook';

const PHRASES = {
  '⚔️ Accuse': ['He is a monster!', 'She is suspicious.', 'You are the monster!', 'You are his/her accomplice.'],
  '🛡️ Defend': ['I am not a monster.', 'She is innocent.', "You don't have any proof.", 'Why are you blaming me?'],
  '❓ Ask': ['Are you the monster?', 'Why are you protecting her/him?', 'Is she a student?'],
};

function DayBoard({ eliminated, isHost, role }) {
  return (
    <div className="board-content">
      <span className="board-title">☀️ Day Phase</span>
      <span className="board-divider">— — — — — — —</span>

      {eliminated
        ? <>
            <span className="board-line">💀 <strong style={{ color: '#ff6b6b' }}>{eliminated.name}</strong> was eliminated!</span>
            <span className="board-hint">They were: {eliminated.role}</span>
          </>
        : <span className="board-line">🌟 Everyone survived the night!</span>
      }

      <span className="board-divider">— — — — — — —</span>

      {isHost
        ? <span className="board-hint">"Good morning, Monster School! Discuss..."</span>
        : <>
            <span className="board-sub">Your role: {role}</span>
            {Object.entries(PHRASES).map(([cat, list]) => (
              <span key={cat} className="board-line" style={{ marginTop: 4 }}>
                <span style={{ color: '#ffd166' }}>{cat}:</span>{' '}
                {list.join(' / ')}
              </span>
            ))}
          </>
      }
    </div>
  );
}

export default function DayPhase({ eliminated, alivePlayers, isHost, onAdvance, role, myBonus, monsterTeam, hostName, myId, myName, chatMessages, onSendChat }) {
  return (
    <ClassroomPhase
      players={alivePlayers}
      hostName={hostName}
      myId={myId}
      boardContent={<DayBoard eliminated={eliminated} isHost={isHost} role={role} />}
    >
      {isHost && (
        <button className="btn btn-primary sticky-btn" onClick={onAdvance}>🗳️ Start Vote</button>
      )}
      <RoleTab role={role} bonusCard={myBonus} monsterTeam={monsterTeam} />
      <Notebook myName={myName} messages={chatMessages} onSend={onSendChat} />
    </ClassroomPhase>
  );
}
