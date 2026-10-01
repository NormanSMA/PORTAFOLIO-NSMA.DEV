import { Cloud, Code2, Server, type LucideIcon } from 'lucide-react';

export interface ServiceItem {
  id: 'webDev' | 'backend' | 'deployment';
  icon: LucideIcon;
  title: string;
  description: string;
}

export const getServices = (t: (key: string) => string): ServiceItem[] => [
  {
    id: 'webDev',
    icon: Code2,
    title: t('services.webDev.title'),
    description: t('services.webDev.description'),
  },
  {
    id: 'backend',
    icon: Server,
    title: t('services.backend.title'),
    description: t('services.backend.description'),
  },
  {
    id: 'deployment',
    icon: Cloud,
    title: t('services.deployment.title'),
    description: t('services.deployment.description'),
  },
];
