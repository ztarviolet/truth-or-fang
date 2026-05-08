const pop = new Audio('/dragon-studio-pop-402322.mp3');
const join = new Audio('/Join-sonido.mp3');
const halloween = new Audio('/c418.mp3');
halloween.loop = true;
halloween.volume = 0.3;
const descanso = new Audio('/musica_descanso.mp3');
descanso.loop = true;
const beep = new Audio('/BEEp.mp3');
const swoosh = new Audio('/Swoosh.mp3');

let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  halloween.play().catch(() => {});
}

document.addEventListener('click', unlockAudio, { once: true });
document.addEventListener('keydown', unlockAudio, { once: true });
document.addEventListener('touchstart', unlockAudio, { once: true });

export function useSound() {
  const playPop = () => { pop.currentTime = 0; pop.play(); };
  const playJoin = () => { join.currentTime = 0; join.play(); };
  const playHalloween = () => halloween.play();
  const stopHalloween = () => { halloween.pause(); halloween.currentTime = 0; };
  const playDescanso = () => descanso.play();
  const stopDescanso = () => { descanso.pause(); descanso.currentTime = 0; };
  const playBeep = () => { beep.currentTime = 0; beep.play(); };
  const playSwoosh = () => { swoosh.currentTime = 0; swoosh.play(); };
  return { playPop, playJoin, playHalloween, stopHalloween, playDescanso, stopDescanso, playBeep, playSwoosh };
}
