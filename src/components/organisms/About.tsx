import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '../../hooks';
import { Container, Counter } from '../atoms';
import { typography } from '../../config/typography';
import { sectionItem, sectionStagger } from '../../config/motion';

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
            variants={reduceMotion ? undefined : sectionItem}
            initial={reduceMotion ? { opacity: 1 } : 'hidden'}
            whileInView={reduceMotion ? { opacity: 1 } : 'show'}
            viewport={{ once: true, amount: 0.45 }}
          >
            {t('about.title')}
          </motion.h2>

          <motion.p
            className={`${typography.body} mx-auto mb-12 max-w-3xl px-4 text-center leading-relaxed text-light-textSecondary dark:text-dark-textSecondary`}
            variants={reduceMotion ? undefined : sectionItem}
            initial={reduceMotion ? { opacity: 1 } : 'hidden'}
            whileInView={reduceMotion ? { opacity: 1 } : 'show'}
            viewport={{ once: true, amount: 0.45 }}
          >
            {t('about.description')}
          </motion.p>

          <div className="mx-auto max-w-5xl px-4">
            <motion.div
              className="rounded-3xl border border-light-border/60 bg-gradient-to-r from-white/65 via-primary-50/45 to-secondary-50/55 px-5 py-8 backdrop-blur-md dark:border-dark-border dark:from-dark-card/75 dark:via-dark-card/65 dark:to-dark-card/75 md:px-8"
              variants={reduceMotion ? undefined : sectionStagger}
              initial={reduceMotion ? { opacity: 1 } : 'hidden'}
              whileInView={reduceMotion ? { opacity: 1 } : 'show'}
              viewport={{ once: true, amount: 0.3 }}
            >
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                role="group"
                aria-label={`${stat.value}${stat.suffix} ${stat.label}`}
                tabIndex={0}
                className="transform text-center transition-all duration-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                variants={reduceMotion ? undefined : sectionItem}
                whileHover={reduceMotion ? undefined : { y: -7, scale: 1.03 }}
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
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
