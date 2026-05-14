import Classroom from '../components/Classroom';

const MONSTER_ROLES = ['Wolfman', 'Lord Vampire', 'Vampire', 'Mommy'];

function getVisibleRoleSkins({ role, myId, monsterTeam, isHost }) {
  if (isHost || !MONSTER_ROLES.includes(role)) return {};

  const skins = {};
  if (myId) skins[myId] = role;
  monsterTeam?.forEach(monster => {
    if (MONSTER_ROLES.includes(monster.role)) skins[monster.id] = monster.role;
  });
  return skins;
}

export default function ClassroomPhase({ players, hostName, myId, onSeatClick, selectedId, isVoting, boardContent, role, monsterTeam, isHost = false, children }) {
  const roleSkins = getVisibleRoleSkins({ role, myId, monsterTeam, isHost });

  return (
    <div className="classroom-phase-wrap">
      <Classroom
        players={players}
        hostName={hostName}
        myId={myId}
        onSeatClick={onSeatClick}
        selectedId={selectedId}
        isVoting={isVoting}
        boardContent={boardContent}
        roleSkins={roleSkins}
      />
      {children && (
        <div className="classroom-action-panel">
          {children}
        </div>
      )}
    </div>
  );
}
