import { Fragment } from 'react';
import { typography } from '../../../config/typography';
import type { SocialLink } from '../../../data/social';
import { useLanguage } from '../../../hooks';
import { cn } from '../../../utils/helpers';
import { Card } from '../../atoms/Card';

// Plain scheme and "www." add noise to the visible value; the href keeps the full address.
function displayValue(url: string) {
  return url.replace(/^(https?:\/\/(www\.)?|mailto:)/, '');
}

// Offers a break after "@" and "/" so a narrow card wraps at a natural point.
// overflow-wrap on the text still covers any other overflow.
function breakable(value: string) {
  return value
    .split(/([@/])/)
    .map((part, index) =>
      index % 2 === 1 ? (
        <Fragment key={index}>
          {part}
          <wbr />
        </Fragment>
      ) : (
        part
      ),
    );
}

// Same paths as the footer: the mail icon is drawn with strokes, the brand icons are filled shapes.
function ChannelIcon({ iconPath, stroke }: Pick<SocialLink, 'iconPath' | 'stroke'>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 shrink-0 text-fg"
      fill={stroke ? 'none' : 'currentColor'}
      stroke={stroke ? 'currentColor' : 'none'}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={iconPath} />
    </svg>
  );
}

interface ContactCardProps {
  link: SocialLink;
}

export function ContactCard({ link }: ContactCardProps) {
  const { t } = useLanguage();
  const isExternal = link.url.startsWith('http');

  return (
    <a
      href={link.url}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="flex flex-1 rounded-card"
    >
      <Card variant="info" interactive className="flex-1">
        <ChannelIcon iconPath={link.iconPath} stroke={link.stroke} />
        <span className="flex flex-col gap-1">
          <span className={cn(typography.h5, 'text-fg')}>
            {t(`contact.channels.${link.name.toLowerCase()}`)}
          </span>
          <span
            className={cn(
              typography.bodySmall,
              'text-primary-400 underline underline-offset-4 [overflow-wrap:anywhere] pointer-fine:group-hover/card:text-primary-300',
            )}
          >
            {breakable(displayValue(link.url))}
          </span>
        </span>
        {isExternal && <span className="sr-only">{t('contact.channels.newTab')}</span>}
      </Card>
    </a>
  );
}
