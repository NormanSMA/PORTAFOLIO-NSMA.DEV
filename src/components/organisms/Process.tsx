import { useLanguage } from '../../hooks';
import { Search, Compass, Code2, Gauge } from 'lucide-react';
import { Container } from '../atoms';
import { typography } from '../../config/typography';

export function Process() {
  const { t } = useLanguage();

  const steps = [
    { id: '01', Icon: Search, title: t('process.steps.discovery.title'), description: t('process.steps.discovery.description') },
    { id: '02', Icon: Compass, title: t('process.steps.strategy.title'), description: t('process.steps.strategy.description') },
    { id: '03', Icon: Code2, title: t('process.steps.build.title'), description: t('process.steps.build.description') },
    { id: '04', Icon: Gauge, title: t('process.steps.optimize.title'), description: t('process.steps.optimize.description') },
  ];

  return (
    <section id="process" className="relative overflow-hidden bg-background py-12 md:py-16">
      <Container>
        <div className="mx-auto max-w-6xl">
          <div
            className="mb-8 text-center md:mb-10"
          >
            <h2 className={`${typography.sectionTitle} mb-4 text-foreground`}>
              {t('process.title')}
            </h2>
            <p className={`${typography.sectionSubtitle} mx-auto max-w-3xl text-muted-foreground`}>
              {t('process.subtitle')}
            </p>
          </div>

          <div
            className="grid gap-3 md:grid-cols-2 md:gap-4"
          >
            {steps.map((step) => {
              const StepIcon = step.Icon;
              return (
                <article
                  key={step.id}
                  className="relative overflow-hidden rounded-3xl border border-border bg-card p-5"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-bold text-foreground">
                      {step.id}
                    </div>
                    <StepIcon className="h-9 w-9 text-foreground" strokeWidth={2.1} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {step.description}
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
