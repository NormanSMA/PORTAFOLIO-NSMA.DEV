import { useCallback, useEffect, useMemo, useRef, useState, type ElementType, type Ref } from 'react';

type DecryptedTextProps = {
  text: string;
  speed?: number; // ms
  maxIterations?: number;
  sequential?: boolean;
  // revealDirection removed (not used) to keep implementation minimal
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  parentClassName?: string;
  encryptedClassName?: string;
  animateOn?: 'view' | 'hover' | 'inViewHover' | 'click';
  clickMode?: 'once' | 'toggle';
  tag?: string;
  startDelay?: number;
};

const DEFAULT_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+[]{}<>?/|\\~`-=';

export default function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = false,
  // revealDirection omitted
  useOriginalCharsOnly = false,
  characters = DEFAULT_CHARS,
  className = '',
  parentClassName = '',
  encryptedClassName = '',
  animateOn = 'hover',
  clickMode = 'once',
  tag = 'span',
  startDelay = 0,
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(animateOn !== 'click');

  const containerRef = useRef<HTMLElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const availableChars = useMemo(() => {
    if (useOriginalCharsOnly) {
      return Array.from(new Set(text.split(''))).filter(c => c !== ' ');
    }
    return characters.split('');
  }, [useOriginalCharsOnly, text, characters]);

  const shuffleText = useCallback((original: string, revealed: Set<number>) => {
    return original
      .split('')
      .map((ch, i) => {
        if (ch === ' ') return ' ';
        if (revealed.has(i)) return original[i];
        return availableChars[Math.floor(Math.random() * availableChars.length)];
      })
      .join('');
  }, [availableChars]);

  // (no-op helper removed) keeping implementation minimal

  const triggerDecrypt = useCallback(() => {
    setIsAnimating(true);
    setRevealedIndices(new Set());
  }, []);

  useEffect(() => {
    if (!isAnimating) return;
    let iterations = 0;

    intervalRef.current = window.setInterval(() => {
      setDisplayText(prev => {
        iterations++;
        const revealed = new Set(revealedIndices);
        // non-sequential: show more random selections until maxIterations
        if (!sequential) {
          if (iterations >= maxIterations) {
            setIsAnimating(false);
            setHasAnimated(true);
            setIsDecrypted(true);
            window.clearInterval(intervalRef.current!);
            return text;
          }
          return shuffleText(text, revealed);
        }

        // sequential: reveal one char per tick
        const nextIdx = Array.from({ length: text.length }, (_, i) => i).find(i => !revealed.has(i));
        if (typeof nextIdx === 'number') {
          revealed.add(nextIdx);
          setRevealedIndices(revealed);
          if (revealed.size >= text.length) {
            setIsAnimating(false);
            setHasAnimated(true);
            setIsDecrypted(true);
            window.clearInterval(intervalRef.current!);
            return text;
          }
          setDisplayText(shuffleText(text, revealed));
        }
        return prev;
      });
    }, speed);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [isAnimating, shuffleText, sequential, text, speed, maxIterations, revealedIndices]);

  /* Hover handlers */
  const handleMouseEnter = () => {
    if (animateOn === 'hover' || animateOn === 'inViewHover') {
      if (!isAnimating) {
        if (startDelay > 0) {
          timeoutRef.current = window.setTimeout(() => triggerDecrypt(), startDelay);
        } else {
          triggerDecrypt();
        }
      }
    }
  };
  const handleMouseLeave = () => {
    if (animateOn === 'hover' || animateOn === 'inViewHover') {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      setIsAnimating(false);
      setDisplayText(text);
      setRevealedIndices(new Set());
      setIsDecrypted(true);
    }
  };

  /* Click */
  const handleClick = () => {
    if (animateOn !== 'click') return;
    if (clickMode === 'once' && isDecrypted) return;
    triggerDecrypt();
  };

  /* View observer */
  useEffect(() => {
    if (animateOn !== 'view' && animateOn !== 'inViewHover') return;
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          if (startDelay > 0) {
            timeoutRef.current = window.setTimeout(() => {
              triggerDecrypt();
              setHasAnimated(true);
            }, startDelay);
          } else {
            triggerDecrypt();
            setHasAnimated(true);
          }
        }
      });
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => {
      obs.disconnect();
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [animateOn, hasAnimated, triggerDecrypt, startDelay]);

  useEffect(() => {
    // initial state
    setDisplayText(text);
    setRevealedIndices(new Set());
    setIsDecrypted(animateOn !== 'click');
  }, [text, animateOn]);

  const Tag = tag as ElementType;
  return (
    <Tag
      ref={containerRef as Ref<HTMLElement>}
      className={parentClassName}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      aria-label={text}
    >
      {displayText.split('').map((ch, i) => (
        <span key={i} className={revealedIndices.has(i) || (!isAnimating && isDecrypted) ? className : encryptedClassName}>
          {ch}
        </span>
      ))}
    </Tag>
  );
}
