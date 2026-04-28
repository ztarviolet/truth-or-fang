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

  // Inspector Grammar (1)
  roles.push(ROLES.INSPECTOR);

  // Monsters (4-5 depending on count)
  const monsterCount = count >= 20 ? 5 : 4;
  roles.push(ROLES.MOMMY);
  roles.push(ROLES.LORD_VAMPIRE);
  for (let i = 0; i < Math.min(monsterCount - 2, 3); i++) roles.push(ROLES.WOLFMAN);

  // Special normies
  roles.push(ROLES.MONSTER_HUNTER);
  roles.push(ROLES.SEEKER);
  roles.push(ROLES.PROTECTOR);
  roles.push(ROLES.SHAMAN);
  roles.push(ROLES.SIBLINGS);
  roles.push(ROLES.SIBLINGS);

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
  if (monsters.length >= normies.length - 2) return 'monsters';
  return null;
}

module.exports = { assignRoles, checkVictory, ROLES, MONSTER_ROLES };
