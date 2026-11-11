import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/helpers';
import { buttonClasses, type ButtonSize, type ButtonVariant } from './buttonStyles';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

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
      className={cn(buttonClasses(variant, size), className)}
    >
      {children}
    </button>
  );
}
