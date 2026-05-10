const pop = new Audio('/dragon-studio-pop-402322.mp3');
const join = new Audio('/Join-sonido.mp3');
const halloween = new Audio('/c418.mp3');
halloween.loop = true;
halloween.volume = 0.3;
const beep = new Audio('/BEEp.mp3');
const swoosh = new Audio('/Swoosh.mp3');
const descarga = new Audio('/DescargaElectrica.mp3');

let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  halloween.play().catch(() => {});
}

document.addEventListener('click', unlockAudio, { once: false });
document.addEventListener('keydown', unlockAudio, { once: false });
document.addEventListener('touchstart', unlockAudio, { once: false });

export function useSound() {
  const playPop = () => { pop.currentTime = 0; pop.play().catch(() => {}); };
  const playJoin = () => { join.currentTime = 0; join.play().catch(() => {}); };
  const playHalloween = () => halloween.play().catch(() => {});
  const stopHalloween = () => { halloween.pause(); halloween.currentTime = 0; };
  const playDescanso = () => halloween.play().catch(() => {});
  const stopDescanso = () => {};
  const playBeep = () => { beep.currentTime = 0; beep.play().catch(() => {}); };
  const playSwoosh = () => { swoosh.currentTime = 0; swoosh.play().catch(() => {}); };
  const playDescarga = () => { descarga.currentTime = 0; descarga.play().catch(() => {}); };
  return { playPop, playJoin, playHalloween, stopHalloween, playDescanso, stopDescanso, playBeep, playSwoosh, playDescarga };
}
