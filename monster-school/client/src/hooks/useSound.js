const pop = new Audio('/dragon-studio-pop-402322.mp3');
const join = new Audio('/Join-sonido.mp3');
const lobbyMusic = new Audio('/Musica_1.mp3');
const startMusic = new Audio('/Musica_2.mp3');
const voteMusic = new Audio('/Musica_2.mp3');
const cardMusic = new Audio('/Musica_3.mp3');
const gameMusic = new Audio('/c418.mp3');
const beep = new Audio('/BEEp.mp3');
const swoosh = new Audio('/Swoosh.mp3');
const descarga = new Audio('/DescargaElectrica.mp3');
const bottlePop = new Audio('/BotellaPop.mp3');

let audioUnlocked = false;
let currentMusic = null;
let musicToResumeAfterCard = null;

[lobbyMusic, gameMusic, voteMusic].forEach(audio => {
  audio.loop = true;
  audio.volume = 0.3;
});

[startMusic, cardMusic].forEach(audio => {
  audio.loop = false;
  audio.volume = 0.45;
});

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
}

document.addEventListener('click', unlockAudio, { once: false });
document.addEventListener('keydown', unlockAudio, { once: false });
document.addEventListener('touchstart', unlockAudio, { once: false });

function stopTrack(audio, reset = true) {
  audio.pause();
  if (reset) audio.currentTime = 0;
}

function stopMusicExcept(keep) {
  [lobbyMusic, startMusic, voteMusic, cardMusic, gameMusic].forEach(audio => {
    if (audio !== keep) stopTrack(audio);
  });
}

function playMusic(audio, { reset = false } = {}) {
  stopMusicExcept(audio);
  if (reset) audio.currentTime = 0;
  currentMusic = audio;
  audio.play().catch(() => {});
}

function stopAllMusic() {
  stopMusicExcept(null);
  currentMusic = null;
  musicToResumeAfterCard = null;
}

export function useSound() {
  const playPop = () => { pop.currentTime = 0; pop.play().catch(() => {}); };
  const playJoin = () => { join.currentTime = 0; join.play().catch(() => {}); };
  const playHalloween = () => playMusic(gameMusic);
  const stopHalloween = () => stopAllMusic();
  const playDescanso = () => playMusic(lobbyMusic);
  const stopDescanso = () => {
    if (currentMusic === lobbyMusic) stopAllMusic();
  };
  const playLobbyMusic = () => playMusic(lobbyMusic);
  const playStartTransition = () => playMusic(startMusic, { reset: true });
  const playGameMusic = () => {
    musicToResumeAfterCard = null;
    playMusic(gameMusic);
  };
  const playVoteMusic = () => {
    musicToResumeAfterCard = null;
    playMusic(voteMusic);
  };
  const playCardMusic = () => {
    musicToResumeAfterCard = currentMusic && currentMusic !== cardMusic ? currentMusic : null;
    playMusic(cardMusic, { reset: true });
  };
  const stopCardMusic = ({ resumeGame = true } = {}) => {
    if (currentMusic === cardMusic) stopTrack(cardMusic);
    if (resumeGame && musicToResumeAfterCard) playMusic(musicToResumeAfterCard);
    musicToResumeAfterCard = null;
  };
  const playBeep = () => { beep.currentTime = 0; beep.play().catch(() => {}); };
  const playSwoosh = () => { swoosh.currentTime = 0; swoosh.play().catch(() => {}); };
  const playDescarga = () => { descarga.currentTime = 0; descarga.play().catch(() => {}); };
  const playBottlePop = () => { bottlePop.currentTime = 0; bottlePop.play().catch(() => {}); };
  return {
    playPop,
    playJoin,
    playHalloween,
    stopHalloween,
    playDescanso,
    stopDescanso,
    playLobbyMusic,
    playStartTransition,
    playGameMusic,
    playVoteMusic,
    playCardMusic,
    stopCardMusic,
    stopAllMusic,
    playBeep,
    playSwoosh,
    playDescarga,
    playBottlePop,
  };
}
