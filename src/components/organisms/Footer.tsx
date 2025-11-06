import { useLanguage } from '../../hooks';
import { Container, Logo } from '../atoms';

export function Footer() {
  const { language } = useLanguage();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/NormanSMA',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/norman-martinez',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
    },
    {
      name: 'Email',
      url: 'mailto:norman@nsma.dev',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  const footerLinks = {
    es: [
      { label: 'Inicio', id: 'home' },
      { label: 'Sobre mí', id: 'about' },
      { label: 'Proyectos', id: 'projects' },
      { label: 'Habilidades', id: 'skills' },
      { label: 'Experiencia', id: 'experience' },
      { label: 'Contacto', id: 'contact' },
    ],
    en: [
      { label: 'Home', id: 'home' },
      { label: 'About', id: 'about' },
      { label: 'Projects', id: 'projects' },
      { label: 'Skills', id: 'skills' },
      { label: 'Experience', id: 'experience' },
      { label: 'Contact', id: 'contact' },
    ],
  };



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
                {footerLinks[language].map((link) => (
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
                    <span aria-hidden>{social.icon}</span>
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
