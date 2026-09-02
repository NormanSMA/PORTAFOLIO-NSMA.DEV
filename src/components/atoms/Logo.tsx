import { useTheme } from '../../hooks';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ size = 'md' }: LogoProps) {
  const { theme } = useTheme();
  
  const sizes = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
  };

  const logoSrc = theme === 'dark' ? '/logo-nsma_light.webp' : '/logo-nsma_dark.webp';

  return (
    <img
      src={logoSrc}
      srcSet={`${logoSrc.replace('.webp', '-480w.webp')} 480w, ${logoSrc} 781w`}
      sizes="100px"
      alt="nsma.dev"
      width={781}
      height={312}
      decoding="async"
      className={`${sizes[size]} w-auto transition-opacity duration-300`}
    />
  );
}
