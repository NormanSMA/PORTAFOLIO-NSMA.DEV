import { useState, type FocusEvent, type MouseEvent } from 'react';
import { motion } from '../../config/motion';
import { sectionIds } from '../../data/navigation';
import { useLanguage } from '../../hooks/useLanguage';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useActiveSection } from '../../hooks/useActiveSection';
import { useHideOnScroll } from '../../hooks/useHideOnScroll';
import { useScrollPast } from '../../hooks/useScrollPast';
import { scrollToSection } from '../../lib/scroll';
import { pathForLanguage } from '../../i18n/route';
import { cn } from '../../utils/helpers';
import { buttonClasses } from '../atoms/buttonStyles';
import { Container } from '../atoms/Container';
import { Logo } from '../atoms/Logo';
import { MobileMenu } from './navbar/MobileMenu';
import { NavLinks } from './navbar/NavLinks';
import { useMobileMenu } from './navbar/useMobileMenu';

const SOLID_AFTER = 24;

// A mouse click leaves focus on the link; only keyboard focus should pin the bar on screen.
function hasKeyboardFocus(target: EventTarget): boolean {
  return target instanceof Element && target.matches(':focus-visible');
}

// A real link so crawlers and visitors without JS reach the other language; with JS it switches in place.
function LanguageSwitch() {
  const { language, toggleLanguage, t } = useLanguage();
  const other = language === 'es' ? 'en' : 'es';

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    toggleLanguage();
  };

  return (
    <a
      href={pathForLanguage(other)}
      hrefLang={other}
      onClick={handleClick}
      aria-label={t('nav.langAria')}
      className={cn(buttonClasses('outline', 'sm'), 'pointer-fine:hover:bg-fg/5')}
    >
      {other.toUpperCase()}
    </a>
  );
}

export function Navbar() {
  const { t } = useLanguage();
  const activeId = useActiveSection(sectionIds);
  const isSolid = useScrollPast(SOLID_AFTER);
  // With reduced motion the bar stays put instead of sliding away.
  const allowsMotion = useMediaQuery(motion.media.noReducedMotion);
  const isScrollingDown = useHideOnScroll(allowsMotion);
  const [isKeyboardInside, setIsKeyboardInside] = useState(false);
  const menu = useMobileMenu();

  const isHidden = isScrollingDown && !isKeyboardInside && !menu.isOpen;

  const handleFocus = (event: FocusEvent<HTMLElement>) => {
    setIsKeyboardInside(hasKeyboardFocus(event.target));
  };

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setIsKeyboardInside(false);
  };

  return (
    <header
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn(
        'fixed inset-x-0 top-0 z-nav transition-transform duration-fast ease-out',
        isHidden && '-translate-y-full',
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-0 z-below border-b border-line bg-ink transition-opacity duration-fast ease-out',
          isSolid ? 'opacity-100' : 'opacity-0',
        )}
      />
      <Container>
        <div className="flex h-16 items-center justify-between gap-4 md:h-20">
          <button
            type="button"
            onClick={() => scrollToSection('home')}
            aria-label={t('nav.logoAria')}
            className="inline-flex min-h-target items-center rounded-control"
          >
            <Logo size="lg" />
          </button>

          <div className="flex items-center gap-2 lg:gap-4">
            <nav aria-label={t('nav.ariaLabel')} className="hidden lg:block">
              <NavLinks variant="bar" activeId={activeId} />
            </nav>
            <LanguageSwitch />
            <MobileMenu menu={menu} activeId={activeId} />
          </div>
        </div>
      </Container>
    </header>
  );
}
