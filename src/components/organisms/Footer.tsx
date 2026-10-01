import { typography } from '../../config/typography';
import { navItems } from '../../data/navigation';
import { socialLinks, type SocialLink } from '../../data/social';
import { useLanguage } from '../../hooks/useLanguage';
import { cn } from '../../utils/helpers';
import { Container } from '../atoms/Container';
import { Logo } from '../atoms/Logo';
import { SectionLink } from '../atoms/SectionLink';

const linkStyles =
  'inline-flex min-h-target items-center gap-3 rounded-control text-fg-muted pointer-fine:hover:text-fg pointer-fine:hover:underline underline-offset-4';

function SocialIcon({ iconPath, stroke }: Pick<SocialLink, 'iconPath' | 'stroke'>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
      fill={stroke ? 'none' : 'currentColor'}
      stroke={stroke ? 'currentColor' : 'none'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={iconPath} />
    </svg>
  );
}

export function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-ink">
      <Container className="py-12 md:py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr] md:gap-8">
          <div className="flex flex-col items-start gap-4">
            <SectionLink
              sectionId="home"
              aria-label={t('nav.logoAria')}
              className="inline-flex min-h-target items-center rounded-control"
            >
              <Logo size="lg" />
            </SectionLink>
            <p className={cn(typography.bodySmall, 'max-w-xs text-fg-muted')}>{t('footer.tagline')}</p>
          </div>

          <nav aria-label={t('footer.ariaNav')}>
            <h2 className={cn(typography.h5, 'mb-2 text-fg')}>{t('footer.quickLinks')}</h2>
            <ul>
              {navItems.map(({ id, labelKey }) => (
                <li key={id}>
                  <SectionLink sectionId={id} className={cn(typography.bodySmall, linkStyles)}>
                    {t(labelKey)}
                  </SectionLink>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className={cn(typography.h5, 'mb-2 text-fg')}>{t('footer.contactTitle')}</h2>
            <ul>
              {socialLinks.map((social) => {
                const isExternal = social.url.startsWith('http');
                return (
                  <li key={social.name}>
                    <a
                      href={social.url}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      className={cn(typography.bodySmall, linkStyles)}
                    >
                      <SocialIcon iconPath={social.iconPath} stroke={social.stroke} />
                      <span>{social.label}</span>
                      {isExternal && <span className="sr-only">({t('footer.newTab')})</span>}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* The right padding keeps the text clear of the fixed back-to-top button. */}
        <p className={cn(typography.caption, 'mt-12 border-t border-line pr-16 pt-8 text-fg-muted')}>
          © {currentYear} Norman Martínez. {t('footer.rights')}.
        </p>
      </Container>
    </footer>
  );
}
