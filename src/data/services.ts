import { Bot, Cloud, LayoutDashboard, type LucideIcon } from 'lucide-react';

export interface ServiceItem {
  id: 'automation' | 'systems' | 'cloud';
  icon: LucideIcon;
  title: string;
  description: string;
}

export const getServices = (t: (key: string) => string): ServiceItem[] => [
  {
    id: 'automation',
    icon: Bot,
    title: t('services.automation.title'),
    description: t('services.automation.description'),
  },
  {
    id: 'systems',
    icon: LayoutDashboard,
    title: t('services.systems.title'),
    description: t('services.systems.description'),
  },
  {
    id: 'cloud',
    icon: Cloud,
    title: t('services.cloud.title'),
    description: t('services.cloud.description'),
  },
];
