import { useLanguage } from '../../hooks';
import { Container, Button } from '../atoms';
import { PixelBlast } from '../effects';

export function Hero() {
  const { language } = useLanguage();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  // Textos según idioma
  const greeting = language === 'es' ? 'Hola, soy' : 'Hi, I am';
  const name = 'Norman Martínez';
  const description = language === 'es' 
    ? 'Ingeniero de Sistemas apasionado por crear soluciones tecnológicas innovadoras. Especializado en desarrollo web full-stack y redes.'
    : 'Systems Engineer passionate about creating innovative tech solutions. Specialized in full-stack web development and networking.';
  const btnProjects = language === 'es' ? 'Ver Proyectos' : 'View Projects';
  const btnContact = language === 'es' ? 'Contáctame' : 'Contact Me';

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden bg-light-bg dark:bg-dark-bg">
      {/* Fondo animado - Solo en Hero */}
      <PixelBlast variant="circle" pixelSize={3} color="#3B82F6" />
      
      {/* Letra grande de fondo - Oculta en móvil, visible en tablet+ */}
      <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none opacity-5 dark:opacity-10">
        <span className="text-[25rem] lg:text-[35rem] xl:text-[40rem] font-bold text-light-text dark:text-dark-text select-none">
          N
        </span>
      </div>

      <Container>
        <div className="relative z-10 grid md:grid-cols-2 gap-8 lg:gap-12 items-center py-12 md:py-16 lg:py-20">
          
          {/* Foto - Primero en móvil, segundo en desktop */}
          <div className="relative animate-slide-left order-first md:order-last">
            {/* Círculo decorativo de fondo */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full blur-3xl opacity-20 animate-pulse-slow"></div>
            
            {/* Contenedor de la imagen */}
            <div className="relative z-10">
              <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto">
                {/* Borde animado */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl md:rounded-3xl blur-xl opacity-50"></div>
                
                {/* Imagen */}
                <div className="relative bg-light-card dark:bg-dark-card rounded-2xl md:rounded-3xl p-1.5 md:p-2 shadow-2xl">
                  <img
                    src="/norman_sf.png"
                    alt="Norman Martínez"
                    className="w-full h-auto rounded-xl md:rounded-2xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contenido - Segundo en móvil, primero en desktop */}
          <div className="space-y-4 md:space-y-6 animate-slide-right order-last md:order-first">
            
            {/* Título principal - "Hola, soy Norman Martínez" */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                {/* "Hola, soy" en color normal */}
                <span className="block text-light-text dark:text-dark-text mb-1">
                  {greeting}
                </span>
                
                {/* "Norman Martínez" con gradiente */}
                <span className="block bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                  {name}
                </span>
              </h1>
            </div>

            {/* Descripción */}
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-light-textSecondary dark:text-dark-textSecondary max-w-xl leading-relaxed">
              {description}
            </p>

            {/* Botones CTA - Responsive */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-4">
              <Button
                variant="primary"
                size="md"
                onClick={() => scrollToSection('projects')}
                className="w-full sm:w-auto text-sm md:text-base"
              >
                {btnProjects}
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => scrollToSection('contact')}
                className="w-full sm:w-auto text-sm md:text-base"
              >
                {btnContact}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
