import { useLanguage } from '../../hooks';
import { Container, Button } from '../atoms';
import { typography } from '../../config/typography';

export function Hero() {
  const { t } = useLanguage();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden bg-light-bg dark:bg-dark-bg">
      {/* Letra grande de fondo - Oculta en móvil, visible en tablet+ */}
      <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none opacity-5 dark:opacity-10" aria-hidden>
        <span className="text-[25rem] lg:text-[35rem] xl:text-[40rem] font-bold text-light-text dark:text-dark-text select-none">
          N
        </span>
      </div>

      <Container>
        <div className="relative z-10 grid md:grid-cols-2 gap-8 lg:gap-12 items-center py-12 md:py-16 lg:py-20">
          
          {/* Foto - Primero en móvil, segundo en desktop */}
          <div className="relative motion-safe:animate-slide-left order-first md:order-last">
            {/* Círculo decorativo de fondo */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full blur-3xl opacity-20 motion-safe:animate-pulse-slow"></div>
            
            {/* Contenedor de la imagen */}
            <div className="relative z-10">
              <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto">
                {/* Borde animado */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl md:rounded-3xl blur-xl opacity-50"></div>
                
                {/* Imagen */}
                <div className="relative bg-light-card dark:bg-dark-card rounded-2xl md:rounded-3xl p-1.5 md:p-2 shadow-2xl">
                  <img
                    src="/norman_sf.webp"
                    alt="Norman Martínez - Full Stack Developer"
                    loading="eager"
                    fetchPriority="high"
                    className="w-full h-auto rounded-xl md:rounded-2xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contenido - Segundo en móvil, primero en desktop */}
          <div className="space-y-4 md:space-y-6 motion-safe:animate-slide-right order-last md:order-first">
            <div className="space-y-2">
              <p className={`${typography.tag} text-primary-600 dark:text-primary-400 mb-4`}>{t('hero.tag')}</p>
              <h1 className={`${typography.sectionTitle} text-light-text dark:text-dark-text mb-6`}>Norman Martínez</h1>
            </div>

            {/* Descripción */}
            <p className={`${typography.body} text-light-textSecondary dark:text-dark-textSecondary max-w-2xl leading-relaxed`}>{t('hero.description')}</p>

            {/* Botones CTA */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-4">
              <Button
                variant="primary"
                size="md"
                onClick={() => scrollToSection('projects')}
                className="w-full sm:w-auto text-sm md:text-base"
              >
                {t('hero.cta.projects')}
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => scrollToSection('contact')}
                className="w-full sm:w-auto text-sm md:text-base"
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
