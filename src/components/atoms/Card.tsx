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

// The glow sits on ::after so hover fades its opacity instead of repainting a box-shadow.
// Duration and easing carry the motion-safe prefix so Tailwind emits them after the transition rule.
const interactiveStyles = [
  'motion-safe:transition-transform motion-safe:duration-fast motion-safe:ease-out',
  'motion-safe:pointer-fine:hover:-translate-y-1',
  "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:content-['']",
  'after:opacity-0 after:shadow-glow-bronze after:transition-opacity after:duration-fast after:ease-out',
  'pointer-fine:hover:after:opacity-100 focus-within:after:opacity-100',
].join(' ');

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
        'group/card relative flex flex-col rounded-card border p-card text-fg shadow-card',
        featured
          ? 'border-transparent [background:var(--card-fill-featured)]'
          : 'border-line [background:var(--card-fill)]',
        variantStyles[variant],
        interactive && interactiveStyles,
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
