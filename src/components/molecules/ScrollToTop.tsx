import { useLanguage } from '../../hooks';
import { useScrollPast } from '../../hooks/useScrollPast';
import { scrollToSection } from '../../lib/scroll';
import { cn } from '../../utils/helpers';

const SHOW_AFTER = 600;

export function ScrollToTop() {
  const { t } = useLanguage();
  const isVisible = useScrollPast(SHOW_AFTER);

  return (
    <button
      type="button"
      onClick={() => scrollToSection('home')}
      aria-label={t('common.backToTop')}
      // inert keeps the hidden button out of the tab order and the accessibility tree.
      inert={!isVisible}
      className={cn(
        'fixed bottom-6 right-gutter z-nav inline-flex h-12 w-12 items-center justify-center rounded-pill border border-line-control bg-surface text-fg shadow-card',
        'transition-[opacity,transform] duration-fast ease-out motion-reduce:transition-none pointer-fine:hover:bg-surface-raised',
        isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
      )}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
