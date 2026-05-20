import type { ReactNode } from 'react';

interface StarBorderProps {
  children: ReactNode;
  className?: string;
  color?: string;
  speed?: string;
  thickness?: number;
}

export function StarBorder({
  children,
  className = '',
  color = '#3B82F6', // azul eléctrico (blue-500)
  speed = '6s',
  thickness = 1,
}: StarBorderProps) {
  return (
    <div
      className={`relative inline-block overflow-hidden rounded-lg ${className}`}
      style={{ padding: `${thickness}px 0` }}
    >
      {/* Bottom star animation */}
      <div
        className="absolute w-[300%] h-[50%] opacity-70 bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      
      {/* Top star animation */}
      <div
        className="absolute w-[300%] h-[50%] opacity-70 top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
