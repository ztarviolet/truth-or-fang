const pop = new Audio('/dragon-studio-pop-402322.mp3');
const join = new Audio('/Join-sonido.mp3');

export function useSound() {
  const playPop = () => {
    pop.currentTime = 0;
    pop.play();
  };
  const playJoin = () => {
    join.currentTime = 0;
    join.play();
  };
  return { playPop, playJoin };
}
