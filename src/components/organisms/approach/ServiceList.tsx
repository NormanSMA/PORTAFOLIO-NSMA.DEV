import { useMemo, type CSSProperties } from 'react';
import { typography } from '../../../config/typography';
import { getServices } from '../../../data/services';
import { useLanguage } from '../../../hooks';
import { cn } from '../../../utils/helpers';
import { Card } from '../../atoms/Card';
import { stackTop } from './stack';

interface ServiceListProps {
  labelId: string;
}

// Below lg with motion allowed the cards pile up: a flex column, because a grid row would
// clamp how far a sticky card can travel. The trailing space keeps the full pile in view
// for a moment before it scrolls away with the list. The CSS carries the layout alone:
// the animation in stackServices only scales and dims.
const listLayout = cn(
  'flex flex-col gap-6 motion-reduce:md:grid motion-reduce:md:grid-cols-2 lg:grid lg:grid-cols-3',
  'motion-safe:max-lg:after:block motion-safe:max-lg:after:h-20',
);

const stackLayout = 'motion-safe:max-lg:sticky motion-safe:max-lg:top-[var(--stack-top)]';

export function ServiceList({ labelId }: ServiceListProps) {
  const { t } = useLanguage();
  const services = useMemo(() => getServices(t), [t]);

  return (
    <ul
      role="list"
      aria-labelledby={labelId}
      data-reveal-group="desktop"
      data-stack
      className={listLayout}
    >
      {services.map(({ id, icon: Icon, title, description }, index) => (
        <Card
          key={id}
          as="li"
          variant="info"
          data-reveal
          data-stack-item
          style={{ '--stack-top': stackTop(index) } as CSSProperties}
          className={cn(stackLayout, 'last:md:col-span-2 last:lg:col-span-1')}
        >
          <Icon size={24} strokeWidth={1.75} aria-hidden="true" className="text-fg" />
          <h4 className={cn(typography.h4, 'text-fg')}>{title}</h4>
          <p className={cn(typography.bodySmall, 'text-fg-muted')}>{description}</p>
          <span
            aria-hidden="true"
            data-stack-dim
            className="pointer-events-none absolute -inset-px rounded-card bg-ink opacity-0"
          />
        </Card>
      ))}
    </ul>
  );
}
