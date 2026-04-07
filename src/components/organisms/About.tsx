import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '../../hooks';
import { Container, Counter } from '../atoms';
import { typography } from '../../config/typography';

export function About() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();

  const stats = useMemo(() => [
    { value: 8, suffix: '+', label: t('about.stats.projects') },
    { value: 3, suffix: '+', label: t('about.stats.experience') },
    { value: 12, suffix: '+', label: t('about.stats.technologies') },
  ], [t]);

  return (
    <section id="about" className="relative overflow-hidden bg-light-bg py-16 md:py-24 dark:bg-dark-bg">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_90%,rgba(56,189,248,0.12),transparent_36%),radial-gradient(circle_at_90%_10%,rgba(45,212,191,0.1),transparent_32%)]" aria-hidden />
      <Container>
        <div className="relative z-10 mx-auto max-w-6xl">
          <motion.h2
            className={`${typography.sectionTitle} mb-6 text-center text-light-text dark:text-dark-text`}
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
            whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
          >
            {t('about.title')}
          </motion.h2>

          <motion.p
            className={`${typography.body} mx-auto mb-12 max-w-3xl px-4 text-center leading-relaxed text-light-textSecondary dark:text-dark-textSecondary`}
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 26 }}
            whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          >
            {t('about.description')}
          </motion.p>

          <div className="mx-auto max-w-5xl px-4">
            <div className="rounded-3xl border border-light-border/60 bg-gradient-to-r from-white/65 via-primary-50/45 to-secondary-50/55 px-5 py-8 backdrop-blur-md dark:border-dark-border dark:from-dark-card/75 dark:via-dark-card/65 dark:to-dark-card/75 md:px-8">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                role="group"
                aria-label={`${stat.value}${stat.suffix} ${stat.label}`}
                tabIndex={0}
                className="transform text-center transition-all duration-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
                whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                whileHover={reduceMotion ? undefined : { y: -7, scale: 1.03 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.12 }}
              >
                <div className="mb-3 text-5xl font-extrabold leading-none tracking-tight text-primary-600 dark:text-primary-400 md:text-6xl">
                  <Counter end={stat.value} suffix={stat.suffix} className="inline-block" />
                </div>
                <div className={`${typography.secondary} font-medium text-light-textSecondary dark:text-dark-textSecondary`}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
