import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { scrollToSection } from '../../lib/scroll';

interface SectionLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick' | 'id'> {
  sectionId: string;
  // Runs before the scroll starts, for example to close a menu.
  onNavigate?: () => void;
}

// Modified clicks keep the browser behavior (new tab, copy link address).
function isPlainLeftClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export function SectionLink({ sectionId, onNavigate, children, ...rest }: SectionLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainLeftClick(event)) return;
    event.preventDefault();
    onNavigate?.();
    scrollToSection(sectionId);
  };

  return (
    <a {...rest} href={`#${sectionId}`} onClick={handleClick}>
      {children}
    </a>
  );
}
