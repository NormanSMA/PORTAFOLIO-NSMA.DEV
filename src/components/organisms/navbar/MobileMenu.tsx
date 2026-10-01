import { useId } from 'react';
import { typography } from '../../../config/typography';
import { useLanguage } from '../../../hooks/useLanguage';
import { cn } from '../../../utils/helpers';
import { Button } from '../../atoms/Button';
import { NavLinks } from './NavLinks';
import type { MobileMenuState } from './useMobileMenu';

interface MobileMenuProps {
  menu: MobileMenuState;
  activeId: string;
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function MobileMenu({ menu, activeId }: MobileMenuProps) {
  const { t } = useLanguage();
  const dialogId = useId();
  const titleId = useId();

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="px-3 lg:hidden"
        aria-label={t('nav.menuAria')}
        aria-expanded={menu.isOpen}
        aria-controls={dialogId}
        aria-haspopup="dialog"
        onClick={(event) => menu.open(event.currentTarget)}
      >
        <MenuIcon />
      </Button>

      <dialog
        ref={menu.dialogRef}
        id={dialogId}
        aria-labelledby={titleId}
        data-lenis-prevent=""
        onCancel={(event) => {
          event.preventDefault();
          menu.close();
        }}
        onKeyDown={(event) => {
          if (event.key !== 'Escape') return;
          event.preventDefault();
          menu.close();
        }}
        className="m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto overscroll-contain border-0 bg-ink p-0 text-fg lg:hidden"
      >
        <div className="flex h-16 items-center justify-between px-gutter md:h-20">
          <p id={titleId} className={cn(typography.eyebrow, 'text-fg-muted')}>
            {t('nav.menuTitle')}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="px-3"
            aria-label={t('nav.closeMenuAria')}
            onClick={menu.close}
          >
            <CloseIcon />
          </Button>
        </div>
        <nav aria-label={t('nav.ariaLabel')} className="px-gutter pb-8">
          <NavLinks variant="menu" activeId={activeId} onNavigate={menu.close} />
        </nav>
      </dialog>
    </>
  );
}
