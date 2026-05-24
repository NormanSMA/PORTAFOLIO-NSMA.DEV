import { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage, useScrollPosition } from '../../hooks';
import { Logo, Container, StarBorder, AnimatedThemeToggler } from '../atoms';
import { cn, scrollToElement } from '../../utils/helpers';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  
  const { language, toggleLanguage, t } = useLanguage();
  const scrollPosition = useScrollPosition();

  const isScrolled = scrollPosition > 50;
  const [activeSection, setActiveSection] = useState<string>('home');

  const navLinks = useMemo(() => [
    { id: 'home', label: t('nav.home') },
    { id: 'about', label: t('nav.about') },
    { id: 'services', label: t('nav.services') },
    { id: 'projects', label: t('nav.projects') },
    { id: 'education-skills', label: t('nav.experience') },
    { id: 'contact', label: t('nav.contact') },
  ], [t]);

  // Auto-hide navbar al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 100) {
        // Siempre visible en el top
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        // Scrolling hacia abajo - ocultar
        setIsVisible(false);
        setIsMenuOpen(false);
      } else {
        // Scrolling hacia arriba - mostrar
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Track active section based on scroll position
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const centerPoint = window.scrollY + window.innerHeight / 3;
    let current = 'home';

    for (const link of navLinks) {
      const el = document.getElementById(link.id);
      if (!el) continue;
      const top = el.offsetTop;
      if (top <= centerPoint) current = link.id;
    }

    setActiveSection(current);
  }, [scrollPosition, navLinks]);

  const handleNavClick = (id: string) => {
    scrollToElement(id);
    setIsMenuOpen(false);
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        isScrolled || isMenuOpen
          ? 'bg-background/80 shadow-lg backdrop-blur'
          : 'bg-transparent',
        isVisible ? 'block' : 'hidden'
      )}
    >

      <Container>
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Logo */}
          <div className="cursor-pointer" onClick={() => handleNavClick('home')} role="button" aria-label="Go to homepage" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNavClick('home'); }}>
            <Logo size="md" />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={cn(
                  'font-medium cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  activeSection === link.id
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
                aria-current={activeSection === link.id ? 'page' : undefined}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Theme & Language Toggles with StarBorder */}
          <div className="hidden md:flex items-center gap-4">
            <StarBorder color="#3B82F6" speed="8s" thickness={1}>
              <AnimatedThemeToggler
                className="p-2 rounded-lg bg-card border border-border"
                iconSize={20}
              />
            </StarBorder>

            <StarBorder color="#6366F1" speed="8s" thickness={1}>
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-lg bg-card/90 border border-border font-semibold text-sm flex items-center justify-center min-w-[56px]"
                aria-label="Toggle language"
              >
                {/* clearer, slightly larger language label */}
                <span className="inline-block w-8 text-center text-foreground">{language.toUpperCase()}</span>
              </button>
            </StarBorder>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <StarBorder color="#3B82F6" speed="6s" thickness={1}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg bg-card border border-border"
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                <div className="w-6 h-5 flex flex-col justify-between">
                  <span className={cn('w-full h-0.5 bg-foreground', isMenuOpen && 'rotate-45 translate-y-2')} />
                  <span className={cn('w-full h-0.5 bg-foreground', isMenuOpen && 'opacity-0')} />
                  <span className={cn('w-full h-0.5 bg-foreground', isMenuOpen && '-rotate-45 -translate-y-2')} />
                </div>
              </button>
            </StarBorder>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="py-4 space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={cn(
                    'block w-full text-left px-4 py-2 rounded-lg',
                    activeSection === link.id
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                  aria-current={activeSection === link.id ? 'page' : undefined}
                >
                  {link.label}
                </button>
              ))}

              <div className="flex gap-2 px-4 pt-2">
                <StarBorder color="#3B82F6" speed="8s" thickness={1} className="flex-1">
                  <AnimatedThemeToggler
                    className="w-full p-2 rounded-lg bg-card border border-border flex items-center justify-center gap-2"
                    iconSize={18}
                  />
                </StarBorder>
                
                <StarBorder color="#6366F1" speed="8s" thickness={1} className="flex-1">
                  <button
                    onClick={toggleLanguage}
                    className="w-full p-2 rounded-lg bg-card/90 border border-border font-semibold text-sm flex items-center justify-center"
                  >
                    <span className="inline-block w-8 text-center text-foreground">{language === 'es' ? 'EN' : 'ES'}</span>
                  </button>
                </StarBorder>
              </div>
            </div>
          </div>
        )}
      </Container>
    </nav>
  );
}
