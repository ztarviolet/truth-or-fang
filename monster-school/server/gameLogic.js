const ROLES = {
  WOLFMAN: 'Wolfman',
  LORD_VAMPIRE: 'Lord Vampire',
  VAMPIRE: 'Vampire',
  MOMMY: 'Mommy',
  NORMIE: 'Normie',
  MONSTER_HUNTER: 'Monster Hunter',
  SEEKER: 'The Seeker',
  PROTECTOR: 'The Protector',
  SIBLINGS: 'Siblings',
  SHAMAN: 'The Shaman',
  INSPECTOR: 'Inspector Grammar',
};

const BONUS_CARDS = ['Full Moon', 'Silver Shield', 'Silver Shield', 'Silver Shield', 'Silver Shield', 'Garlic Necklace', 'Garlic Necklace'];

const MONSTER_ROLES = [ROLES.WOLFMAN, ROLES.LORD_VAMPIRE, ROLES.VAMPIRE, ROLES.MOMMY];

function assignRoles(playerIds) {
  const count = playerIds.length;
  const roles = [];

  // Scale monsters: ~25% of players, min 1, max 5
  const monsterCount = Math.min(5, Math.max(1, Math.round(count * 0.25)));

  // Always include Lord Vampire as the main monster
  roles.push(ROLES.LORD_VAMPIRE);
  // Add Mommy if enough players
  if (monsterCount >= 2) roles.push(ROLES.MOMMY);
  // Fill remaining monster slots with Wolfmen
  for (let i = roles.length; i < monsterCount; i++) roles.push(ROLES.WOLFMAN);

  // Scale special roles based on player count
  const specialPool = [
    ROLES.INSPECTOR,
    ROLES.MONSTER_HUNTER,
    ROLES.PROTECTOR,
    ROLES.SEEKER,
    ROLES.SHAMAN,
    ROLES.SIBLINGS,
    ROLES.SIBLINGS,
  ];
  // Use 1 special role per 2 remaining players after monsters, min 1
  const specialCount = Math.min(specialPool.length, Math.max(1, Math.floor((count - monsterCount) / 2)));
  for (let i = 0; i < specialCount; i++) roles.push(specialPool[i]);

  // Fill rest with normies
  while (roles.length < count) roles.push(ROLES.NORMIE);

  // Shuffle
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }

  // Assign bonus cards randomly
  const bonusShuffled = [...BONUS_CARDS].sort(() => Math.random() - 0.5);
  const bonusReceivers = [...playerIds].sort(() => Math.random() - 0.5).slice(0, bonusShuffled.length);

  const assignments = {};
  playerIds.forEach((id, idx) => {
    assignments[id] = {
      role: roles[idx],
      isAlive: true,
      isMonster: MONSTER_ROLES.includes(roles[idx]),
      bonusCard: bonusReceivers.includes(id) ? bonusShuffled[bonusReceivers.indexOf(id)] : null,
      canVote: true,
      silencedTurns: 0,
    };
  });

  return assignments;
}

function checkVictory(players) {
  const alive = Object.values(players).filter(p => p.isAlive);
  const monsters = alive.filter(p => p.isMonster);
  const normies = alive.filter(p => !p.isMonster);

  if (monsters.length === 0) return 'normies';
  // Monsters win when they equal or outnumber normies
  if (monsters.length >= normies.length) return 'monsters';
  return null;
}

module.exports = { assignRoles, checkVictory, ROLES, MONSTER_ROLES };
