import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/helpers';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

// Fills use step 600: white text on step 500 measures below 4.5:1. The glow is a hover effect of the
// primary only, and box-shadow stays out of the transition list so it never animates.
// Every variant carries a border so all of them measure the same height.
const baseStyles = [
  'inline-flex min-h-target min-w-target items-center justify-center gap-2 rounded-control border border-transparent font-medium',
  'transition-[color,background-color,border-color,transform] duration-fast ease-out',
  'motion-safe:active:scale-[0.98]',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
  'disabled:cursor-not-allowed disabled:opacity-50',
].join(' ');

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 text-fg enabled:pointer-fine:hover:bg-primary-700 enabled:pointer-fine:hover:shadow-glow',
  secondary: 'bg-secondary-600 text-fg enabled:pointer-fine:hover:bg-secondary-700',
  outline: 'border-line-control text-fg enabled:pointer-fine:hover:bg-fg/5',
  ghost: 'text-primary-400 enabled:pointer-fine:hover:bg-primary-500/10',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
    >
      {children}
    </button>
  );
}
