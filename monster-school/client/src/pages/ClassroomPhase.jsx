import Classroom from '../components/Classroom';

export default function ClassroomPhase({ players, hostName, myId, onSeatClick, selectedId, isVoting, boardContent, children }) {
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
      />
      {children && (
        <div className="classroom-action-panel">
          {children}
        </div>
      )}
    </div>
  );
}
