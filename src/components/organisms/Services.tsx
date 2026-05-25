import { useLanguage, useStackingCards } from '../../hooks';
import { Container } from '../atoms';
import { useMemo } from 'react';
import { typography } from '../../config/typography';
import { getServices } from '../../data/services';

export function Services() {
  const { t } = useLanguage();
  const services = useMemo(() => getServices(t), [t]);
  
  const {
    isMobile,
    containerRef,
    cardRefs,
    leftColumnRef,
  } = useStackingCards({
    cardCount: services.length,
    mobileStickyTop: 80,
    mobileIncrement: 20,
    mobileDistance: 200,
    desktopStickyTop: 120,
    desktopIncrement: 35,
    desktopDistance: 250,
  });

  // Colores para cada tarjeta - tonos de azul sutiles
  const cardColors = [
    'from-sky-500/10 to-blue-500/10 dark:from-sky-500/10 dark:to-blue-500/10',
    'from-blue-500/10 to-indigo-500/10 dark:from-blue-500/10 dark:to-indigo-500/10',
    'from-indigo-500/10 to-violet-500/10 dark:from-indigo-500/10 dark:to-violet-500/10',
  ];

  const iconColors = [
    'bg-sky-500/15 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400',
    'bg-blue-500/15 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
    'bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
  ];

  return (
    <section 
      id="services" 
      aria-labelledby="services-heading"
      className="py-16 md:py-24 bg-light-card dark:bg-dark-bg relative"
    >
      <Container>
        {/* ===== MOBILE/TABLET LAYOUT with Stacking ===== */}
        <div className="lg:hidden max-w-6xl mx-auto">
          {/* Fixed Header */}
          <div className="text-center mb-8 sm:mb-10">
            <h2 id="services-heading" className={`${typography.h2} text-light-text dark:text-dark-text mb-4`}>
              {t('services.title')}
            </h2>
            <p className={`${typography.sectionSubtitle} text-light-textSecondary dark:text-dark-textSecondary max-w-2xl mx-auto`}>
              {t('services.subtitle')}
            </p>
          </div>

          {/* Stacking Cards Container */}
          <div 
            ref={isMobile ? containerRef : null}
            className="relative max-w-2xl mx-auto"
            style={{ minHeight: `${services.length * 28}vh` }}
          >
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
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
                    aria-label={service.title}
                    className={`
                      bg-gradient-to-br ${cardColors[index]} 
                      bg-light-bg dark:bg-dark-card 
                      shadow-lg dark:shadow-xl 
                      p-6 space-y-4 rounded-2xl 
                      border border-light-border/50 dark:border-dark-border/50
                    `}
                    style={{
                      transform: `scale(calc(1 - (var(--progress) * 0.04))) translateY(calc(var(--progress) * -8px))`,
                      filter: `brightness(calc(1 - (var(--progress) * 0.1)))`,
                      transformOrigin: 'top center',
                      transition: 'box-shadow 0.3s ease',
                    }}
                  >
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${iconColors[index]}`}>
                      <span aria-hidden><Icon /></span>
                    </div>
                    <h3 className={`${typography.cardSubtitle} text-light-text dark:text-dark-text`}>
                      {service.title}
                    </h3>
                    <p className={`${typography.secondary} text-light-textSecondary dark:text-dark-textSecondary leading-relaxed`}>
                      {service.description}
                    </p>
                  </article>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== DESKTOP LAYOUT: Premium Sticky Stacking Cards ===== */}
        <div className="hidden lg:block max-w-7xl mx-auto">
          <div className="flex gap-10 xl:gap-16 items-start">
            
            {/* Columna izquierda: Texto con Parallax */}
            <div 
              ref={!isMobile ? leftColumnRef : null}
              className="w-[35%] sticky top-32"
              style={{ 
                transform: `translateY(calc(var(--section-progress, 0) * -20px))`,
                opacity: `calc(1 - (var(--section-progress, 0) * 0.3))`,
                transition: 'opacity 0.1s ease-out',
                ['--section-progress' as string]: '0',
              }}
            >
              <div className="space-y-6">
                <h2 aria-hidden="true" className={`${typography.h2} text-light-text dark:text-dark-text`}>
                  {t('services.title')}
                </h2>
                <p className={`${typography.sectionSubtitle} text-light-textSecondary dark:text-dark-textSecondary leading-relaxed`}>
                  {t('services.subtitle')}
                </p>
              </div>
            </div>

            {/* Columna derecha: Stacking Cards */}
            <div className="w-[65%]">
              <div 
                ref={!isMobile ? containerRef : null}
                className="relative"
                style={{ minHeight: `${services.length * 25}vh` }}
              >
                {services.map((service, index) => {
                  const Icon = service.icon;
                  
                  return (
                    <div
                      key={index}
                      ref={(el) => { if (!isMobile) cardRefs.current[index] = el; }}
                      className="sticky"
                      style={{ 
                        top: `${120 + (index * 35)}px`,
                        zIndex: index + 1,
                        marginBottom: '2vh',
                        ['--progress' as string]: '0',
                      }}
                    >
                      <article
                        aria-label={service.title}
                        className={`
                          relative overflow-hidden
                          bg-gradient-to-br ${cardColors[index]}
                          bg-light-bg dark:bg-dark-card 
                          p-8 rounded-2xl 
                          border border-light-border/80 dark:border-dark-border/80
                          shadow-xl
                        `}
                        style={{
                          transform: `scale(calc(1 - (var(--progress) * 0.04))) translateY(calc(var(--progress) * -10px))`,
                          filter: `brightness(calc(1 - (var(--progress) * 0.1)))`,
                          transformOrigin: 'top center',
                          transition: 'box-shadow 0.3s ease',
                        }}
                      >
                        {/* Layout horizontal */}
                        <div className="flex items-start gap-6">
                          <div className={`flex-shrink-0 inline-flex items-center justify-center w-16 h-16 rounded-2xl ${iconColors[index]}`}>
                            <span aria-hidden className="text-2xl"><Icon /></span>
                          </div>
                          
                          <div className="flex-1 space-y-3">
                            <h3 className={`${typography.cardSubtitle} text-light-text dark:text-dark-text`}>
                              {service.title}
                            </h3>
                            <p className={`${typography.secondary} text-light-textSecondary dark:text-dark-textSecondary leading-relaxed`}>
                              {service.description}
                            </p>
                          </div>
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}