import { useEffect, useRef, type CSSProperties, type ElementType } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type SplitTextProps = {
  text: string;
  tag?: string;
  className?: string;
  delay?: number; // ms
  duration?: number; // seconds
  ease?: string;
  splitType?: 'chars' | 'words';
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  textAlign?: 'left' | 'center' | 'right';
  animateOn?: 'mount' | 'scroll';
  onLetterAnimationComplete?: () => void;
};

export default function SplitText({
  text,
  tag = 'p',
  className = '',
  delay = 50,
  duration = 0.6,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 20 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  animateOn = 'scroll',
  onLetterAnimationComplete,
}: SplitTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const fromKey = JSON.stringify(from);
  const toKey = JSON.stringify(to);

  useEffect(() => {
    const el = ref.current;
    if (!el || !text) return;

    const targets = Array.from(el.querySelectorAll<HTMLElement>('.split-char'));
    if (targets.length === 0) return;

    const animationConfig = {
      ...to,
      duration,
      ease,
      stagger: delay / 1000,
      force3D: true, // Habilitar aceleración de hardware por GPU
      onComplete: () => onLetterAnimationComplete?.(),
    };

    let tween: gsap.core.Tween;

    if (animateOn === 'mount') {
      // Animación inmediata sin inicializar ScrollTrigger
      tween = gsap.fromTo(targets, { ...from }, { ...animationConfig });
    } else {
      // Animación por ScrollTrigger
      tween = gsap.fromTo(
        targets,
        { ...from },
        {
          ...animationConfig,
          scrollTrigger: {
            trigger: el,
            start: `top ${(1 - threshold) * 100}%`,
            once: true,
          },
        }
      );
    }

    return () => {
      tween.kill();
      if (animateOn === 'scroll') {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === el) st.kill();
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, delay, duration, ease, splitType, fromKey, toKey, threshold, rootMargin, textAlign, animateOn, onLetterAnimationComplete]);

  // The spans come only from `text`, so the server and the first client render give the same markup.
  const charStyle: CSSProperties = { display: 'inline-block', willChange: 'transform, opacity', ...(splitType === 'words' ? {} : { whiteSpace: 'pre' }) };
  const Tag = tag as ElementType;
  return (
    <Tag ref={ref} className={`split-parent ${className}`} style={{ overflow: 'hidden', display: 'block', willChange: 'transform, opacity' }}>
      <span style={{ display: 'inline-block', whiteSpace: 'pre-wrap', textAlign }}>
        {splitType === 'words'
          ? text.split(' ').map((word, wordIndex) => (
              <span
                key={wordIndex}
                className="split-word"
                style={{ display: 'inline-block', whiteSpace: 'nowrap', marginRight: '0.35em' }}
              >
                {Array.from(word).map((ch, index) => (
                  <span key={index} className="split-char" style={charStyle}>
                    {ch}
                  </span>
                ))}
              </span>
            ))
          : Array.from(text).map((ch, index) => (
              <span key={index} className="split-char" style={charStyle}>
                {ch}
              </span>
            ))}
      </span>
    </Tag>
  );
}
