import { useMemo } from 'react';
import { useLanguage } from '../../hooks';
import { Container } from '../atoms';
import { typography } from '../../config/typography';

export function About() {
  const { t } = useLanguage();

  const stats = useMemo(() => [
    { value: 8, suffix: '+', label: t('about.stats.projects') },
    { value: 3, suffix: '+', label: t('about.stats.experience') },
    { value: 12, suffix: '+', label: t('about.stats.technologies') },
  ], [t]);

  return (
    <section id="about" className="relative overflow-hidden bg-background py-16 md:py-24">
      <Container>
        <div className="relative z-10 mx-auto max-w-6xl">
          <h2
            className={`${typography.sectionTitle} mb-6 text-center text-foreground`}
          >
            {t('about.title')}
          </h2>

          <p
            className={`${typography.body} mx-auto mb-12 max-w-3xl px-4 text-center leading-relaxed text-muted-foreground`}
          >
            {t('about.description')}
          </p>

          <div className="mx-auto max-w-5xl px-4">
            <div
              className="px-2 py-2 md:px-6 md:py-4"
            >
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    role="group"
                    aria-label={`${stat.value}${stat.suffix} ${stat.label}`}
                    tabIndex={0}
                    className="text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="mb-3 text-5xl font-extrabold leading-none tracking-tight text-foreground md:text-6xl">
                      {stat.value}{stat.suffix}
                    </div>
                    <div className={`${typography.secondary} font-medium text-muted-foreground`}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
