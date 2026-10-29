import { typography } from '../../../config/typography';
import { navItems } from '../../../data/navigation';
import { useLanguage } from '../../../hooks/useLanguage';
import { cn } from '../../../utils/helpers';
import { SectionLink } from '../../atoms/SectionLink';
import { NavLine } from './NavLine';

interface NavLinksProps {
  activeId: string;
  variant: 'bar' | 'menu';
  onNavigate?: () => void;
}

const layouts = {
  bar: {
    list: 'flex items-center gap-1',
    link: cn(typography.bodySmall, 'inline-flex min-h-target items-center whitespace-nowrap rounded-control px-3 font-medium'),
  },
  menu: {
    list: 'flex flex-col',
    link: cn(typography.h3, 'flex min-h-14 items-center border-b border-line'),
  },
};

// The line marks the current section so the state does not rely on color alone. In the bar it is the single
// line of NavLine, which slides between links; in the menu each link keeps its own underline.
const activeStyles = {
  bar: 'text-fg',
  menu: 'text-fg underline decoration-primary-400 decoration-2 underline-offset-8',
};
const idleStyles = 'text-fg-muted pointer-fine:hover:text-fg';

export function NavLinks({ activeId, variant, onNavigate }: NavLinksProps) {
  const { t } = useLanguage();
  const layout = layouts[variant];

  const list = (
    <ul className={layout.list}>
      {navItems.map(({ id, labelKey }) => {
        const isActive = id === activeId;
        return (
          <li key={id}>
            <SectionLink
              sectionId={id}
              onNavigate={onNavigate}
              aria-current={isActive ? 'true' : undefined}
              className={cn(layout.link, isActive ? activeStyles[variant] : idleStyles)}
            >
              {t(labelKey)}
            </SectionLink>
          </li>
        );
      })}
    </ul>
  );

  if (variant === 'menu') return list;
  return (
    <div className="relative">
      {list}
      <NavLine activeId={activeId} />
    </div>
  );
}
