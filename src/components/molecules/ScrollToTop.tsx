import { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks';
import { cn } from '../../utils/helpers';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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
        'fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 transition-all duration-500 ease-out',
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-20 scale-75 pointer-events-none'
      )}
    >
      <div className="relative">
        {/* Círculo de fondo con efecto de ondas */}
        <div className={cn(
          'absolute inset-0 rounded-full bg-primary-500/20 blur-xl transition-all duration-300',
          isHovered ? 'scale-150 opacity-100' : 'scale-100 opacity-60'
        )} />
        
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
            className="text-light-border dark:text-dark-border opacity-30"
          />
          <circle
            cx="32"
            cy="32"
            r="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-primary-500 transition-all duration-300"
            style={{
              strokeDasharray: `${2 * Math.PI * 30}`,
              strokeDashoffset: `${2 * Math.PI * 30 * (1 - scrollProgress / 100)}`
            }}
          />
        </svg>

        {/* Botón principal */}
        <button
          onClick={scrollToTop}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            'relative w-16 h-16 rounded-full transition-all duration-300',
            'bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700',
            'text-white shadow-xl hover:shadow-2xl',
            'transform hover:scale-110 active:scale-95',
            'focus:outline-none focus:ring-4 focus:ring-primary-400/50',
            'flex items-center justify-center'
          )}
          aria-label={tooltipText}
        >
          {/* Icono de flecha con animación */}
          <div className={cn(
            'relative transition-transform duration-300',
            isHovered && '-translate-y-1'
          )}>
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

          {/* Efecto de brillo en hover */}
          <div className={cn(
            'absolute inset-0 rounded-full bg-white/20 transition-opacity duration-300',
            isHovered ? 'opacity-100' : 'opacity-0'
          )} />
        </button>

        {/* Tooltip al hacer hover */}
        <div className={cn(
          'absolute bottom-full right-0 mb-3 transition-all duration-300 pointer-events-none',
          isHovered 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-2'
        )}>
          <div className="px-3 py-2 rounded-lg bg-dark-bg dark:bg-light-bg text-dark-text dark:text-light-text text-sm font-medium whitespace-nowrap shadow-lg">
            {tooltipText}
            <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-dark-bg dark:border-t-light-bg" />
          </div>
        </div>
      </div>
    </div>
  );
}
