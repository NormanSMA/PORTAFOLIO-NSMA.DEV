import { useMemo } from 'react';
import { typography } from '../../../config/typography';
import { getServices } from '../../../data/services';
import { useLanguage } from '../../../hooks';
import { cn } from '../../../utils/helpers';
import { Card } from '../../atoms/Card';

interface ServiceListProps {
  labelId: string;
}

export function ServiceList({ labelId }: ServiceListProps) {
  const { t } = useLanguage();
  const services = useMemo(() => getServices(t), [t]);

  return (
    <ul
      role="list"
      aria-labelledby={labelId}
      data-reveal-group
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {services.map(({ id, icon: Icon, title, description }) => (
        <Card
          key={id}
          as="li"
          variant="info"
          data-reveal
          className="last:md:col-span-2 last:lg:col-span-1"
        >
          <Icon size={24} strokeWidth={1.75} aria-hidden="true" className="text-fg" />
          <h4 className={cn(typography.h4, 'text-fg')}>{title}</h4>
          <p className={cn(typography.bodySmall, 'text-fg-muted')}>{description}</p>
        </Card>
      ))}
    </ul>
  );
}
