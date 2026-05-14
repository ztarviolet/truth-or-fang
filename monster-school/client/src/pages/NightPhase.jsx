import { useState } from 'react';
import RoleTab from '../components/RoleTab';
import ClassroomPhase from './ClassroomPhase';

const actionMap = {
  'Wolfman': 'monster_kill',
  'Lord Vampire': 'vampire_transform',
  'Mommy': 'mommy_silence',
  'Monster Hunter': 'hunter_kill',
  'The Protector': 'protect',
  'The Shaman': 'shaman_convert',
  'Inspector Grammar': null,
};

const CAN_ACT = ['Wolfman', 'Lord Vampire', 'Mommy', 'Monster Hunter', 'The Protector', 'The Shaman', 'Inspector Grammar'];

// Contenido del pizarrón para el HOST
function HostBoard({ turn }) {
  return (
    <div className="board-content">
      <span className="board-line board-title">🌙 Night Phase</span>
      <span className="board-line board-sub">Turn {turn}</span>
      <span className="board-line board-divider">— — — — — — —</span>
      <span className="board-line">😴 Everyone, close your eyes...</span>
      <span className="board-line board-hint">"Monsters, open your eyes."</span>
    </div>
  );
}

// Contenido del pizarrón para JUGADORES con acción
function PlayerBoard({ role, targets, selected, onSelect, actionDone, monsterTeam, bonusMode, bonusPending, myBonus }) {
  const actionVerb = {
    'Wolfman': '🐺 Choose your victim:',
    'Lord Vampire': '🧛 Choose to transform:',
    'Mommy': '🧟 Choose to silence:',
    'Monster Hunter': '🏹 Choose to eliminate:',
    'The Protector': '🛡️ Choose to protect:',
    'The Shaman': '🔮 Choose to convert:',
    'Inspector Grammar': '🔍 Choose to inspect:',
  };

  if (actionDone && !bonusMode) {
    return (
      <div className="board-content">
        <span className="board-line board-title">🌙 Night Phase</span>
        <span className="board-line board-divider">— — — — — — —</span>
        <span className="board-line">✅ Action submitted!</span>
        {bonusPending && <span className="board-line board-hint">🛡️ Shield vote cast — waiting for others...</span>}
        {!bonusPending && <span className="board-line board-hint">Waiting for others...</span>}
      </div>
    );
  }

  return (
    <div className="board-content">
      <span className="board-line board-title">🌙 Night Phase</span>
      <span className="board-line board-divider">— — — — — — —</span>
      {monsterTeam?.length > 0 && (
        <span className="board-line board-hint">
          🐾 Team: {monsterTeam.map(m => m.name).join(', ')}
        </span>
      )}
      <span className="board-line board-sub">
        {bonusMode
          ? myBonus === 'Silver Shield' ? '🛡️ Vote: who to protect with the Shield?' : '🌕 Full Moon — pick 2nd target:'
          : actionVerb[role]}
      </span>
      {targets.map(p => (
        <span
          key={p.id}
          className={`board-line board-target ${selected === p.id ? 'board-target-selected' : ''}`}
          onClick={() => onSelect(p.id)}
        >
          {selected === p.id ? '▶ ' : '  '}{p.name}
        </span>
      ))}
      {!targets.length && <span className="board-line board-hint">No targets available</span>}
    </div>
  );
}

// Pizarrón para jugadores sin acción (duermen)
function SleepBoard({ turn }) {
  return (
    <div className="board-content">
      <span className="board-line board-title">🌙 Night Phase</span>
      <span className="board-line board-sub">Turn {turn}</span>
      <span className="board-line board-divider">— — — — — — —</span>
      <span className="board-line">😴 Close your eyes...</span>
      <span className="board-line board-hint">Wait for the night to pass.</span>
    </div>
  );
}

export default function NightPhase({ role, alivePlayers, myId, monsterTeam, turn, emit, code, myBonus, bonusUsed, onBonusUsed, isHost, onAdvance, hostName, players }) {
  const [selected, setSelected] = useState(null);
  const [actionDone, setActionDone] = useState(false);
  const [bonusMode, setBonusMode] = useState(false);
  const [bonusPending, setBonusPending] = useState(false); // shield voted but not confirmed yet

  const canAct = CAN_ACT.includes(role);
  const targets = alivePlayers.filter(p => p.id !== myId);

  const handleSelect = (targetId) => {
    if (actionDone) return;
    setSelected(targetId);
  };

  const handleConfirm = () => {
    if (!selected || actionDone) return;
    if (role === 'Inspector Grammar') {
      emit('inspector_check', { code, targetId: selected });
    } else {
      emit('night_action', { code, targetId: selected, action: actionMap[role] });
    }
    setActionDone(true);
  };

  const handleBonus = () => {
    if (myBonus === 'Full Moon') {
      setBonusMode(true);
    } else if (myBonus === 'Silver Shield') {
      setBonusMode(true); // pick a target to protect
    }
    // Garlic Necklace is automatic, no button needed
  };

  const handleBonusConfirm = () => {
    if (!selected) return;
    emit('use_bonus_card', { code, targetId: selected });
    onBonusUsed();
    setBonusMode(false);
    setBonusPending(myBonus === 'Silver Shield'); // shield waits for consensus
    setSelected(null);
  };

  const handleSeatClick = (p) => {
    if (bonusMode) { setSelected(p.id); return; }
    if (!canAct || actionDone) return;
    setSelected(p.id);
  };

  const boardContent = isHost
    ? <HostBoard turn={turn} />
    : canAct
      ? <PlayerBoard role={role} targets={targets} selected={selected} onSelect={handleSelect} actionDone={actionDone} monsterTeam={monsterTeam} bonusMode={bonusMode} bonusPending={bonusPending} myBonus={myBonus} />
      : <SleepBoard turn={turn} />;

  return (
    <ClassroomPhase
      players={alivePlayers.length ? alivePlayers : players}
      hostName={hostName}
      myId={myId}
      onSeatClick={handleSeatClick}
      selectedId={selected}
      isVoting={false}
      boardContent={boardContent}
      role={role}
      monsterTeam={monsterTeam}
      isHost={isHost}
    >
      {canAct && !actionDone && selected && !isHost && !bonusMode && (
        <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={handleConfirm}>
          ✅ Confirm — {alivePlayers.find(p => p.id === selected)?.name}
        </button>
      )}

      {bonusMode && selected && (
        <button className="btn btn-bonus" style={{ marginTop: 8 }} onClick={handleBonusConfirm}>
          ✅ Use {myBonus} on {alivePlayers.find(p => p.id === selected)?.name}
        </button>
      )}

      {myBonus && myBonus !== 'Garlic Necklace' && !bonusUsed && !bonusMode && !isHost && (
        <button className="btn btn-bonus" onClick={handleBonus}>
          {{ 'Full Moon': '🌕 Use Full Moon', 'Silver Shield': '🛡️ Vote Shield Target' }[myBonus]}
        </button>
      )}

      {myBonus === 'Garlic Necklace' && !bonusUsed && !isHost && (
        <div className="btn btn-bonus" style={{ opacity: 0.7, cursor: 'default' }}>
          🧄 Garlic Necklace — activates automatically
        </div>
      )}

      {isHost && (
        <button className="btn btn-secondary" onClick={onAdvance}>⏭ Skip Night</button>
      )}

      <RoleTab role={role} bonusCard={myBonus} monsterTeam={monsterTeam} />
    </ClassroomPhase>
  );
}
