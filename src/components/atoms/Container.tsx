import type { ReactNode } from 'react';
import { cn } from '../../utils/helpers';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn('mx-auto w-full max-w-container px-gutter', className)}>
      {children}
    </div>
  );
}
