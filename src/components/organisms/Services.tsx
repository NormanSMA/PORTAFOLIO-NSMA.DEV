import { useLanguage } from '../../hooks';
import { Container } from '../atoms';
import { useRef, useEffect, useMemo, useState } from 'react';
import { typography } from '../../config/typography';
import { getServices } from '../../data/services';

export function Services() {
  const { t } = useLanguage();

  const services = useMemo(() => getServices(t), [t]);

  // refs & visibility for entry animations (staggered)
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const [visible, setVisible] = useState<boolean[]>(() => services.map(() => false));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setVisible(services.map(() => true));
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = itemRefs.current.findIndex((el) => el === entry.target);
            if (idx !== -1) {
              setVisible((prev) => {
                if (prev[idx]) return prev;
                const copy = [...prev];
                copy[idx] = true;
                return copy;
              });
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    itemRefs.current.forEach((el) => {
      if (el) obs.observe(el as Element);
    });

    return () => obs.disconnect();
  }, [services]);

  return (
    <section id="services" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900/95 relative overflow-hidden">
      {/* Decorative gradients (mantener igual) */}

      <Container>
        <div className="max-w-6xl mx-auto">
          {/* Header H2 */}
          <div className="text-center mb-12 md:mb-16 px-4">
            <h2 className={`${typography.sectionTitle} text-gray-900 dark:text-white mb-4`}>
              {t('services.title')}
            </h2>
            <p className={`${typography.sectionSubtitle} text-gray-600 dark:text-gray-400 max-w-3xl mx-auto px-4`}>
              {t('services.subtitle')}
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 px-4">
            {services.map((service, index) => {
              const titleId = `service-title-${index}`;
              const isVisible = visible[index];
              const delayStyle = { transitionDelay: `${index * 120}ms` } as React.CSSProperties;
              const Icon = service.icon;
              
              return (
                <article
                  key={index}
                  ref={(el) => { itemRefs.current[index] = el as HTMLElement | null; }}
                  role="article"
                  aria-labelledby={titleId}
                  tabIndex={0}
                  style={delayStyle}
                  className={`bg-white dark:bg-gray-800 shadow-lg dark:shadow-xl p-6 md:p-8 space-y-4 rounded-xl motion-safe:transform motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:-translate-y-2 border border-gray-200 dark:border-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transform transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                >
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                    {/* Icons are decorative here */}
                    <span aria-hidden>
                      <Icon />
                    </span>
                  </div>

                  {/* Título H3 */}
                  <h3 id={titleId} className={`${typography.cardSubtitle} text-gray-900 dark:text-white`}>
                    {service.title}
                  </h3>

                  {/* Descripción */}
                  <p className={`${typography.secondary} text-gray-600 dark:text-gray-300 leading-relaxed`}>
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
