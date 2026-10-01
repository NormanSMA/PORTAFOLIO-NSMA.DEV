interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

// The site is dark only, so the light wordmark is the one that reads on the background.
const SRC = '/logo-nsma_light.webp';
const SRC_480W = '/logo-nsma_light-480w.webp';

// Height classes and the rendered width they produce at the 781x312 aspect ratio.
const sizes = {
  sm: { height: 'h-6', sizes: '60px' },
  md: { height: 'h-8', sizes: '80px' },
  lg: { height: 'h-10', sizes: '100px' },
};

export function Logo({ size = 'md' }: LogoProps) {
  return (
    <img
      src={SRC}
      srcSet={`${SRC_480W} 480w, ${SRC} 781w`}
      sizes={sizes[size].sizes}
      alt="nsma.dev"
      width={781}
      height={312}
      decoding="async"
      className={`${sizes[size].height} w-auto`}
    />
  );
}
