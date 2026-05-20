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
  const baseStyles = 'font-medium rounded-lg transition-all duration-300 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles =
    variant === 'secondary'
      ? 'bg-secondary-500 hover:bg-secondary-600 text-white shadow-lg'
      : variant === 'outline'
        ? 'border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white dark:border-primary-400 dark:text-primary-400'
        : 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg hover:shadow-glow';

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
