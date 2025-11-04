import type { ReactNode } from 'react';
import { cn } from '../../utils/helpers';

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function Section({ children, className, id }: SectionProps) {
  return (
    <section
      id={id}
      className={cn('py-16 md:py-24', className)}
    >
      {children}
    </section>
  );
}

