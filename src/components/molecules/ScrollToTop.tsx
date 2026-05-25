import { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks';
import { cn } from '../../utils/helpers';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = window.scrollY;
      setIsVisible(scrolled > 500);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const tooltipText = language === 'es' ? 'Ir arriba' : 'Go to top';

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 transition-all duration-500 ease-out',
        isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-20 scale-75 pointer-events-none'
      )}
    >
      <div className="relative">
        <button
          onClick={scrollToTop}
          className={cn(
            'relative w-14 h-14 flex items-center justify-center text-white shadow-md transition-all duration-300',
            'bg-transparent hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-95',
            'focus:outline-none focus:ring-4 focus:ring-primary-400/40'
          )}
          aria-label={tooltipText}
          style={{ filter: 'drop-shadow(0 8px 18px rgba(79, 70, 229, 0.18))' }}
        >
          <svg
            className="w-14 h-14"
            viewBox="0 0 64 64"
            fill="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="scroll-top-triangle" x1="16" y1="6" x2="48" y2="56" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgb(79,70,229)" />
                <stop offset="100%" stopColor="rgb(99,102,241)" />
              </linearGradient>
            </defs>
            <path
              d="M32 8L56 52H8L32 8Z"
              fill="url(#scroll-top-triangle)"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1.25"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

// static minimal button — no extra injected styles
