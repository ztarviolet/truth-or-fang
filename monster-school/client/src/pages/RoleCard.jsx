const ROLE_INFO = {
  'Wolfman': {
    emoji: '🐺',
    color: '#8B4513',
    description: 'You are a monster. Vote to eliminate normies each night.',
    instruction: 'During the day, say: "I am a student."',
    isMonster: true,
  },
  'Lord Vampire': {
    emoji: '🧛',
    color: '#6a0dad',
    description: 'Transform a normie into a Vampire every 2 turns.',
    instruction: 'If you die, all Vampires die with you.',
    isMonster: true,
  },
  'Vampire': {
    emoji: '🩸',
    color: '#8B0000',
    description: 'You were transformed. Help Lord Vampire but cannot transform alone.',
    instruction: 'You die if Lord Vampire is eliminated.',
    isMonster: true,
  },
  'Mommy': {
    emoji: '🧟‍♀️',
    color: '#556B2F',
    description: 'Silence 1 normie so they cannot vote for 5 turns.',
    instruction: 'During the day, say: "I am a student."',
    isMonster: true,
  },
  'Normie': {
    emoji: '🧑‍🎓',
    color: '#2e86ab',
    description: 'You are a regular student. Find the monsters!',
    instruction: 'Use English to survive.',
    isMonster: false,
  },
  'Monster Hunter': {
    emoji: '🏹',
    color: '#DAA520',
    description: 'Eliminate any player on your own every 2 turns.',
    instruction: 'Use your power wisely.',
    isMonster: false,
  },
  'The Seeker': {
    emoji: '👁️',
    color: '#20B2AA',
    description: 'You can see who keeps their eyes open at night.',
    instruction: 'Never reveal you are The Seeker.',
    isMonster: false,
  },
  'The Protector': {
    emoji: '🛡️',
    color: '#4682B4',
    description: 'Save a player from elimination — only 2 times per game.',
    instruction: 'Choose wisely who to protect.',
    isMonster: false,
  },
  'Siblings': {
    emoji: '👫',
    color: '#FF69B4',
    description: 'You are a Sibling. If your twin dies, you die too.',
    instruction: 'Protect each other at all costs.',
    isMonster: false,
  },
  'The Shaman': {
    emoji: '🔮',
    color: '#9370DB',
    description: 'Every 3 turns, convert a Vampire back into a Normie.',
    instruction: 'Only works on transformed Vampires.',
    isMonster: false,
  },
  'Inspector Grammar': {
    emoji: '🔍',
    color: '#FF8C00',
    description: 'Each night, check one player. The teacher tells you if they are a monster.',
    instruction: 'You are the teacher / moderator.',
    isMonster: false,
  },
};

const BONUS_INFO = {
  'Full Moon': { emoji: '🌕', desc: 'Wolfman only: eliminate an extra player this turn.' },
  'Silver Shield': { emoji: '🛡️', desc: 'One of 4 fragments. Combine all 4 to grant immunity to one attack.' },
  'Garlic Necklace': { emoji: '🧄', desc: 'One-time immunity against Lord Vampire.' },
};

export default function RoleCard({ role, bonusCard, onConfirm }) {
  const info = ROLE_INFO[role] || ROLE_INFO['Normie'];

  return (
    <div className="screen center">
      <div className="role-card" style={{ borderColor: info.color }}>
        <div className="role-emoji">{info.emoji}</div>
        <h2 style={{ color: info.color }}>{role}</h2>
        <div className={`role-badge ${info.isMonster ? 'monster' : 'normie'}`}>
          {info.isMonster ? '👹 MONSTER' : '🧑‍🎓 STUDENT'}
        </div>
        <p className="role-desc">{info.description}</p>
        <p className="role-instruction">"{info.instruction}"</p>

        {bonusCard && (
          <div className="bonus-card">
            <span>{BONUS_INFO[bonusCard]?.emoji} Bonus: {bonusCard}</span>
            <p>{BONUS_INFO[bonusCard]?.desc}</p>
          </div>
        )}
      </div>
      <button className="btn btn-primary" onClick={onConfirm}>
        👁️ I've seen my role
      </button>
    </div>
  );
}
