import { typography } from '../../../config/typography';
import { useLanguage } from '../../../hooks/useLanguage';
import { cn } from '../../../utils/helpers';

interface Channel {
  id: 'email' | 'github' | 'linkedin';
  href: string;
  display: string;
  external: boolean;
}

// Kept here, not read from src/data/social.ts: that file also serves the footer and carries icon paths.
const channels: readonly Channel[] = [
  {
    id: 'email',
    href: 'mailto:norman.martinez003@gmail.com',
    display: 'norman.martinez003@gmail.com',
    external: false,
  },
  {
    id: 'github',
    href: 'https://github.com/NormanSMA',
    display: 'github.com/NormanSMA',
    external: true,
  },
  {
    id: 'linkedin',
    href: 'https://linkedin.com/in/norman-martinez',
    display: 'linkedin.com/in/norman-martinez',
    external: true,
  },
];

export function ContactChannels() {
  const { t } = useLanguage();

  return (
    <ul aria-label={t('contact.channels.label')} className="flex flex-col border-t border-line">
      {channels.map((channel) => (
        <li key={channel.id} className="border-b border-line">
          <a
            href={channel.href}
            target={channel.external ? '_blank' : undefined}
            rel={channel.external ? 'noopener noreferrer' : undefined}
            className="group flex min-h-target flex-col gap-1 py-4"
          >
            <span className={cn(typography.meta, 'text-fg-muted')}>
              {t(`contact.channels.${channel.id}`)}
            </span>
            <span
              className={cn(
                typography.bodyLarge,
                'text-primary-400 underline underline-offset-4 [overflow-wrap:anywhere] pointer-fine:group-hover:text-primary-300',
              )}
            >
              {channel.display}
            </span>
            {channel.external && <span className="sr-only">{t('contact.channels.newTab')}</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}
