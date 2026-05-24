import { useLanguage } from '../../hooks';
import { Container } from '../atoms';
import { useMemo } from 'react';
import { typography } from '../../config/typography';
import { getServices } from '../../data/services';

function getIconColor(index: number) {
  const normalizedIndex = index % 3;
  if (normalizedIndex === 0) return 'bg-foreground/8 text-foreground';
  if (normalizedIndex === 1) return 'bg-chart-2/12 text-foreground';
  return 'bg-chart-3/12 text-foreground';
}

export function Services() {
  const { t } = useLanguage();
  const services = useMemo(() => getServices(t), [t]);

  return (
    <section 
      id="services" 
      className="relative bg-secondary py-16 md:py-24"
    >
      <Container>
        <div className="mx-auto max-w-6xl px-4">
          <div
            className="text-center mb-8 md:mb-10"
          >
            <h2 className={`${typography.sectionTitle} text-foreground mb-4`}>
              {t('services.title')}
            </h2>
            <p className={`${typography.sectionSubtitle} text-muted-foreground max-w-3xl mx-auto`}>
              {t('services.subtitle')}
            </p>
          </div>

          <div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <article
                  key={index}
                  className={`
                    rounded-2xl border border-border bg-card p-6
                    space-y-4
                  `}
                >
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl ${getIconColor(index)}`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className={`${typography.cardSubtitle} text-foreground`}>
                    {service.title}
                  </h3>
                  <p className={`${typography.secondary} text-muted-foreground leading-relaxed`}>
                    {service.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
