import { useEffect, useState } from 'react';

/**
 * Secuencia de la intro:
 * 0.0s   → pantalla sólida oscura
 * 0.2s   → cada letra entra en cascada (stagger)
 * 1.4s   → texto completo visible, breve pausa
 * 1.9s   → texto hace scale-up + fade out rapido
 * 2.4s   → overlay hace fade out total
 * 2.6s   → componente se desmonta
 */

const LETTERS = 'nsma.dev'.split('');
const LETTER_DELAY   = 0.11;   // s entre cada letra
const TEXT_HOLD      = 0.5;    // s con texto visible antes de salir
const TOTAL_DURATION = LETTERS.length * LETTER_DELAY + TEXT_HOLD + 1.2; // segundos

export function IntroScreen({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Prevenir scroll mientras la intro está activa
    document.body.style.overflow = 'hidden';

    const exitTimer = setTimeout(() => {
      setLeaving(true);
    }, (TOTAL_DURATION - 0.9) * 1000);

    const doneTimer = setTimeout(() => {
      document.body.style.overflow = '';
      onDone();
    }, TOTAL_DURATION * 1000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
      document.body.style.overflow = '';
    };
  }, [onDone]);

  return (
    <>
      <style>{`
        @keyframes letterIn {
          0%   { opacity: 0; transform: translateY(24px) skewX(-6deg); }
          60%  { opacity: 1; transform: translateY(-4px) skewX(-6deg); }
          100% { opacity: 1; transform: translateY(0)  skewX(-6deg); }
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
          animation: letterIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          font-style: italic;
        }
        .intro-text-leaving {
          animation: textExit 0.5s cubic-bezier(0.4, 0, 1, 1) forwards !important;
          opacity: 1 !important;
        }
        .intro-overlay-leaving {
          animation: overlayFadeOut 0.6s ease-in forwards;
          animation-delay: 0.35s;
        }
      `}</style>

      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center bg-dark-bg ${
          leaving ? 'intro-overlay-leaving' : ''
        }`}
      >
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
          className={`font-display font-bold text-dark-text select-none pointer-events-none ${
            leaving ? 'intro-text-leaving' : ''
          }`}
          style={{ fontSize: 'clamp(3rem, 10vw, 8rem)', lineHeight: 1 }}
          aria-label="nsma.dev"
        >
          {LETTERS.map((char, i) => (
            <span
              key={i}
              className="intro-letter"
              style={{
                animationDelay: `${0.15 + i * LETTER_DELAY}s`,
                // El punto con un toque de color primario
                color: char === '.' ? 'rgb(99 102 241)' : undefined,
              }}
            >
              {char}
            </span>
          ))}
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
