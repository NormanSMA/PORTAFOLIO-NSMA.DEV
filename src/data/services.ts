import { CodeIcon, DatabaseIcon, MobileIcon } from '../components/atoms/icons';

export const getServices = (t: (key: string) => string) => [
  {
    icon: CodeIcon, // Passing component reference, not element
    title: t('services.webDev.title'),
    description: t('services.webDev.description'),
  },
  {
    icon: DatabaseIcon,
    title: t('services.backend.title'),
    description: t('services.backend.description'),
  },
  {
    icon: MobileIcon,
    title: t('services.deployment.title'),
    description: t('services.deployment.description'),
  },
];
