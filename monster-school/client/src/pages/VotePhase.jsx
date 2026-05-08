import { useState } from 'react';
import RoleTab from '../components/RoleTab';
import ClassroomPhase from './ClassroomPhase';
import Notebook from '../components/Notebook';

function VoteBoard({ targets, selected, onSelect, voted, canVote }) {
  if (voted) {
    return (
      <div className="board-content">
        <span className="board-title">🗳️ Vote!</span>
        <span className="board-divider">— — — — — — —</span>
        <span className="board-line">✅ Vote cast!</span>
        <span className="board-hint">Waiting for results...</span>
      </div>
    );
  }

  if (!canVote) {
    return (
      <div className="board-content">
        <span className="board-title">🗳️ Vote!</span>
        <span className="board-divider">— — — — — — —</span>
        <span className="board-line" style={{ color: '#ff8c00' }}>🤐 You are silenced.</span>
        <span className="board-hint">You cannot vote this round.</span>
      </div>
    );
  }

  return (
    <div className="board-content">
      <span className="board-title">🗳️ Who is the monster?</span>
      <span className="board-divider">— — — — — — —</span>
      <span className="board-hint">Tap a name to select:</span>
      {targets.map(p => (
        <span
          key={p.id}
          className={`board-line board-target ${selected === p.id ? 'board-target-selected' : ''}`}
          onClick={() => onSelect(p.id)}
        >
          {selected === p.id ? '▶ ' : '  '}{p.name}
        </span>
      ))}
    </div>
  );
}

export default function VotePhase({ alivePlayers, myId, canVote, emit, code, role, myBonus, monsterTeam, hostName, myName, chatMessages, onSendChat }) {
  const [selected, setSelected] = useState(null);
  const [voted, setVoted] = useState(false);

  const targets = alivePlayers.filter(p => p.id !== myId);

  const handleVote = () => {
    if (!selected || voted || !canVote) return;
    emit('cast_vote', { code, targetId: selected });
    setVoted(true);
  };

  return (
    <ClassroomPhase
      players={alivePlayers}
      hostName={hostName}
      myId={myId}
      onSeatClick={(p) => { if (!voted && canVote && p.id !== myId) setSelected(p.id); }}
      selectedId={selected}
      isVoting={canVote && !voted}
      boardContent={
        <VoteBoard
          targets={targets}
          selected={selected}
          onSelect={(id) => { if (!voted && canVote) setSelected(id); }}
          voted={voted}
          canVote={canVote}
        />
      }
    >
      {canVote && !voted && (
        <button
          className="btn btn-primary vote-confirm-btn"
          onClick={handleVote}
          disabled={!selected}
        >
          {selected
            ? `☠️ Eliminate ${alivePlayers.find(p => p.id === selected)?.name}`
            : '👆 Tap a name on the board'}
        </button>
      )}
      <RoleTab role={role} bonusCard={myBonus} monsterTeam={monsterTeam} />
      <Notebook myName={myName} messages={chatMessages} onSend={onSendChat} />
    </ClassroomPhase>
  );
}
