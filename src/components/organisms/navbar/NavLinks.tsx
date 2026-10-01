import { typography } from '../../../config/typography';
import { navItems } from '../../../data/navigation';
import { useLanguage } from '../../../hooks';
import { cn } from '../../../utils/helpers';
import { SectionLink } from '../../atoms/SectionLink';

interface NavLinksProps {
  activeId: string;
  variant: 'bar' | 'menu';
  onNavigate?: () => void;
}

const layouts = {
  bar: {
    list: 'flex items-center gap-1',
    link: cn(typography.bodySmall, 'inline-flex min-h-target items-center rounded-control px-3 font-medium'),
  },
  menu: {
    list: 'flex flex-col',
    link: cn(typography.h3, 'flex min-h-14 items-center border-b border-line'),
  },
};

// The underline marks the current section so the state does not rely on color alone.
const activeStyles = 'text-fg underline decoration-primary-400 decoration-2 underline-offset-8';
const idleStyles = 'text-fg-muted pointer-fine:hover:text-fg';

export function NavLinks({ activeId, variant, onNavigate }: NavLinksProps) {
  const { t } = useLanguage();
  const layout = layouts[variant];

  return (
    <ul className={layout.list}>
      {navItems.map(({ id, labelKey }) => {
        const isActive = id === activeId;
        return (
          <li key={id}>
            <SectionLink
              sectionId={id}
              onNavigate={onNavigate}
              aria-current={isActive ? 'true' : undefined}
              className={cn(layout.link, isActive ? activeStyles : idleStyles)}
            >
              {t(labelKey)}
            </SectionLink>
          </li>
        );
      })}
    </ul>
  );
}
