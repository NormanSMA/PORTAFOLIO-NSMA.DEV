import { useLanguage } from '../../hooks';
import { motion, useReducedMotion } from 'framer-motion';
import { Container, Logo } from '../atoms';
import { socialLinks } from '../../data/social';
import { sectionItem, sectionStagger } from '../../config/motion';

export function Footer() {
  const { language, t } = useLanguage();
  const reduceMotion = useReducedMotion();
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
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8"
            variants={reduceMotion ? undefined : sectionStagger}
            initial={reduceMotion ? { opacity: 1 } : 'hidden'}
            whileInView={reduceMotion ? { opacity: 1 } : 'show'}
            viewport={{ once: true, amount: 0.3 }}
          >
            
            {/* Branding con Logo */}
            <motion.div
              className="space-y-4 px-4"
              variants={reduceMotion ? undefined : sectionItem}
            >
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
            </motion.div>

            {/* Quick Links */}
            <motion.nav
              aria-label={language === 'es' ? 'Navegación del pie de página' : 'Footer navigation'}
              className="space-y-4 px-4"
              variants={reduceMotion ? undefined : sectionItem}
            >
              <h4 className="text-lg font-semibold text-light-text dark:text-dark-text">
                {language === 'es' ? 'Enlaces Rápidos' : 'Quick Links'}
              </h4>
              <ul className="space-y-2">
                {footerLinks.map((link) => (
                  <li key={link.id}>
                    <motion.a
                      href={`#${link.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const el = document.getElementById(link.id);
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-light-textSecondary dark:text-dark-textSecondary hover:text-primary-500 dark:hover:text-primary-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-sm px-1"
                      whileHover={reduceMotion ? undefined : { x: 6 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                      {link.label}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.nav>

            {/* Social Links */}
            <motion.div
              className="space-y-4"
              variants={reduceMotion ? undefined : sectionItem}
            >
              <h4 className="text-lg font-semibold text-light-text dark:text-dark-text">
                {language === 'es' ? 'Conecta Conmigo' : 'Connect With Me'}
              </h4>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text hover:text-primary-500 dark:hover:text-primary-400 hover:bg-primary-500/10 transition-all transform motion-safe:hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    aria-label={social.name}
                    whileHover={reduceMotion ? undefined : { y: -4, scale: 1.08 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  >
                    <motion.div
                      animate={reduceMotion ? undefined : { 
                        y: [0, -3, 0],
                      }}
                      whileHover={reduceMotion ? undefined : { 
                        rotate: [0, -15, 15, -15, 15, 0],
                        scale: 1.25
                      }}
                      transition={reduceMotion ? undefined : {
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.1
                      }}
                      className="flex items-center justify-center p-0.5"
                    >
                      <social.icon className="w-6 h-6" />
                    </motion.div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom Section */}
          <motion.div
            className="pt-8 border-t border-light-border dark:border-dark-border"
            variants={reduceMotion ? undefined : sectionItem}
            initial={reduceMotion ? { opacity: 1 } : 'hidden'}
            whileInView={reduceMotion ? { opacity: 1 } : 'show'}
            viewport={{ once: true, amount: 0.5 }}
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-light-textSecondary dark:text-dark-textSecondary">
              <p>
                © {currentYear} Norman Martínez. {language === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
              </p>
            </div>
          </motion.div>
        </div>
      </Container>
    </footer>
  );
}
