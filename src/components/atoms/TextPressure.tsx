import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type TextPressureProps = {
  text?: string;
  fontFamily?: string;
  fontUrl?: string | null;
  width?: boolean;
  weight?: boolean;
  italic?: boolean;
  alpha?: boolean;
  flex?: boolean;
  stroke?: boolean;
  scale?: boolean;
  textColor?: string | undefined;
  strokeColor?: string;
  className?: string;
  minFontSize?: number;
  inheritFontSize?: boolean;
};

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const getAttr = (distance: number, maxDist: number, minVal: number, maxVal: number) => {
  const val = maxVal - Math.abs((maxVal * distance) / maxDist);
  return Math.max(minVal, val + minVal);
};

const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: number | undefined;
  return (...args: any[]) => {
    if (timeoutId) window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func(...args), delay);
  };
};

export default function TextPressure({
  text = 'Compressa',
  fontFamily,
  fontUrl = null,
  width = true,
  weight = true,
  italic = true,
  alpha = false,
  flex = true,
  stroke = false,
  scale = false,
  textColor,
  strokeColor = '#FF0000',
  className = '',
  minFontSize = 24,
  inheritFontSize = true,
}: TextPressureProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const spansRef = useRef<Array<HTMLSpanElement | null>>([]);

  const mouseRef = useRef({ x: 0, y: 0 });
  const cursorRef = useRef({ x: 0, y: 0 });

  const [fontSize, setFontSize] = useState<number>(minFontSize);
  const [scaleY, setScaleY] = useState<number>(1);
  const [lineHeight, setLineHeight] = useState<number>(1);

  const chars = useMemo(() => text.split(''), [text]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      cursorRef.current.x = t.clientX;
      cursorRef.current.y = t.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true } as any);

    if (containerRef.current) {
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = left + width / 2;
      mouseRef.current.y = top + height / 2;
      cursorRef.current.x = mouseRef.current.x;
      cursorRef.current.y = mouseRef.current.y;
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove as any);
    };
  }, []);

  const setSize = useCallback(() => {
    if (inheritFontSize) return;
    if (!containerRef.current || !titleRef.current) return;

    const { width: containerW, height: containerH } = containerRef.current.getBoundingClientRect();

    let newFontSize = containerW / (Math.max(chars.length, 1) / 2);
    newFontSize = Math.max(newFontSize, minFontSize);

    setFontSize(newFontSize);
    setScaleY(1);
    setLineHeight(1);

    requestAnimationFrame(() => {
      if (!titleRef.current) return;
      const textRect = titleRef.current.getBoundingClientRect();

      if (scale && textRect.height > 0) {
        const yRatio = containerH / textRect.height;
        setScaleY(yRatio);
        setLineHeight(yRatio);
      }
    });
  }, [chars.length, minFontSize, scale, inheritFontSize]);

  useEffect(() => {
    if (inheritFontSize) return;
    const debouncedSetSize = debounce(setSize, 100);
    debouncedSetSize();
    window.addEventListener('resize', debouncedSetSize);
    return () => window.removeEventListener('resize', debouncedSetSize);
  }, [setSize, inheritFontSize]);

  useEffect(() => {
    let rafId: number;
    const animate = () => {
      mouseRef.current.x += (cursorRef.current.x - mouseRef.current.x) / 15;
      mouseRef.current.y += (cursorRef.current.y - mouseRef.current.y) / 15;

      if (titleRef.current) {
        const titleRect = titleRef.current.getBoundingClientRect();
        const maxDist = titleRect.width / 2;

        spansRef.current.forEach((span) => {
          if (!span) return;

          const rect = span.getBoundingClientRect();
          const charCenter = {
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2,
          };

          const d = dist(mouseRef.current, charCenter);

          const wdth = width ? Math.floor(getAttr(d, maxDist, 5, 200)) : 100;
          const wght = weight ? Math.floor(getAttr(d, maxDist, 100, 900)) : 400;
          const italVal = italic ? getAttr(d, maxDist, 0, 1).toFixed(2) : '0';
          const alphaVal = alpha ? getAttr(d, maxDist, 0, 1).toFixed(2) : '1';

          const newFontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}`;

          if ((span.style as any).fontVariationSettings !== newFontVariationSettings) {
            (span.style as any).fontVariationSettings = newFontVariationSettings;
          }
          if (alpha && span.style.opacity !== alphaVal) {
            span.style.opacity = alphaVal as any;
          }
        });
      }

      rafId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(rafId);
  }, [width, weight, italic, alpha]);

  const styleElement = useMemo(() => {
    // Only inject @font-face if fontUrl and fontFamily provided; otherwise inherit site typography
    const fontFace = fontUrl && fontFamily
      ? `@font-face { font-family: '${fontFamily}'; src: url('${fontUrl}'); font-style: normal; }`
      : '';

    return (
      <style>{`
        ${fontFace}
        .tp-flex { display: ${flex ? 'flex' : 'inline-block'}; justify-content: space-between; }
        .tp-stroke span { position: relative; color: ${textColor || 'inherit'}; }
        .tp-stroke span::after { content: attr(data-char); position: absolute; left: 0; top: 0; color: transparent; z-index: -1; -webkit-text-stroke-width: 3px; -webkit-text-stroke-color: ${strokeColor}; }
        .tp-title { color: ${textColor || 'inherit'}; }
        .tp-title span { transition: transform 220ms cubic-bezier(.2,.9,.2,1), font-weight 180ms linear, opacity 180ms linear; display: inline-block; transform-origin: center; }
        .tp-title:hover span { transform: scale(1.14); font-weight: 800; }
        @media (prefers-reduced-motion: reduce) {
          .tp-title span { transition: none !important; }
          .tp-title:hover span { transform: none !important; }
        }
      `}</style>
    );
  }, [fontFamily, fontUrl, flex, stroke, textColor, strokeColor]);

  const dynamicClassName = [className, flex ? 'tp-flex' : '', stroke ? 'tp-stroke' : ''].filter(Boolean).join(' ');

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', height: '100%', background: 'transparent' }}
    >
      {styleElement}
      <span
        ref={titleRef}
        className={`tp-title ${dynamicClassName}`}
        style={{
          fontFamily: fontFamily || undefined,
          textTransform: 'none',
          fontSize: inheritFontSize ? undefined : fontSize,
          lineHeight: inheritFontSize ? undefined : lineHeight,
          transform: `scale(1, ${inheritFontSize ? 1 : scaleY})`,
          transformOrigin: 'center top',
          margin: 0,
          textAlign: 'center',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          fontWeight: 600,
          width: '100%',
        }}
      >
        {chars.map((char, i) => (
          <span
            key={i}
            ref={(el) => { spansRef.current[i] = el; }}
            data-char={char}
            style={{
              display: 'inline-block',
              color: stroke ? undefined : 'inherit',
              fontVariationSettings: "'wght' 400, 'wdth' 100, 'ital' 0",
              fontWeight: 'inherit' as any,
            }}
          >
            {char}
          </span>
        ))}
      </span>
    </div>
  );
}
