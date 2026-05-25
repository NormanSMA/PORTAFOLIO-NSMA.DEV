import { useLanguage } from '../../hooks';
import { Container, Button } from '../atoms';
import SplitText from '../atoms/SplitText';
import { typography } from '../../config/typography';

export function Hero() {
  const { t } = useLanguage();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden bg-light-bg dark:bg-dark-bg pt-20 md:pt-24"
    >
      <Container>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 lg:gap-16 xl:gap-20 items-center py-8 sm:py-12 md:py-16 lg:py-20">
          
          {/* Foto — Primero en móvil, segundo en desktop */}
          <div className="relative motion-safe:animate-slide-left order-first md:order-last">
            {/* Círculo decorativo de fondo */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full blur-3xl opacity-20 motion-safe:animate-pulse-slow"></div>
            
            {/* Contenedor de la imagen */}
            <div className="relative z-10">
              <div className="relative w-full max-w-[280px] sm:max-w-xs md:max-w-sm lg:max-w-md mx-auto">
                {/* Borde animado (aro de luz) */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl md:rounded-3xl blur-xl opacity-50"></div>
                
                {/* Imagen */}
                <div className="relative bg-light-card dark:bg-dark-card rounded-2xl md:rounded-3xl p-1.5 md:p-2 shadow-2xl">
                  <img
                    src="/norman_sf.webp"
                    alt="Norman Martínez - Full Stack Developer"
                    loading="eager"
                    fetchPriority="high"
                    className="w-full h-auto rounded-xl md:rounded-2xl aspect-[4/5] object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contenido — Segundo en móvil, primero en desktop */}
          <div className="space-y-5 md:space-y-6 lg:space-y-8 motion-safe:animate-slide-right order-last md:order-first text-center md:text-left">
            {/* Tag + Nombre */}
            <div className="space-y-3 md:space-y-4">
              <SplitText
                tag="p"
                text={t('hero.tag')}
                className={`${typography.tag} text-primary-600 dark:text-primary-400`}
                delay={40}
                duration={0.6}
                splitType="chars"
                from={{ opacity: 0, y: 24 }}
                to={{ opacity: 1, y: 0 }}
                textAlign="left"
              />
              <SplitText
                tag="h1"
                text="Norman Martínez"
                className={`${typography.sectionTitle} text-light-text dark:text-dark-text`}
                delay={30}
                duration={0.6}
                splitType="chars"
                from={{ opacity: 0, y: 28 }}
                to={{ opacity: 1, y: 0 }}
                textAlign="left"
              />
            </div>

            {/* Descripción */}
            <p className={`${typography.body} text-light-textSecondary dark:text-dark-textSecondary max-w-xl lg:max-w-2xl leading-relaxed mx-auto md:mx-0`}>
              {t('hero.description')}
            </p>

            {/* Botones CTA */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 md:pt-4 sm:justify-center md:justify-start">
              <Button
                variant="primary"
                size="md"
                onClick={() => scrollToSection('projects')}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                {t('hero.cta.projects')}
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => scrollToSection('contact')}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                {t('hero.cta.contact')}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

