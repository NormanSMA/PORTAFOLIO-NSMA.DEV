import type { ButtonProps } from '../../types';
import { cn } from '../../utils/helpers';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className,
  disabled = false,
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles =
    variant === 'secondary'
      ? 'bg-secondary text-secondary-foreground shadow-sm'
      : variant === 'outline'
        ? 'border border-border text-foreground bg-transparent'
        : 'bg-foreground text-background shadow-sm';

  const sizeStyles =
    size === 'sm'
      ? 'px-4 py-2 text-sm'
      : size === 'lg'
        ? 'px-8 py-4 text-lg'
        : 'px-6 py-3 text-base';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyles, variantStyles, sizeStyles, className)}
    >
      {children}
    </button>
  );
}
