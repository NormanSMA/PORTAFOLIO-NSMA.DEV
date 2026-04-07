import { Code2, Rocket, Server } from 'lucide-react';

export const getServices = (t: (key: string) => string) => [
  {
    icon: Code2,
    title: t('services.webDev.title'),
    description: t('services.webDev.description'),
  },
  {
    icon: Server,
    title: t('services.backend.title'),
    description: t('services.backend.description'),
  },
  {
    icon: Rocket,
    title: t('services.deployment.title'),
    description: t('services.deployment.description'),
  },
];
