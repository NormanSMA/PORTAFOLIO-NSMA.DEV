import { useLanguage } from '../../hooks';
import { motion, useReducedMotion } from 'framer-motion';
import { Search, Compass, Code2, Gauge } from 'lucide-react';
import { Container } from '../atoms';
import { typography } from '../../config/typography';

export function Process() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();

  const steps = [
    {
      id: '01',
      Icon: Search,
      title: t('process.steps.discovery.title'),
      description: t('process.steps.discovery.description'),
    },
    {
      id: '02',
      Icon: Compass,
      title: t('process.steps.strategy.title'),
      description: t('process.steps.strategy.description'),
    },
    {
      id: '03',
      Icon: Code2,
      title: t('process.steps.build.title'),
      description: t('process.steps.build.description'),
    },
    {
      id: '04',
      Icon: Gauge,
      title: t('process.steps.optimize.title'),
      description: t('process.steps.optimize.description'),
    },
  ];

  return (
    <section id="process" className="relative overflow-hidden bg-light-bg py-12 md:py-16 dark:bg-dark-bg">
      <Container>
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mb-8 text-center md:mb-10"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 40 }}
            whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className={`${typography.sectionTitle} mb-4 text-light-text dark:text-dark-text`}>
              {t('process.title')}
            </h2>
            <p className={`${typography.sectionSubtitle} mx-auto max-w-3xl text-light-textSecondary dark:text-dark-textSecondary`}>
              {t('process.subtitle')}
            </p>
          </motion.div>

          <div className="grid gap-3 md:grid-cols-2 md:gap-4">
            {steps.map((step, index) => {
              const StepIcon = step.Icon;
              return (
                <motion.article
                  key={step.id}
                  className="relative overflow-hidden rounded-3xl border border-light-border bg-light-card p-5 transition-all duration-300 motion-safe:hover:border-primary-400/60 dark:border-dark-border dark:bg-dark-card"
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 28 }}
                  whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  whileHover={reduceMotion ? undefined : { y: -10, scale: 1.02 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/10 text-sm font-bold text-primary-600 dark:text-primary-300">
                      {step.id}
                    </div>
                    <StepIcon className="h-9 w-9 text-primary-500 dark:text-primary-400" strokeWidth={2.1} />
                  </div>
                  <h3 className="text-xl font-semibold text-light-text dark:text-dark-text">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-light-textSecondary dark:text-dark-textSecondary">
                    {step.description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}