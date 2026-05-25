import { useRef, useEffect, useState, useMemo } from 'react';
import { useLanguage } from '../../hooks';
import { Container } from '../atoms';
import TextPressure from '../atoms/TextPressure';
import { typography } from '../../config/typography';

export function About() {
  const { t } = useLanguage();

  const stats = useMemo(() => [
    { value: 6, suffix: '+', label: t('about.stats.projects') },
    { value: 2, suffix: '+', label: t('about.stats.experience') },
    { value: 10, suffix: '+', label: t('about.stats.technologies') },
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
    <section id="about" aria-labelledby="about-heading" className="bg-light-bg dark:bg-dark-bg relative overflow-hidden py-16 md:py-24 lg:py-28">
      <Container>
        <div className="max-w-5xl mx-auto relative z-10 w-full">
          {/* Título H2 */}
          <h2 id="about-heading" className={`${typography.h2} text-center text-light-text dark:text-dark-text mb-6 md:mb-8 lg:mb-10`}>
            {t('about.title')}
          </h2>

          {/* Descripción */}
          <p className={`${typography.body} text-center text-light-textSecondary dark:text-dark-textSecondary max-w-2xl lg:max-w-3xl mx-auto mb-10 md:mb-12 lg:mb-16`}>
            {t('about.description')}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-8 gap-x-4 sm:gap-6 md:gap-8 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                ref={(el) => { statRefs.current[index] = el; }}
                role="group"
                aria-label={`${stat.value}${stat.suffix} ${stat.label}`}
                tabIndex={0}
                style={{ transitionDelay: `${index * 120}ms` }}
                className={`text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-md transform transition-all duration-700 ${index === stats.length - 1 ? 'col-span-2 sm:col-span-1' : ''} ${visible[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              >
                <div className={`mb-3 md:mb-4 ${typography.statsNumber} text-primary-600 dark:text-primary-400`}>
                    <TextPressure
                      text={`${stat.value}${stat.suffix}`}
                      flex={false}
                      width={true}
                      weight={true}
                      italic={false}
                      alpha={false}
                      stroke={false}
                      scale={false}
                      className="inline-block"
                      inheritFontSize={true}
                    />
                </div>
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
