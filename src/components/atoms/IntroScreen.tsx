import { useEffect, useRef, useState } from 'react';

/**
 * Secuencia de la intro:
 * 0.0s   → pantalla sólida oscura
 * 0.2s   → cada letra entra en cascada (stagger)
 * 1.4s   → texto completo visible, breve pausa
 * 1.9s   → texto hace scale-up + fade out rapido
 * 2.4s   → overlay hace fade out total
 * 2.6s   → componente se desmonta
 */

const LETTERS = 'nsma'.split('');
const LETTER_DELAY = 0.11; // s entre cada letra
const MIN_VISIBLE_MS = 1800;
const MAX_VISIBLE_MS = 4200;
const EXIT_ANIMATION_MS = 1000;

export function IntroScreen({ onDone, canExit }: { onDone: () => void; canExit: boolean }) {
  const [leaving, setLeaving] = useState(false);
  const [minTimeReached, setMinTimeReached] = useState(false);
  const doneRef = useRef(false);

  const completeIntro = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    document.body.style.overflow = '';
    onDone();
  };

  const startLeaving = () => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(completeIntro, EXIT_ANIMATION_MS);
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const minTimer = window.setTimeout(() => {
      setMinTimeReached(true);
    }, MIN_VISIBLE_MS);

    const hardStopTimer = window.setTimeout(() => {
      startLeaving();
    }, MAX_VISIBLE_MS);

    return () => {
      window.clearTimeout(minTimer);
      window.clearTimeout(hardStopTimer);
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (minTimeReached && canExit) {
      startLeaving();
    }
  }, [minTimeReached, canExit]);

  return (
    <>
      <style>{`
        @keyframes letterIn {
          0%   { opacity: 0; transform: translateY(18px) scale(0.94) skewX(-6deg); filter: blur(9px); }
          65%  { opacity: 1; transform: translateY(-2px) scale(1.01) skewX(-6deg); filter: blur(0.3px); }
          100% { opacity: 1; transform: translateY(0) scale(1) skewX(-6deg); filter: blur(0); }
        }
        @keyframes letterGlow {
          0%, 100% { text-shadow: 0 0 0 rgba(14,165,233,0); }
          50% { text-shadow: 0 0 16px rgba(14,165,233,0.2); }
        }
        @keyframes wordSettle {
          0% { letter-spacing: 0.16em; opacity: 0.88; }
          100% { letter-spacing: 0.02em; opacity: 1; }
        }
        @keyframes scanSweep {
          0% { transform: translateX(-130%); opacity: 0; }
          20% { opacity: 0.75; }
          80% { opacity: 0.75; }
          100% { transform: translateX(130%); opacity: 0; }
        }
        @keyframes overlayFadeOut {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes textExit {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.18); }
        }
        .intro-letter {
          display: inline-block;
          opacity: 0;
          animation: letterIn 0.62s cubic-bezier(0.22, 1, 0.36, 1) forwards, letterGlow 1.8s ease-in-out infinite;
          font-style: italic;
          will-change: transform, opacity, filter;
        }
        .intro-word {
          position: relative;
          animation: wordSettle 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .intro-scanline {
          position: absolute;
          inset: 18% -10%;
          background: linear-gradient(90deg, transparent 0%, rgba(14,165,233,0.22) 50%, transparent 100%);
          mix-blend-mode: screen;
          filter: blur(2px);
          pointer-events: none;
          animation: scanSweep 1.15s ease-out 0.35s both;
        }
        .intro-text-leaving {
          animation: textExit 0.5s cubic-bezier(0.4, 0, 1, 1) forwards !important;
          opacity: 1 !important;
        }
        .intro-overlay-leaving {
          animation: overlayFadeOut 0.6s ease-in forwards;
          animation-delay: 0.35s;
        }
        .intro-tech-grid {
          background-image:
            linear-gradient(to right, rgba(148, 163, 184, 0.14) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.14) 1px, transparent 1px);
          background-size: 38px 38px;
          mask-image: radial-gradient(circle at center, black 25%, transparent 85%);
          -webkit-mask-image: radial-gradient(circle at center, black 25%, transparent 85%);
        }
      `}</style>

      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center bg-light-bg dark:bg-dark-bg ${
          leaving ? 'intro-overlay-leaving' : ''
        }`}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(1200px 600px at 15% 15%, rgba(14,165,233,0.12), transparent 55%), radial-gradient(900px 500px at 85% 85%, rgba(16,185,129,0.10), transparent 58%)',
          }}
          aria-hidden
        />
        <div className="intro-tech-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(2,6,23,0.04) 100%)',
          }}
          aria-hidden
        />

        {/* Línea decorativa superior */}
        <div
          className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-primary-500 to-secondary-500"
          style={{
            width: leaving ? '0%' : '100%',
            transition: 'width 0.5s ease-in',
            transitionDelay: '0.1s',
          }}
        />

        {/* Texto principal */}
        <div
          className={`font-display font-bold text-light-text dark:text-dark-text select-none pointer-events-none ${
            leaving ? 'intro-text-leaving' : ''
          }`}
          style={{ fontSize: 'clamp(3rem, 10vw, 8rem)', lineHeight: 1 }}
          aria-label="nsma"
        >
          <div className="intro-word">
            <div className="intro-scanline" aria-hidden />
            {LETTERS.map((char, i) => (
              <span
                key={i}
                className="intro-letter"
                style={{
                  animationDelay: `${0.15 + i * LETTER_DELAY}s`,
                  color: char === '.' ? 'rgb(14 165 233)' : undefined,
                }}
              >
                {char}
              </span>
            ))}
          </div>
        </div>

        {/* Línea decorativa inferior */}
        <div
          className="absolute bottom-0 right-0 h-[2px] bg-gradient-to-l from-primary-500 to-secondary-500"
          style={{
            width: leaving ? '0%' : '100%',
            transition: 'width 0.5s ease-in',
            transitionDelay: '0.1s',
          }}
        />
      </div>
    </>
  );
}
