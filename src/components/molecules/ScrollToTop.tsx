import { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks';
import { cn } from '../../utils/helpers';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { language } = useLanguage();

  useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrolled / maxScroll) * 100;
      
      setScrollProgress(progress);
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
        'fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40',
        isVisible ? 'block' : 'hidden'
      )}
    >
      <div className="relative">
        {/* Progress Ring */}
        <svg 
          className="absolute inset-0 w-full h-full -rotate-90"
          width="64" 
          height="64"
          viewBox="0 0 64 64"
        >
          <circle
            cx="32"
            cy="32"
            r="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-border opacity-30"
          />
          <circle
            cx="32"
            cy="32"
            r="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-foreground transition-all duration-300"
            style={{
              strokeDasharray: `${2 * Math.PI * 30}`,
              strokeDashoffset: `${2 * Math.PI * 30 * (1 - scrollProgress / 100)}`
            }}
          />
        </svg>

        {/* Botón principal */}
        <button
          onClick={scrollToTop}
          className={cn(
            'relative w-16 h-16 rounded-full',
            'bg-foreground text-background shadow-xl',
            'focus:outline-none focus:ring-4 focus:ring-ring/50',
            'flex items-center justify-center'
          )}
          aria-label={tooltipText}
        >
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}
