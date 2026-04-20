import { useLanguage } from '../../hooks';
import { motion, useReducedMotion } from 'framer-motion';
import { Container } from '../atoms';
import { useMemo } from 'react';
import { typography } from '../../config/typography';
import { getServices } from '../../data/services';
import { sectionItem, sectionStagger } from '../../config/motion';

function getCardColor(index: number) {
  const normalizedIndex = index % 3;

  if (normalizedIndex === 0) {
    return 'from-sky-500/10 to-blue-500/10 dark:from-sky-500/10 dark:to-blue-500/10';
  }

  if (normalizedIndex === 1) {
    return 'from-blue-500/10 to-indigo-500/10 dark:from-blue-500/10 dark:to-indigo-500/10';
  }

  return 'from-indigo-500/10 to-violet-500/10 dark:from-indigo-500/10 dark:to-violet-500/10';
}

function getIconColor(index: number) {
  const normalizedIndex = index % 3;

  if (normalizedIndex === 0) {
    return 'bg-sky-500/15 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400';
  }

  if (normalizedIndex === 1) {
    return 'bg-blue-500/15 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400';
  }

  return 'bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400';
}

export function Services() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const services = useMemo(() => getServices(t), [t]);

  return (
    <section 
      id="services" 
      className="py-16 md:py-24 bg-light-card dark:bg-dark-bg relative"
    >
      <Container>
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            className="text-center mb-8 md:mb-10"
            variants={reduceMotion ? undefined : sectionItem}
            initial={reduceMotion ? { opacity: 1 } : 'hidden'}
            whileInView={reduceMotion ? { opacity: 1 } : 'show'}
            viewport={{ once: true, amount: 0.45 }}
          >
            <h2 className={`${typography.sectionTitle} text-light-text dark:text-dark-text mb-4`}>
              {t('services.title')}
            </h2>
            <p className={`${typography.sectionSubtitle} text-light-textSecondary dark:text-dark-textSecondary max-w-3xl mx-auto`}>
              {t('services.subtitle')}
            </p>
          </motion.div>

          <motion.div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            variants={reduceMotion ? undefined : sectionStagger}
            initial={reduceMotion ? { opacity: 1 } : 'hidden'}
            whileInView={reduceMotion ? { opacity: 1 } : 'show'}
            viewport={{ once: true, amount: 0.25 }}
          >
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.article
                  key={index}
                  className={`
                    rounded-2xl border border-light-border/60 dark:border-dark-border/60
                    bg-gradient-to-br ${getCardColor(index)}
                    bg-light-bg dark:bg-dark-card
                    p-6 space-y-4 shadow-lg
                  `}
                  variants={reduceMotion ? undefined : sectionItem}
                  whileHover={reduceMotion ? undefined : { y: -4 }}
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${getIconColor(index)}`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className={`${typography.cardSubtitle} text-light-text dark:text-dark-text`}>
                    {service.title}
                  </h3>
                  <p className={`${typography.secondary} text-light-textSecondary dark:text-dark-textSecondary leading-relaxed`}>
                    {service.description}
                  </p>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
