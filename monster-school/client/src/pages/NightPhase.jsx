import { useState } from 'react';

export default function NightPhase({ role, alivePlayers, myId, monsterTeam, turn, emit, code }) {
  const [selected, setSelected] = useState(null);
  const [actionDone, setActionDone] = useState(false);

  const canAct = ['Wolfman', 'Lord Vampire', 'Mommy', 'Monster Hunter', 'The Protector', 'The Shaman', 'Inspector Grammar'].includes(role);

  const actionMap = {
    'Wolfman': 'monster_kill',
    'Lord Vampire': 'vampire_transform',
    'Mommy': 'mommy_silence',
    'Monster Hunter': 'hunter_kill',
    'The Protector': 'protect',
    'The Shaman': 'shaman_convert',
    'Inspector Grammar': null, // uses inspector_check
  };

  const handleAction = () => {
    if (!selected) return;
    if (role === 'Inspector Grammar') {
      emit('inspector_check', { code, targetId: selected });
    } else {
      emit('night_action', { code, targetId: selected, action: actionMap[role] });
    }
    setActionDone(true);
  };

  const targets = alivePlayers.filter(p => p.id !== myId);

  return (
    <div className="screen center">
      <div className="phase-header night">
        <h2>🌙 Night Phase</h2>
        <p className="turn-label">Turn {turn}</p>
      </div>

      {!canAct && (
        <div className="sleep-block">
          <p className="big-emoji">😴</p>
          <p>Close your eyes and wait...</p>
          <p className="hint">"Everybody, close your eyes…"</p>
        </div>
      )}

      {canAct && !actionDone && (
        <div className="action-block">
          <p className="action-title">
            {role === 'Inspector Grammar' ? '🔍 Check a player' : '🎯 Choose your target'}
          </p>
          {monsterTeam && monsterTeam.length > 0 && (
            <div className="monster-team">
              <p className="label">Your team:</p>
              {monsterTeam.map(m => (
                <span key={m.id} className="player-chip monster">{m.name} ({m.role})</span>
              ))}
            </div>
          )}
          <div className="player-grid">
            {targets.map(p => (
              <button
                key={p.id}
                className={`player-chip selectable ${selected === p.id ? 'selected' : ''}`}
                onClick={() => setSelected(p.id)}
              >
                {p.name}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={handleAction} disabled={!selected}>
            Confirm
          </button>
        </div>
      )}

      {actionDone && (
        <div className="sleep-block">
          <p className="big-emoji">✅</p>
          <p>Action submitted. Waiting for others...</p>
        </div>
      )}
    </div>
  );
}
