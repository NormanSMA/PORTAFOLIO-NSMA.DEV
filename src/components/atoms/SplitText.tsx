import { useEffect, useRef } from 'react';
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
  from?: Record<string, any>;
  to?: Record<string, any>;
  threshold?: number;
  rootMargin?: string;
  textAlign?: 'left' | 'center' | 'right';
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
  onLetterAnimationComplete,
}: SplitTextProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !text) return;

    // clear previous markup
    el.innerHTML = '';

    const container = document.createElement('span');
    container.style.display = 'inline-block';
    container.style.whiteSpace = 'pre-wrap';
    container.style.textAlign = textAlign as any;

    const targets: HTMLElement[] = [];

    if (splitType === 'words') {
      text.split(' ').forEach((word) => {
        const wordWrap = document.createElement('span');
        wordWrap.className = 'split-word';
        wordWrap.style.display = 'inline-block';
        wordWrap.style.whiteSpace = 'nowrap';
        wordWrap.style.marginRight = '0.35em';
        Array.from(word).forEach((ch) => {
          const chSpan = document.createElement('span');
          chSpan.className = 'split-char';
          chSpan.textContent = ch;
          chSpan.style.display = 'inline-block';
          wordWrap.appendChild(chSpan);
          targets.push(chSpan);
        });
        container.appendChild(wordWrap);
      });
    } else {
      // chars
      Array.from(text).forEach((ch) => {
        const chSpan = document.createElement('span');
        chSpan.className = 'split-char';
        chSpan.textContent = ch;
        chSpan.style.display = 'inline-block';
        chSpan.style.whiteSpace = 'pre';
        container.appendChild(chSpan);
        targets.push(chSpan);
      });
    }

    el.appendChild(container);

    const tween = gsap.fromTo(
      targets,
      { ...from },
      {
        ...to,
        duration,
        ease,
        stagger: delay / 1000,
        onComplete: () => onLetterAnimationComplete?.(),
        scrollTrigger: {
          trigger: el,
          start: `top ${ (1 - threshold) * 100 }%`,
          once: true,
        },
      }
    );

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === el) st.kill();
      });
    };
  }, [text, delay, duration, ease, splitType, JSON.stringify(from), JSON.stringify(to), threshold, rootMargin, textAlign, onLetterAnimationComplete]);

  const Tag = tag as any;
  return <Tag ref={ref} className={`split-parent ${className}`} style={{ overflow: 'hidden', display: 'block' }}>{text}</Tag>;
}
