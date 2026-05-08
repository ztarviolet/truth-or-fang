import { useEffect } from 'react';
import { useSound } from '../hooks/useSound';
import Chalkboard from '../components/Chalkboard';

const ROLE_INFO = {
  'Wolfman': { emoji: '🐺', color: '#f4a261', description: 'You are a monster. Vote to eliminate normies each night.', instruction: 'During the day, say: "I am a student."', isMonster: true },
  'Lord Vampire': { emoji: '🧛', color: '#c77dff', description: 'Transform a normie into a Vampire every 2 turns.', instruction: 'If you die, all Vampires die with you.', isMonster: true },
  'Vampire': { emoji: '🩸', color: '#ff6b6b', description: 'You were transformed. Help Lord Vampire but cannot transform alone.', instruction: 'You die if Lord Vampire is eliminated.', isMonster: true },
  'Mommy': { emoji: '🧟‍♀️', color: '#95d5b2', description: 'Silence 1 normie so they cannot vote for 5 turns.', instruction: 'During the day, say: "I am a student."', isMonster: true },
  'Normie': { emoji: '🧑‍🎓', color: '#90e0ef', description: 'You are a regular student. Find the monsters!', instruction: 'Use English to survive.', isMonster: false },
  'Monster Hunter': { emoji: '🏹', color: '#ffd166', description: 'Eliminate any player on your own every 2 turns.', instruction: 'Use your power wisely.', isMonster: false },
  'The Seeker': { emoji: '👁️', color: '#80ffdb', description: 'You can see who keeps their eyes open at night.', instruction: 'Never reveal you are The Seeker.', isMonster: false },
  'The Protector': { emoji: '🛡️', color: '#74b3ce', description: 'Save a player from elimination — only 2 times per game.', instruction: 'Choose wisely who to protect.', isMonster: false },
  'Siblings': { emoji: '👫', color: '#ffb3c6', description: 'You are a Sibling. If your twin dies, you die too.', instruction: 'Protect each other at all costs.', isMonster: false },
  'The Shaman': { emoji: '🔮', color: '#c8b6ff', description: 'Every 3 turns, convert a Vampire back into a Normie.', instruction: 'Only works on transformed Vampires.', isMonster: false },
  'Inspector Grammar': { emoji: '🔍', color: '#ffca3a', description: 'Each night, check one player. The teacher tells you if they are a monster.', instruction: 'You are the teacher / moderator.', isMonster: false },
};

const BONUS_INFO = {
  'Full Moon': { emoji: '🌕', desc: 'Wolfman only: eliminate an extra player this turn.' },
  'Silver Shield': { emoji: '🛡️', desc: 'One of 4 fragments. Combine all 4 to grant immunity to one attack.' },
  'Garlic Necklace': { emoji: '🧄', desc: 'One-time immunity against Lord Vampire.' },
};

export default function RoleCard({ role, bonusCard, onConfirm }) {
  const info = ROLE_INFO[role] || ROLE_INFO['Normie'];
  const { playSwoosh } = useSound();

  useEffect(() => {
    const delays = [100, 300, 500, 700, 900, 1100, 1300];
    const timers = delays.map(d => setTimeout(playSwoosh, d));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="screen center" style={{ background: '#1a1a1a' }}>
      <Chalkboard>
        <div className="chalk-emoji">{info.emoji}</div>
        <h2 className="chalk-title" style={{ color: info.color }}>{role}</h2>
        <div className={`chalk-badge ${info.isMonster ? 'monster' : 'normie'}`}>
          {info.isMonster ? '👹 MONSTER' : '🧑‍🎓 STUDENT'}
        </div>
        <p className="chalk-desc">{info.description}</p>
        <p className="chalk-instruction">"{info.instruction}"</p>
        {bonusCard && (
          <div className="chalk-bonus">
            <span>{BONUS_INFO[bonusCard]?.emoji} Bonus: {bonusCard}</span>
            <p>{BONUS_INFO[bonusCard]?.desc}</p>
          </div>
        )}
      </Chalkboard>
      <button className="btn chalk-btn" style={{ marginTop: 16 }} onClick={onConfirm}>
        👁️ I've seen my role
      </button>
    </div>
  );
}
