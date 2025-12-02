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
    <footer className="bg-light-card dark:bg-dark-card border-t border-light-border dark:border-dark-border">
      <Container>
        <div className="py-12 md:py-16">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8">
            
            {/* Branding con Logo */}
            <div className="space-y-4 px-4">
              {/* Logo Component - link to top for semantics */}
              <div className="mb-4">
                <a href="#home" aria-label="Go to top" onClick={(e) => { e.preventDefault(); const el = document.getElementById('home'); el?.scrollIntoView({ behavior: 'smooth' }); }}>
                  <Logo size="lg" />
                </a>
              </div>
              
              <p className="text-light-textSecondary dark:text-dark-textSecondary">
                {language === 'es' 
                  ? 'Ingeniero de Sistemas especializado en desarrollo web full-stack y redes.'
                  : 'Systems Engineer specialized in full-stack web development and networking.'
                }
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4 px-4">
              <h4 className="text-lg font-semibold text-light-text dark:text-dark-text">
                {language === 'es' ? 'Enlaces Rápidos' : 'Quick Links'}
              </h4>
              <ul className="space-y-2">
                {footerLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const el = document.getElementById(link.id);
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-light-textSecondary dark:text-dark-textSecondary hover:text-primary-500 dark:hover:text-primary-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-sm px-1"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-light-text dark:text-dark-text">
                {language === 'es' ? 'Conecta Conmigo' : 'Connect With Me'}
              </h4>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text hover:text-primary-500 dark:hover:text-primary-400 hover:bg-primary-500/10 transition-all transform motion-safe:hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    aria-label={social.name}
                  >
                    <svg className="w-6 h-6" fill={social.stroke ? "none" : "currentColor"} stroke={social.stroke ? "currentColor" : "none"} viewBox="0 0 24 24">
                      {social.stroke ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={social.iconPath} />
                      ) : (
                        <path d={social.iconPath} />
                      )}
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="pt-8 border-t border-light-border dark:border-dark-border">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-light-textSecondary dark:text-dark-textSecondary">
              <p>
                © {currentYear} Norman Martínez. {language === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
              </p>
              <p>
                {language === 'es' ? 'Hecho con' : 'Made with'} ❤️ {language === 'es' ? 'usando' : 'using'} React + TypeScript
              </p>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
