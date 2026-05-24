import { useLanguage } from '../../hooks';
import { Container, Button } from '../atoms';
import { typography } from '../../config/typography';

/* ─── component ─── */
export function Hero() {
  const { t } = useLanguage();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden bg-background"
    >
      {/* subtle background decor */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-12 -top-6 w-44 h-44 rounded-full bg-foreground/6 blur-3xl sm:-left-20 sm:-top-8 sm:w-56 sm:h-56" aria-hidden />
        <div className="absolute -right-10 bottom-4 w-56 h-56 rounded-full bg-chart-2/10 blur-3xl opacity-80 sm:-right-28 sm:bottom-6 sm:w-72 sm:h-72" aria-hidden />
        <div className="hero-bg-decor absolute inset-0" aria-hidden />
      </div>
      {/* ─── main content ─── */}
      <Container>
        <div className="pointer-events-none relative z-10 grid items-center gap-6 py-10 md:grid-cols-2 md:py-14 lg:gap-10 lg:py-16">
          {/* ─── Right column: Photo ─── */}
          <div className="relative order-first md:order-last">
            <div className="relative z-10">
              <div className="relative mx-auto w-full max-w-xs overflow-hidden rounded-2xl border border-border bg-card shadow-md ring-1 ring-border/60 sm:max-w-sm md:max-w-md md:rounded-3xl">
                <img
                  src="/norman_sf.webp"
                  alt="Portrait of Norman Martínez"
                  loading="eager"
                  fetchPriority="high"
                  className="h-auto w-full block"
                />
                {/* subtle gradient overlay only for dark mode */}
                <div className="pointer-events-none absolute inset-0 bg-transparent dark:bg-gradient-to-t dark:from-black/30 dark:to-transparent" aria-hidden />
              </div>
            </div>
          </div>

          {/* ─── Left column: Text content ─── */}
          <div
            className="order-last space-y-5 md:order-first md:space-y-6"
          >
            {/* tag + name */}
            <div className="space-y-2">
              <p
                className={`${typography.tag} text-foreground/80 mb-4`}
              >
                {t('hero.tag')}
              </p>
              <h1
                className={`${typography.sectionTitle} text-foreground mb-6`}
              >
                Norman Martínez
              </h1>
            </div>

            {/* description */}
            <p
              className={`${typography.body} max-w-2xl leading-relaxed text-muted-foreground`}
            >
              {t('hero.description')}
            </p>

            {/* CTA buttons */}
            <div
              className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-4 pointer-events-auto"
            >
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
