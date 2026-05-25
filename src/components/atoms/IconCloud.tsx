import { useEffect, useMemo, useState, type ComponentType, type SVGProps } from 'react';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

interface IconCloudItem {
  name: string;
  icon: IconComponent;
}

interface IconCloudProps {
  items: IconCloudItem[];
  className?: string;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

const DESKTOP_POINTER_QUERY = '(any-hover: hover) and (any-pointer: fine)';

function createSpherePoints(count: number): Point3D[] {
  const total = Math.max(count, 1);
  const offset = 2 / total;
  const increment = Math.PI * (3 - Math.sqrt(5));

  return Array.from({ length: total }, (_, index) => {
    const y = index * offset - 1 + offset / 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const phi = index * increment;

    return {
      x: Math.cos(phi) * radius,
      y,
      z: Math.sin(phi) * radius,
    };
  });
}

function rotatePoint(point: Point3D, rotationX: number, rotationY: number): Point3D {
  const cosX = Math.cos(rotationX);
  const sinX = Math.sin(rotationX);
  const cosY = Math.cos(rotationY);
  const sinY = Math.sin(rotationY);

  const rotatedX = point.x * cosY - point.z * sinY;
  const rotatedZ = point.x * sinY + point.z * cosY;
  const rotatedY = point.y * cosX - rotatedZ * sinX;
  const finalZ = point.y * sinX + rotatedZ * cosX;

  return {
    x: rotatedX,
    y: rotatedY,
    z: finalZ,
  };
}

export function IconCloud({ items, className = '' }: IconCloudProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [rotation, setRotation] = useState({ x: -0.25, y: 0.2 });

  const points = useMemo(() => createSpherePoints(items.length), [items.length]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_POINTER_QUERY);

    const updateMode = () => setIsDesktop(mediaQuery.matches);

    updateMode();
    mediaQuery.addEventListener('change', updateMode);

    return () => mediaQuery.removeEventListener('change', updateMode);
  }, []);

  useEffect(() => {
    let frame = 0;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = Math.min(32, time - lastTime);
      lastTime = time;

      const xSpeed = isDesktop ? 0.00016 : 0.00011;
      const ySpeed = isDesktop ? 0.00024 : 0.00016;
      const drift = isDesktop ? 0.00003 : 0.000015;

      setRotation((current) => ({
        x: current.x + delta * (xSpeed + drift * Math.sin(time / 1800)),
        y: current.y + delta * (ySpeed + drift * Math.cos(time / 2100)),
      }));

      frame = window.requestAnimationFrame(animate);
    };

    frame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [isDesktop]);

  return (
    <div
      className={`relative mx-auto aspect-square w-full max-w-[18rem] sm:max-w-[22rem] md:max-w-[26rem] lg:max-w-[30rem] ${className}`}
      aria-label="Technologies cloud"
      role="img"
    >
      <div className="absolute inset-0 rounded-full bg-primary-500/10 blur-3xl" aria-hidden="true" />
      <div className="absolute inset-[10%] rounded-full border border-primary-500/10 dark:border-primary-400/10" aria-hidden="true" />

      <div className="absolute inset-0">
        {items.map((item, index) => {
          const point = rotatePoint(points[index] ?? points[0], rotation.x, rotation.y);
          const depth = (point.z + 1) / 2;
          const scale = 0.72 + depth * 0.55;
          const opacity = 0.35 + depth * 0.65;
          const left = 50 + point.x * 28;
          const top = 50 + point.y * 28;
          const Icon = item.icon;

          return (
            <div
              key={item.name}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-opacity duration-150"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                opacity,
                transform: `translate(-50%, -50%) scale(${scale})`,
                zIndex: Math.round(depth * 100),
              }}
            >
              <div className="group flex flex-col items-center gap-2 rounded-2xl border border-light-border/70 bg-light-card/80 px-3 py-3 shadow-lg shadow-black/5 backdrop-blur-md transition-transform duration-300 hover:scale-[1.03] dark:border-dark-border/70 dark:bg-dark-card/80">
                <div className="h-10 w-10 text-primary-600 transition-transform duration-300 group-hover:scale-110 dark:text-primary-400">
                  <Icon className="h-full w-full" />
                </div>
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-light-textSecondary dark:text-dark-textSecondary">
                  {item.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}