import { cn } from '../../utils/helpers';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={cn('font-bold', sizes[size])}>
      <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
        nsma.dev
      </span>
    </div>
  );
}
