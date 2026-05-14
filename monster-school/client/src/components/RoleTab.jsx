import { useEffect, useState } from 'react';
import Chalkboard from './Chalkboard';
import { useSound } from '../hooks/useSound';

const ROLE_INFO = {
  'Wolfman':           { emoji: '🐺',   color: '#f4a261', isMonster: true,  description: 'Vote to eliminate normies each night.',          instruction: 'During the day, say: "I am a student."' },
  'Lord Vampire':      { emoji: '🧛',   color: '#c77dff', isMonster: true,  description: 'Transform a normie into a Vampire every 2 turns.', instruction: 'If you die, all Vampires die with you.' },
  'Vampire':           { emoji: '🩸',   color: '#ff6b6b', isMonster: true,  description: 'Help Lord Vampire. Cannot transform alone.',        instruction: 'You die if Lord Vampire is eliminated.' },
  'Mommy':             { emoji: '🧟♀️', color: '#95d5b2', isMonster: true,  description: 'Silence 1 normie so they cannot vote for 5 turns.', instruction: 'During the day, say: "I am a student."' },
  'Normie':            { emoji: '🧑🎓', color: '#90e0ef', isMonster: false, description: 'You are a regular student. Find the monsters!',    instruction: 'Use English to survive.' },
  'Monster Hunter':    { emoji: '🏹',   color: '#ffd166', isMonster: false, description: 'Eliminate any player on your own every 2 turns.',   instruction: 'Use your power wisely.' },
  'The Seeker':        { emoji: '👁️',  color: '#80ffdb', isMonster: false, description: 'You can see who keeps their eyes open at night.',   instruction: 'Never reveal you are The Seeker.' },
  'The Protector':     { emoji: '🛡️',  color: '#74b3ce', isMonster: false, description: 'Save a player from elimination — only 2 times.',    instruction: 'Choose wisely who to protect.' },
  'Siblings':          { emoji: '👫',   color: '#ffb3c6', isMonster: false, description: 'If your twin dies, you die too.',                   instruction: 'Protect each other at all costs.' },
  'The Shaman':        { emoji: '🔮',   color: '#c8b6ff', isMonster: false, description: 'Every 3 turns, convert a Vampire back to Normie.',  instruction: 'Only works on transformed Vampires.' },
  'Inspector Grammar': { emoji: '🔍',   color: '#ffca3a', isMonster: false, description: 'Each night, check one player for monster status.',  instruction: 'You are the teacher / moderator.' },
};

const BONUS_INFO = {
  'Full Moon':       { emoji: '🌕', desc: 'Wolfman only: eliminate an extra player this turn.' },
  'Silver Shield':   { emoji: '🛡️', desc: 'One-time protection against a kill.' },
  'Garlic Necklace': { emoji: '🧄', desc: 'One-time immunity against Lord Vampire.' },
};

export default function RoleTab({ role, bonusCard, monsterTeam }) {
  const [open, setOpen] = useState(false);
  const { playCardMusic, stopCardMusic } = useSound();
  const info = ROLE_INFO[role] || ROLE_INFO['Normie'];

  useEffect(() => {
    if (!open) return;
    playCardMusic();
    return () => stopCardMusic();
  }, [open]);

  return (
    <>
      {open && (
        <div className="roletab-overlay" onClick={() => setOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: 320 }}>
            <Chalkboard>
              <div className="chalk-emoji">{info.emoji}</div>
              <h2 className="chalk-title" style={{ color: info.color }}>{role}</h2>
              <div className={`chalk-badge ${info.isMonster ? 'monster' : 'normie'}`}>
                {info.isMonster ? '👹 MONSTER' : '🧑🎓 STUDENT'}
              </div>
              <p className="chalk-desc">{info.description}</p>
              <p className="chalk-instruction">"{info.instruction}"</p>
              {monsterTeam && monsterTeam.length > 0 && (
                <div className="chalk-bonus">
                  <span>🐾 Your team:</span>
                  {monsterTeam.map(m => (
                    <p key={m.id}>{ROLE_INFO[m.role]?.emoji} {m.name} — {m.role}</p>
                  ))}
                </div>
              )}
              {bonusCard && (
                <div className="chalk-bonus">
                  <span>{BONUS_INFO[bonusCard]?.emoji} Bonus: {bonusCard}</span>
                  <p>{BONUS_INFO[bonusCard]?.desc}</p>
                </div>
              )}
              <button className="chalk-btn" onClick={() => setOpen(false)}>✕ Close</button>
            </Chalkboard>
          </div>
        </div>
      )}
      <button className="roletab-tab" onClick={() => setOpen(true)}>
        {info.emoji} My Role
      </button>
    </>
  );
}
