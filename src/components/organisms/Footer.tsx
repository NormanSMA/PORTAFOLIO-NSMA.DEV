import { useLanguage } from '../../hooks';
import { Container, Logo } from '../atoms';
import { socialLinks } from '../../data/social';

export function Footer() {
  const { language, t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: t('nav.home'), id: 'home' },
    { label: t('nav.about'), id: 'about' },
    { label: t('nav.projects'), id: 'projects' },
    { label: t('nav.experience'), id: 'education-skills' },
    { label: t('nav.contact'), id: 'contact' },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <Container>
        <div className="py-12 md:py-16">
          {/* Top Section */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8"
          >
            {/* Branding */}
            <div className="space-y-4 px-4">
              <div className="mb-4">
                <a href="#home" aria-label="Go to top" onClick={(e) => { e.preventDefault(); document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' }); }}>
                  <Logo size="lg" />
                </a>
              </div>
              <p className="text-muted-foreground">
                {language === 'es'
                  ? 'Ingeniero en Sistemas con experiencia en proyectos académicos y freelance. Me enfoco en resolver problemas y construir soluciones útiles.'
                  : 'Information Systems Engineer with experience in academic and freelance projects. I focus on solving problems and building useful solutions.'
                }
              </p>
            </div>

            {/* Quick Links */}
            <nav
              aria-label={language === 'es' ? 'Navegación del pie de página' : 'Footer navigation'}
              className="space-y-4 px-4"
            >
              <h4 className="text-lg font-semibold text-foreground">
                {language === 'es' ? 'Enlaces Rápidos' : 'Quick Links'}
              </h4>
              <ul className="space-y-2">
                {footerLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm px-1"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Social Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground">
                {language === 'es' ? 'Conecta Conmigo' : 'Connect With Me'}
              </h4>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={social.name}
                  >
                    <social.icon className="w-6 h-6" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div
            className="pt-8 border-t border-border"
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>© {currentYear} Norman Martínez. {language === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}</p>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
