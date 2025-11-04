import { useState, useEffect } from 'react';
import { useTheme, useLanguage, useScrollPosition } from '../../hooks';
import { Logo, Container } from '../atoms';
import { cn, scrollToElement } from '../../utils/helpers';
import { SunIcon, MoonIcon } from '../atoms/icons';


export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const scrollPosition = useScrollPosition();

  const isScrolled = scrollPosition > 50;

  // Cerrar menú al cambiar tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinks = [
    { id: 'home', label: t('nav.home') },
    { id: 'about', label: t('nav.about') },
    { id: 'projects', label: t('nav.projects') },
    { id: 'skills', label: t('nav.skills') },
    { id: 'experience', label: t('nav.experience') },
    { id: 'contact', label: t('nav.contact') },
  ];

  const handleNavClick = (id: string) => {
    scrollToElement(id);
    setIsMenuOpen(false);
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-lg shadow-lg'
          : 'bg-transparent'
      )}
    >
      <Container>
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Logo */}
          <div className="cursor-pointer" onClick={() => handleNavClick('home')}>
            <Logo size="md" />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className="text-light-text dark:text-dark-text hover:text-primary-500 dark:hover:text-primary-400 transition-colors font-medium"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Theme & Language Toggles */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-light-card dark:bg-dark-card hover:bg-primary-500/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon size={20} className="text-light-text dark:text-dark-text" />
              ) : (
                <MoonIcon size={20} className="text-light-text dark:text-dark-text" />
              )}
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 px-3 rounded-lg bg-light-card dark:bg-dark-card hover:bg-primary-500/10 transition-colors font-medium"
              aria-label="Toggle language"
            >
              {language.toUpperCase()}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-light-card dark:bg-dark-card"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span
                className={cn(
                  'w-full h-0.5 bg-light-text dark:bg-dark-text transition-all',
                  isMenuOpen && 'rotate-45 translate-y-2'
                )}
              />
              <span
                className={cn(
                  'w-full h-0.5 bg-light-text dark:bg-dark-text transition-all',
                  isMenuOpen && 'opacity-0'
                )}
              />
              <span
                className={cn(
                  'w-full h-0.5 bg-light-text dark:bg-dark-text transition-all',
                  isMenuOpen && '-rotate-45 -translate-y-2'
                )}
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300',
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="py-4 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className="block w-full text-left px-4 py-2 rounded-lg text-light-text dark:text-dark-text hover:bg-light-card dark:hover:bg-dark-card transition-colors"
              >
                {link.label}
              </button>
            ))}

            {/* Mobile Theme & Language */}
            <div className="flex gap-2 px-4 pt-2">
              <button
                onClick={toggleTheme}
                className="flex-1 p-2 rounded-lg bg-light-card dark:bg-dark-card hover:bg-primary-500/10 transition-colors flex items-center justify-center gap-2"
              >
                {theme === 'dark' ? (
                  <>
                    <SunIcon size={18} />
                    <span>Light</span>
                  </>
                ) : (
                  <>
                    <MoonIcon size={18} />
                    <span>Dark</span>
                  </>
                )}
              </button>
              <button
                onClick={toggleLanguage}
                className="flex-1 p-2 rounded-lg bg-light-card dark:bg-dark-card hover:bg-primary-500/10 transition-colors"
              >
                {language === 'es' ? 'EN' : 'ES'}
              </button>
            </div>
          </div>
        </div>
      </Container>
    </nav>
  );
}
