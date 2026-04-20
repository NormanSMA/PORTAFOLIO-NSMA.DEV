import { useLanguage } from '../../hooks';
import { motion, useReducedMotion } from 'framer-motion';
import { Container } from '../atoms';
import { typography } from '../../config/typography';
import { sectionItem, sectionStagger } from '../../config/motion';

export function ImpactMetrics() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();

  const metrics = [
    {
      value: '12+',
      title: t('metrics.cards.projects.title'),
      detail: t('metrics.cards.projects.detail'),
    },
    {
      value: '96%',
      title: t('metrics.cards.performance.title'),
      detail: t('metrics.cards.performance.detail'),
    },
    {
      value: '24h',
      title: t('metrics.cards.response.title'),
      detail: t('metrics.cards.response.detail'),
    },
  ];

  return (
    <section id="metrics" className="relative overflow-hidden bg-light-card py-12 md:py-16 dark:bg-dark-bg">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.18),transparent_34%),radial-gradient(circle_at_80%_90%,rgba(20,184,166,0.16),transparent_38%)]" aria-hidden />
      <Container>
        <div className="relative z-10 mx-auto max-w-6xl">
          <motion.div
            className="mb-8 text-center md:mb-10"
            variants={reduceMotion ? undefined : sectionItem}
            initial={reduceMotion ? { opacity: 1 } : 'hidden'}
            whileInView={reduceMotion ? { opacity: 1 } : 'show'}
            viewport={{ once: true, amount: 0.5 }}
          >
            <h2 className={`${typography.sectionTitle} mb-4 text-light-text dark:text-dark-text`}>
              {t('metrics.title')}
            </h2>
            <p className={`${typography.sectionSubtitle} mx-auto max-w-3xl text-light-textSecondary dark:text-dark-textSecondary`}>
              {t('metrics.subtitle')}
            </p>
          </motion.div>

          <motion.div
            className="grid gap-4 md:grid-cols-3 md:gap-5"
            variants={reduceMotion ? undefined : sectionStagger}
            initial={reduceMotion ? { opacity: 1 } : 'hidden'}
            whileInView={reduceMotion ? { opacity: 1 } : 'show'}
            viewport={{ once: true, amount: 0.35 }}
          >
            {metrics.map((metric) => (
              <motion.article
                key={metric.title}
                className="rounded-3xl border border-light-border/70 bg-light-bg/90 p-5 shadow-[0_24px_60px_-42px_rgba(2,6,23,0.55)] backdrop-blur-sm dark:border-dark-border dark:bg-dark-card/90"
                variants={reduceMotion ? undefined : sectionItem}
                whileHover={reduceMotion ? undefined : { y: -7 }}
              >
                <p className="font-display text-4xl font-bold tracking-tight text-primary-600 dark:text-primary-400">
                  {metric.value}
                </p>
                <h3 className="mt-3 text-lg font-semibold text-light-text dark:text-dark-text">
                  {metric.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-light-textSecondary dark:text-dark-textSecondary">
                  {metric.detail}
                </p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}