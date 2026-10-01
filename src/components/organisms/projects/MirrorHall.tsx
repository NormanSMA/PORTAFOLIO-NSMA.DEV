import type { ReactNode } from 'react';

export interface MirrorHallItem {
  id: string;
  label: string;
  title: string;
  caption: string;
  image: ReactNode;
}

export interface MirrorHallProps {
  items: MirrorHallItem[];
  ariaLabel: string;
  previousLabel: string;
  nextLabel: string;
  onActiveChange: (index: number) => void;
}

// Placeholder with the final contract; the 3D ring replaces this body.
export function MirrorHall({ items, ariaLabel }: MirrorHallProps) {
  return (
    <ul aria-label={ariaLabel} className="flex gap-4 overflow-x-auto">
      {items.map((item) => (
        <li key={item.id} className="w-64 shrink-0">
          {item.image}
          <p>{item.title}</p>
        </li>
      ))}
    </ul>
  );
}
