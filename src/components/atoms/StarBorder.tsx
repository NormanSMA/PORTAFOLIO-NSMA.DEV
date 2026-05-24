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
  void speed;

  return (
    <div
      className={`relative inline-block rounded-lg border ${className}`}
      style={{
        padding: `${thickness}px 0`,
        borderColor: color,
      }}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
