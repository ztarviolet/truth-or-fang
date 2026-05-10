import { useEffect, useRef, useState, useCallback } from 'react';
import { useSound } from '../hooks/useSound';

function FlyingLetter({ letter, startX, startY, onDone }) {
  const tx  = (Math.random() - 0.5) * 260;
  const ty  = -(Math.random() * 180 + 80);
  const rot = (Math.random() - 0.5) * 540;
  return (
    <span
      className="zw-flying-letter"
      style={{ left: startX, top: startY, '--tx': `${tx}px`, '--ty': `${ty}px`, '--rot': `${rot}deg` }}
      onAnimationEnd={onDone}
    >{letter}</span>
  );
}

const LETTERS = 'MonsterSchool'.split('');
const SPEED   = 0.055; // px por ms

export default function ZombieWalker({ titleRef, subtitleRef, onHost, onJoin, dropping }) {
  const [pos,        setPos]        = useState({ x: 0, y: 0, visible: false });
  const [dir,        setDir]        = useState(1);
  const [action,     setAction]     = useState('walk');
  const [liftLetter, setLiftLetter] = useState(null);
  const [flyLetters, setFlyLetters] = useState([]);
  const [dust, setDust]             = useState(false);

  const { playDescarga } = useSound();

  const xRef      = useRef(0);
  const dirRef    = useRef(1);
  const levelRef  = useRef('title');  // 'title' | 'subtitle'
  const actionRef = useRef('walk');
  const boundsRef = useRef(null);
  const rafRef    = useRef(null);
  const lastRef   = useRef(null);
  const timerRef  = useRef(null);

  const dropStartRef = useRef(null); // y inicial de la caída desde arriba

  const getBounds = useCallback(() => {
    const ref = levelRef.current === 'title' ? titleRef : subtitleRef;
    if (!ref?.current) return null;
    const r = ref.current.getBoundingClientRect();
    return { left: r.left, right: r.right, top: r.top, width: r.width };
  }, [titleRef, subtitleRef]);

  const updateBounds = useCallback(() => {
    const b = getBounds();
    if (!b) return;
    boundsRef.current = b;
    if (xRef.current === 0) xRef.current = b.left + 20;
  }, [getBounds]);

  const doAction = useCallback((a, duration, after) => {
    actionRef.current = a;
    setAction(a);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      actionRef.current = 'walk';
      setAction('walk');
      after?.();
    }, duration);
  }, []);

  const scheduleRandom = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (actionRef.current !== 'walk') { scheduleRandom(); return; }
      const roll = Math.random();
      if (roll < 0.30) {
        doAction('jump', 650, scheduleRandom);
      } else if (roll < 0.48) {
        // Solo cae si está en el título
        if (levelRef.current === 'title') {
          doAction('faceplant', 900, () => {
            levelRef.current = 'subtitle';
            boundsRef.current = getBounds();
            doAction('getup', 500, scheduleRandom);
          });
        } else {
          // En subtítulo: 30% de probabilidad de saltar de vuelta al título
          if (Math.random() < 0.30) {
            doAction('jump', 650, () => {
              levelRef.current = 'title';
              boundsRef.current = getBounds();
              scheduleRandom();
            });
          } else {
            scheduleRandom();
          }
        }
      } else if (roll < 0.58) {
        doAction('fall_btn', 700, () => {
          const btn = Math.random() < 0.5 ? 'host' : 'join';
          if (btn === 'host') onHost?.();
          else onJoin?.();
          doAction(`btn_${btn}`, 1000, scheduleRandom);
        });
      } else if (roll < 0.63) {
        const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
        doAction('lift', 500, () => {
          setLiftLetter(letter);
          doAction('throw', 500, () => {
            const b = boundsRef.current;
            if (b) setFlyLetters(p => [...p, { id: Date.now(), letter, startX: xRef.current, startY: b.top }]);
            setLiftLetter(null);
            scheduleRandom();
          });
        });
      } else {
        scheduleRandom();
      }
    }, 2000 + Math.random() * 3000);
  }, [doAction, getBounds, onHost, onJoin]);

  useEffect(() => {
    updateBounds();
    window.addEventListener('resize', updateBounds);

    scheduleRandom();

    const loop = (t) => {
      if (!lastRef.current) lastRef.current = t;
      const dt = Math.min(t - lastRef.current, 50);
      lastRef.current = t;

      // Recalcular bounds del nivel actual en cada frame
      const b = getBounds();
      if (b) {
        boundsRef.current = b;
        // Siempre mover en X (incluso durante acciones)
        if (actionRef.current !== 'shocked' && actionRef.current !== 'faceplant' && actionRef.current !== 'getup' && actionRef.current !== 'fall_btn' && actionRef.current !== 'btn_host' && actionRef.current !== 'btn_join' && actionRef.current !== 'fallen' && actionRef.current !== 'impact' && actionRef.current !== 'drop_in') {
          xRef.current += dirRef.current * SPEED * dt;
          if (xRef.current > b.right - 36) { xRef.current = b.right - 36; dirRef.current = -1; }
          if (xRef.current < b.left)       { xRef.current = b.left;       dirRef.current =  1; }
          setDir(dirRef.current);
        }

        // Y = justo encima del texto (top del h1 - altura del zombie)
        const zombieH = 65;
        const targetY = b.top - zombieH;
        let finalY = targetY;

        // Durante drop_in, el zombie ya está en targetY, CSS maneja la animación
        setPos({ x: xRef.current, y: targetY, visible: true });

        // Hundir letra bajo el zombie según nivel actual
        const activeRef = levelRef.current === 'title' ? titleRef : subtitleRef;
        const letterClass = levelRef.current === 'title' ? '.zw-title-letter' : '.zw-sub-letter';
        // Quitar pressed del otro nivel
        const otherClass = levelRef.current === 'title' ? '.zw-sub-letter' : '.zw-title-letter';
        if (subtitleRef?.current) subtitleRef.current.querySelectorAll(otherClass).forEach(s => s.classList.remove('zw-letter-pressed'));
        if (titleRef?.current)    titleRef.current.querySelectorAll(otherClass).forEach(s => s.classList.remove('zw-letter-pressed'));

        if (activeRef?.current) {
          const zombieCX = xRef.current + 18;
          activeRef.current.querySelectorAll(letterClass).forEach(s => {
            const r = s.getBoundingClientRect();
            if (zombieCX >= r.left && zombieCX <= r.right) s.classList.add('zw-letter-pressed');
            else s.classList.remove('zw-letter-pressed');
          });
        }

        // Saltar en espacios del subtítulo
        if (levelRef.current === 'subtitle' && subtitleRef?.current && actionRef.current === 'walk') {
          const zombieCX = xRef.current + 18;
          subtitleRef.current.querySelectorAll('.zw-sub-space').forEach(s => {
            const r = s.getBoundingClientRect();
            if (zombieCX >= r.left && zombieCX <= r.right) {
              actionRef.current = 'jump';
              setAction('jump');
              clearTimeout(timerRef.current);
              timerRef.current = setTimeout(() => {
                actionRef.current = 'walk';
                setAction('walk');
              }, 500);
            }
          });
        }

        // Saltar en espacios del título
        if (levelRef.current === 'title' && titleRef?.current && actionRef.current === 'walk') {
          const zombieCX = xRef.current + 18;
          titleRef.current.querySelectorAll('.zw-title-space').forEach(s => {
            const r = s.getBoundingClientRect();
            if (zombieCX >= r.left && zombieCX <= r.right) {
              actionRef.current = 'jump';
              setAction('jump');
              clearTimeout(timerRef.current);
              timerRef.current = setTimeout(() => {
                actionRef.current = 'walk';
                setAction('walk');
              }, 500);
            }
          });
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
      window.removeEventListener('resize', updateBounds);
    };
  }, [scheduleRandom, updateBounds]);

  // Activar caída desde arriba cuando dropping cambia a true
  useEffect(() => {
    if (!dropping) return;
    dropStartRef.current = -80;
    actionRef.current = 'drop_in';
    setAction('drop_in');
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      // IMPACTO: squash instantaneo + polvo + letras aplastadas
      actionRef.current = 'fallen';
      setAction('fallen');
      setDust(true);
      setTimeout(() => setDust(false), 800);
      if (titleRef?.current) {
        titleRef.current.querySelectorAll('.zw-title-letter, .zw-title-space').forEach(s => {
          s.classList.add('zw-letter-smash');
        });
      }
    }, 1400);
  }, [dropping, titleRef]);

  const handleShock = () => {
    if (actionRef.current === 'shocked') return;
    playDescarga();
    if (actionRef.current === 'fallen') {
      // La descarga lo levanta y las letras rebotan
      doAction('shocked', 700, () => {
        doAction('getup', 500, () => {
          // Quitar smash y poner bounce en las letras
          if (titleRef?.current) {
            titleRef.current.querySelectorAll('.zw-title-letter, .zw-title-space').forEach(s => {
              s.classList.remove('zw-letter-smash');
              s.classList.add('zw-letter-bounce');
              setTimeout(() => s.classList.remove('zw-letter-bounce'), 800);
            });
          }
          scheduleRandom();
        });
      });
    } else {
      doAction('shocked', 700, scheduleRandom);
    }
  };

  const isShocked   = action === 'shocked';
  const isFaceplant = action === 'faceplant';
  const isGetup     = action === 'getup';
  const isJump      = action === 'jump';
  const isFallBtn   = action === 'fall_btn';
  const isBtnHost   = action === 'btn_host';
  const isBtnJoin   = action === 'btn_join';
  const isLift      = action === 'lift';
  const isThrow     = action === 'throw';

  let wrapCls = 'zw-wrap ';
  if (isShocked)                   wrapCls += 'zw-shocked';
  else if (isJump)                 wrapCls += 'zw-jump';
  else if (action === 'drop_in')   wrapCls += 'zw-drop-in';
  else if (action === 'fallen')    wrapCls += 'zw-fallen';
  else if (isFaceplant)            wrapCls += 'zw-faceplant';
  else if (isGetup)                wrapCls += 'zw-getup';
  else if (isFallBtn)              wrapCls += 'zw-fall-btn';
  else if (isBtnHost || isBtnJoin) wrapCls += 'zw-in-btn';
  else                             wrapCls += 'zw-walk';

  const noLegs = isShocked || isFaceplant || isGetup || isFallBtn || isBtnHost || isBtnJoin;
  const armL = isShocked ? 'zw-arm-shock' : isFaceplant ? 'zw-arm-fp-l' : isLift ? 'zw-arm-lift-l' : isThrow ? 'zw-arm-throw' : 'zw-arm-l';
  const armR = isShocked ? 'zw-arm-shock' : isFaceplant ? 'zw-arm-fp-r' : isLift ? 'zw-arm-lift-r' : isThrow ? 'zw-arm-throw' : 'zw-arm-r';

  if (!pos.visible) return null;

  return (
    <>
      {flyLetters.map(fl => (
        <FlyingLetter key={fl.id} letter={fl.letter} startX={fl.startX} startY={fl.startY}
          onDone={() => setFlyLetters(p => p.filter(l => l.id !== fl.id))} />
      ))}
      {dust && <span className="zw-dust" style={{ position: 'fixed', left: pos.x - 20, top: pos.y + 50 }} />}

      <div
        className={wrapCls}
        style={{ position: 'fixed', left: pos.x, top: pos.y, transform: `scaleX(${dir})` }}
        onMouseEnter={handleShock}
        onTouchStart={handleShock}
      >
        {isShocked && <span className="zw-bolt">⚡</span>}
        {(isBtnHost || isBtnJoin) && <span className="zw-btn-label">{isBtnHost ? '🎓 Host!' : '🎮 Join!'}</span>}
        {liftLetter && <span className="zw-held-letter">{liftLetter}</span>}

        <svg viewBox="0 0 40 72" width="36" height="65" xmlns="http://www.w3.org/2000/svg">
          <g className={noLegs ? '' : 'zw-leg-l'}>
            <rect x="11" y="44" width="8"  height="13" rx="3" fill="#3d6b40"/>
            <rect x="11" y="53" width="8"  height="3"  rx="1" fill="#2a4a2c"/>
            <rect x="12" y="56" width="7"  height="10" rx="3" fill="#3d6b40"/>
            <rect x="9"  y="64" width="11" height="5"  rx="2" fill="#1a2e1b"/>
          </g>
          <g className={noLegs ? '' : 'zw-leg-r'}>
            <rect x="21" y="44" width="8"  height="13" rx="3" fill="#4a7c4e"/>
            <rect x="21" y="53" width="8"  height="3"  rx="1" fill="#2a4a2c"/>
            <rect x="22" y="56" width="7"  height="10" rx="3" fill="#4a7c4e"/>
            <rect x="20" y="64" width="11" height="5"  rx="2" fill="#1a2e1b"/>
          </g>
          <rect x="9"  y="26" width="22" height="20" rx="5" fill="#5a8c5e"/>
          <rect x="9"  y="26" width="22" height="8"  rx="4" fill="#4a7c4e"/>
          <line x1="14" y1="28" x2="12" y2="36" stroke="#2d4a2f" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="22" y1="30" x2="24" y2="38" stroke="#2d4a2f" strokeWidth="1.5" strokeLinecap="round"/>
          <ellipse cx="26" cy="34" rx="3" ry="2" fill="#8B0000" opacity="0.6"/>
          <g className={armL}>
            <rect x="-2" y="27" width="12" height="6" rx="3" fill="#4a7c4e"/>
            <rect x="-5" y="26" width="5"  height="4" rx="2" fill="#3d6b40"/>
            <rect x="-6" y="24" width="3"  height="5" rx="1.5" fill="#3d6b40"/>
            <rect x="-3" y="23" width="3"  height="5" rx="1.5" fill="#3d6b40"/>
            <rect x="0"  y="24" width="3"  height="4" rx="1.5" fill="#3d6b40"/>
          </g>
          <g className={armR}>
            <rect x="30" y="27" width="12" height="6" rx="3" fill="#5a8c5e"/>
            <rect x="40" y="26" width="5"  height="4" rx="2" fill="#4a7c4e"/>
            <rect x="43" y="24" width="3"  height="5" rx="1.5" fill="#4a7c4e"/>
            <rect x="40" y="23" width="3"  height="5" rx="1.5" fill="#4a7c4e"/>
            <rect x="37" y="24" width="3"  height="4" rx="1.5" fill="#4a7c4e"/>
          </g>
          <rect x="16" y="19" width="8" height="8" rx="3" fill="#5a8c5e"/>
          <ellipse cx="20" cy="13" rx="12" ry="11" fill="#6aac6e"/>
          <ellipse cx="15" cy="8"  rx="4"  ry="3"  fill="rgba(255,255,255,0.08)"/>
          <ellipse cx="20" cy="3"  rx="11" ry="5"  fill="#1a2e1b"/>
          <ellipse cx="9"  cy="8"  rx="4"  ry="6"  fill="#1a2e1b"/>
          <ellipse cx="31" cy="8"  rx="4"  ry="6"  fill="#1a2e1b"/>
          <path d="M24 6 Q27 9 25 12" stroke="#8B0000" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          {isShocked ? (
            <>
              <text x="10" y="17" fontSize="8" fill="#fff700" fontWeight="bold">✕</text>
              <text x="21" y="17" fontSize="8" fill="#fff700" fontWeight="bold">✕</text>
            </>
          ) : isFaceplant ? (
            <>
              <text x="10" y="17" fontSize="7" fill="#fff">×</text>
              <text x="21" y="17" fontSize="7" fill="#fff">×</text>
            </>
          ) : (
            <>
              <ellipse cx="15"   cy="14"   rx="3"   ry="2.5" fill="#e8e8e8"/>
              <ellipse cx="15.5" cy="14.5" rx="1.5" ry="1.5" fill="#cc0000"/>
              <ellipse cx="15.8" cy="14.2" rx="0.5" ry="0.5" fill="#fff"/>
              <ellipse cx="15"   cy="15.5" rx="3.5" ry="1.5" fill="rgba(0,0,0,0.2)"/>
              <ellipse cx="25"   cy="14"   rx="3"   ry="2.5" fill="#e8e8e8"/>
              <ellipse cx="25.5" cy="14.5" rx="1.5" ry="1.5" fill="#cc0000"/>
              <ellipse cx="25.8" cy="14.2" rx="0.5" ry="0.5" fill="#fff"/>
              <ellipse cx="25"   cy="15.5" rx="3.5" ry="1.5" fill="rgba(0,0,0,0.2)"/>
            </>
          )}
          {isShocked
            ? <path d="M14 20 Q20 25 26 20" stroke="#fff700" strokeWidth="2" fill="none" strokeLinecap="round"/>
            : isFaceplant
              ? <path d="M14 21 Q20 19 26 21" stroke="#1a2e1b" strokeWidth="2" fill="none" strokeLinecap="round"/>
              : <>
                  <path d="M14 20 Q20 18 26 20" stroke="#1a2e1b" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  <rect x="17" y="19" width="3" height="3" rx="1" fill="#e8e8e8"/>
                  <rect x="21" y="19" width="3" height="3" rx="1" fill="#e8e8e8"/>
                </>
          }
        </svg>
      </div>
    </>
  );
}
