import { useEffect, useRef } from 'react';

interface PixelBlastProps {
  variant?: 'square' | 'circle' | 'triangle' | 'diamond';
  pixelSize?: number;
  color?: string;
  className?: string;
}

export function PixelBlast({
  variant = 'circle',
  pixelSize = 4,
  color = '#3B82F6',
  className = '',
}: PixelBlastProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Respect users who prefer reduced motion
    const prefersReduced = typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      // Do not run animation loop when reduced motion is set
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
    }> = [];

    const resize = () => {
      // Try to size to the canvas's offsetParent (so the effect
      // is contained inside the Hero section) falling back to window
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    const createParticle = (x: number, y: number) => {
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 1,
      };
    };

    const drawParticle = (particle: typeof particles[0]) => {
      ctx.globalAlpha = particle.life * 0.3;
      ctx.fillStyle = color;

      switch (variant) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, pixelSize, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'square':
          ctx.fillRect(
            particle.x - pixelSize / 2,
            particle.y - pixelSize / 2,
            pixelSize,
            pixelSize
          );
          break;
        default:
          ctx.fillRect(
            particle.x - pixelSize / 2,
            particle.y - pixelSize / 2,
            pixelSize,
            pixelSize
          );
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Crear nuevas partículas aleatorias
      if (Math.random() < 0.1) {
        particles.push(
          createParticle(
            Math.random() * canvas.width,
            Math.random() * canvas.height
          )
        );
      }

      // Actualizar y dibujar partículas
      particles = particles.filter((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.01;

        if (particle.life > 0) {
          drawParticle(particle);
          return true;
        }
        return false;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
  animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [variant, pixelSize, color]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0, willChange: 'transform' }}
    />
  );
}
