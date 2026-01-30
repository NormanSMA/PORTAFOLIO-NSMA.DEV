import { useRef, useEffect, useState, useMemo } from 'react';
import { useLanguage } from '../../hooks';
import { Container, Counter } from '../atoms';
import { typography } from '../../config/typography';

export function About() {
  const { t } = useLanguage();

  const stats = useMemo(() => [
    { value: 8, suffix: '+', label: t('about.stats.projects') },
    { value: 3, suffix: '+', label: t('about.stats.experience') },
    { value: 12, suffix: '+', label: t('about.stats.technologies') },
  ], [t]);

  const statRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [visible, setVisible] = useState<boolean[]>(() => stats.map(() => false));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setVisible(stats.map(() => true));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = statRefs.current.findIndex((el) => el === entry.target);
          if (idx === -1) return;
          if (entry.isIntersecting) {
            setVisible((prev) => {
              const copy = [...prev];
              copy[idx] = true;
              return copy;
            });
          }
        });
      },
      { threshold: 0.25 }
    );

    statRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [stats]);

  return (
    <section id="about" className="py-16 md:py-24 bg-light-bg dark:bg-dark-bg relative overflow-hidden">
      <Container>
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Título H2 */}
          <h2 className={`${typography.sectionTitle} text-center text-light-text dark:text-dark-text mb-6`}>
            {t('about.title')}
          </h2>

          {/* Descripción */}
          <p className={`${typography.body} text-center text-light-textSecondary dark:text-dark-textSecondary max-w-3xl mx-auto mb-12 px-4`}>
            {t('about.description')}
          </p>

          {/* Stats con círculos decorativos */}
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-3 max-w-4xl mx-auto px-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                ref={(el) => { statRefs.current[index] = el; }}
                role="group"
                aria-label={`${stat.value}${stat.suffix} ${stat.label}`}
                tabIndex={0}
                style={{ transitionDelay: `${index * 120}ms` }}
                className={`text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-md transform transition-all duration-700 ${visible[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              >
                {/* Círculo decorativo con número */}
                <div className="flex items-center justify-center mx-auto mb-4">
                  <div className="relative flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36">
                    {/* Círculo de fondo */}
                    <div className="absolute inset-0 rounded-full bg-primary-500/10 dark:bg-primary-400/10" />
                    {/* Borde del círculo */}
                    <div className="absolute inset-0 rounded-full border-2 border-primary-500/20 dark:border-primary-400/20" />
                    {/* Número */}
                    <div className={`${typography.statsNumber} text-primary-600 dark:text-primary-400 relative z-10`}>
                      <Counter end={stat.value} suffix={stat.suffix} className="inline-block" />
                    </div>
                  </div>
                </div>
                {/* Label debajo */}
                <div className={`${typography.secondary} text-light-textSecondary dark:text-dark-textSecondary font-medium`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
