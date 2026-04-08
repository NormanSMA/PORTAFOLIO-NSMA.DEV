export type LogoVariant = 'A';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: LogoVariant;
}

export function Logo({ size = 'md' }: LogoProps) {
  const textSize =
    size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-3xl' : 'text-2xl';

  return (
    <span
      className={`select-none pointer-events-none inline-flex items-baseline leading-none font-display font-bold italic ${textSize} text-light-text dark:text-dark-text`}
      data-logo-mark
      aria-label="nsma.dev"
    >
      nsma.dev
    </span>
  );
}
