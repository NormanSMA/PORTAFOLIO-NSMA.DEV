import { useLanguage, useStackingCards } from '../../hooks';
import { Container } from '../atoms';
import { typography } from '../../config/typography';
import { Search, Compass, Code2, Gauge } from 'lucide-react';

export function Process() {
  const { t } = useLanguage();

  const steps = [
    { id: '01', Icon: Search, title: t('process.steps.discovery.title'), description: t('process.steps.discovery.description') },
    { id: '02', Icon: Compass, title: t('process.steps.strategy.title'), description: t('process.steps.strategy.description') },
    { id: '03', Icon: Code2, title: t('process.steps.build.title'), description: t('process.steps.build.description') },
    { id: '04', Icon: Gauge, title: t('process.steps.optimize.title'), description: t('process.steps.optimize.description') },
  ];

  const {
    isMobile,
    containerRef,
    cardRefs,
  } = useStackingCards({
    cardCount: steps.length,
    mobileStickyTop: 80,
    mobileIncrement: 20,
    mobileDistance: 200,
  });

  return (
    <section id="process" aria-labelledby="process-heading" className="relative bg-light-bg dark:bg-dark-bg py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center md:mb-10">
            <h2 id="process-heading" className={`${typography.h2} mb-4 text-light-text dark:text-dark-text`}>
              {t('process.title')}
            </h2>
            <p className={`${typography.sectionSubtitle} mx-auto max-w-3xl text-light-textSecondary dark:text-dark-textSecondary`}>
              {t('process.subtitle')}
            </p>
          </div>

          {/* Stacking Cards en móviles */}
          <div className="lg:hidden max-w-2xl mx-auto">
            <div
              ref={isMobile ? containerRef : null}
              className="relative"
              style={{ minHeight: `${steps.length * 22}vh` }}
            >
              {steps.map((step, index) => {
                const StepIcon = step.Icon;
                return (
                  <div
                    key={step.id}
                    ref={(el) => { if (isMobile) cardRefs.current[index] = el; }}
                    className="sticky"
                    style={{
                      top: `${80 + (index * 20)}px`,
                      zIndex: index + 1,
                      marginBottom: '2.5vh',
                      ['--progress' as string]: '0',
                    }}
                  >
                    <article
                      aria-label={step.title}
                      className="rounded-2xl border border-light-border bg-light-card p-6 space-y-4 shadow-sm transition-all duration-300 dark:border-dark-border dark:bg-dark-card"
                      style={{
                        transform: `scale(calc(1 - (var(--progress) * 0.04))) translateY(calc(var(--progress) * -8px))`,
                        filter: `brightness(calc(1 - (var(--progress) * 0.1)))`,
                        transformOrigin: 'top center',
                        transition: 'box-shadow 0.3s ease',
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/10 text-sm font-bold text-primary-600 dark:text-primary-400">
                          {step.id}
                        </div>
                        <StepIcon className="h-9 w-9 text-primary-500 dark:text-primary-400 transition-transform duration-300" strokeWidth={2.1} />
                      </div>
                      <h3 className={`${typography.cardSubtitle} text-light-text dark:text-dark-text`}>
                        {step.title}
                      </h3>
                      <p className={`${typography.secondary} leading-relaxed text-light-textSecondary dark:text-dark-textSecondary`}>
                        {step.description}
                      </p>
                    </article>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid en escritorio */}
          <div className="hidden lg:grid gap-3 md:grid-cols-2 md:gap-4">
            {steps.map((step) => {
              const StepIcon = step.Icon;
              return (
                <article
                  key={step.id}
                  aria-label={step.title}
                  className="group relative overflow-hidden rounded-2xl border border-light-border bg-light-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-dark-border dark:bg-dark-card"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/10 text-sm font-bold text-primary-600 dark:text-primary-400">
                      {step.id}
                    </div>
                    <StepIcon className="h-9 w-9 text-primary-500 dark:text-primary-400 transition-transform duration-300 group-hover:-translate-y-0.5" strokeWidth={2.1} />
                  </div>
                  <h3 className={`${typography.cardSubtitle} text-light-text dark:text-dark-text`}>
                    {step.title}
                  </h3>
                  <p className={`${typography.secondary} mt-3 leading-6 text-light-textSecondary dark:text-dark-textSecondary`}>
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
