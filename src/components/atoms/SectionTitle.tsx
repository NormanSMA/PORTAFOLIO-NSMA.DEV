import type { ReactNode } from 'react';
import { cn } from '../../utils/helpers';

interface SectionTitleProps {
  children: ReactNode;
  subtitle?: string;
  className?: string;
}

export function SectionTitle({ children, subtitle, className }: SectionTitleProps) {
  return (
    <div className={cn('text-center mb-12', className)}>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
        {children}
      </h2>
      {subtitle && (
        <p className="text-lg text-light-textSecondary dark:text-dark-textSecondary max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
