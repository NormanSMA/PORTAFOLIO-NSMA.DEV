import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/helpers';

type CardVariant = 'project' | 'info' | 'stat' | 'timeline';

interface CardProps extends HTMLAttributes<HTMLElement> {
  variant?: CardVariant;
  as?: 'div' | 'article' | 'li';
  featured?: boolean;
  interactive?: boolean;
  children: ReactNode;
}

interface CardSlotProps {
  children: ReactNode;
  className?: string;
}

// Variants only change layout and density; surface, border, radius and padding stay shared.
const variantStyles: Record<CardVariant, string> = {
  project: 'gap-6',
  info: 'gap-4',
  stat: 'gap-2',
  timeline: 'gap-4 md:grid md:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] md:gap-x-8 md:[&>*+*]:col-start-2',
};

// Lift is a transform; the border tint is the only color change. Duration and easing carry
// the motion-safe prefix so Tailwind emits them after the transition rule.
const interactiveStyles = [
  'motion-safe:transition-[transform,border-color] motion-safe:duration-fast motion-safe:ease-out',
  'motion-safe:pointer-fine:hover:-translate-y-1',
].join(' ');

// A featured border is already primary, so a hover tint would dim it instead of highlighting it.
const interactiveBorderStyles = 'pointer-fine:hover:border-primary/40 focus-within:border-primary/40';

export function Card({
  variant = 'info',
  as: Component = 'div',
  featured = false,
  interactive = false,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <Component
      {...rest}
      data-variant={variant}
      className={cn(
        'group/card relative flex flex-col rounded-card border bg-surface p-card text-fg shadow-card',
        featured ? 'border-primary/50' : 'border-line',
        variantStyles[variant],
        interactive && interactiveStyles,
        interactive && !featured && interactiveBorderStyles,
        className,
      )}
    >
      {children}
    </Component>
  );
}

function CardHeader({ children, className }: CardSlotProps) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-x-4 gap-y-2', className)}>
      {children}
    </div>
  );
}

function CardBody({ children, className }: CardSlotProps) {
  return <div className={cn('flex flex-1 flex-col gap-2', className)}>{children}</div>;
}

function CardFooter({ children, className }: CardSlotProps) {
  return (
    <div className={cn('mt-auto flex flex-wrap items-center gap-2 border-t border-line pt-4', className)}>
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
