import { useLanguage } from '../../hooks';
import { motion, useReducedMotion } from 'framer-motion';
import { GraduationCap, BadgeCheck, Languages } from 'lucide-react';
import { Container } from '../atoms';
import { typography } from '../../config/typography';
import { technicalSkills } from '../../data/skills';

export function EducationSkills() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();

  return (
    <section id="education-skills" className="py-16 md:py-24 bg-light-bg dark:bg-dark-bg relative overflow-hidden">
      <Container>
        <div className="max-w-6xl mx-auto">
          {/* Header con decoración de puntos */}
          <motion.div
            className="text-center mb-12 md:mb-16 relative"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
            whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Patrón de puntos decorativo */}
            <svg
              viewBox="0 0 52 24"
              fill="currentColor"
              className="absolute top-0 left-1/2 -translate-x-1/2 z-0 w-32 -mt-4 text-primary-100 dark:text-primary-900/30 hidden sm:block"
            >
              <defs>
                <pattern
                  id="education-dots-pattern"
                  x="0"
                  y="0"
                  width=".135"
                  height=".30"
                >
                  <circle cx="1" cy="1" r=".7" />
                </pattern>
              </defs>
              <rect
                fill="url(#education-dots-pattern)"
                width="52"
                height="24"
              />
            </svg>
            
            <h2 className={`${typography.sectionTitle} text-light-text dark:text-dark-text mb-4 relative z-10`}>
              {t('educationSkills.title')}
            </h2>
            <p className={`${typography.sectionSubtitle} text-light-textSecondary dark:text-dark-textSecondary max-w-3xl mx-auto px-4`}>
              {t('educationSkills.subtitle')}
            </p>
          </motion.div>

          {/* Layout de dos columnas con divisor */}
          <div className="grid max-w-screen-lg mx-auto space-y-8 lg:grid-cols-2 lg:space-y-0 lg:divide-x lg:divide-light-border dark:lg:divide-dark-border">
            
            {/* Columna Izquierda: Educación */}
            <motion.div
              className="space-y-6 sm:px-8 lg:pr-12"
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: -32 }}
              whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
            >
              
              {/* Universidad */}
              <motion.div
                className="flex flex-col lg:flex-row items-center lg:items-start max-w-md mx-auto lg:mx-0 rounded-2xl p-3 transition-all duration-300 hover:bg-light-card/60 dark:hover:bg-dark-card/50"
                whileHover={reduceMotion ? undefined : { y: -5, scale: 1.02 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <div className="mb-4 lg:mb-0 lg:mr-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/30">
                    <GraduationCap className="h-7 w-7 text-primary-600 dark:text-primary-400" strokeWidth={2.1} />
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <h4 className={`${typography.cardSubtitle} text-light-text dark:text-dark-text mb-2`}>
                    {t('educationSkills.education.university.title')}
                  </h4>
                  <p className={`${typography.secondary} text-light-textSecondary dark:text-dark-textSecondary mb-1`}>
                    {t('educationSkills.education.university.degree')}
                  </p>
                  <p className={`${typography.small} text-primary-600 dark:text-primary-400 font-medium`}>
                    {t('educationSkills.education.university.year')}
                  </p>
                  <p className={`${typography.small} text-light-textSecondary dark:text-dark-textSecondary`}>
                    {t('educationSkills.education.university.period')}
                  </p>
                </div>
              </motion.div>

              {/* Certificaciones */}
              <motion.div
                className="flex flex-col lg:flex-row items-center lg:items-start max-w-md mx-auto lg:mx-0 rounded-2xl p-3 transition-all duration-300 hover:bg-light-card/60 dark:hover:bg-dark-card/50"
                whileHover={reduceMotion ? undefined : { y: -5, scale: 1.02 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <div className="mb-4 lg:mb-0 lg:mr-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/30">
                    <BadgeCheck className="h-7 w-7 text-primary-600 dark:text-primary-400" strokeWidth={2.1} />
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <h4 className={`${typography.cardSubtitle} text-light-text dark:text-dark-text mb-2`}>
                    {t('educationSkills.education.certifications.title')}
                  </h4>
                  <p className={`${typography.secondary} text-light-textSecondary dark:text-dark-textSecondary`}>
                    {t('educationSkills.education.certifications.scrum')}
                  </p>
                  <p className={`${typography.secondary} text-gray-600 dark:text-gray-400`}>
                    {t('educationSkills.education.certifications.rpa')}
                  </p>
                </div>
              </motion.div>

              {/* Idiomas */}
              <motion.div
                className="flex flex-col lg:flex-row items-center lg:items-start max-w-md mx-auto lg:mx-0 rounded-2xl p-3 transition-all duration-300 hover:bg-light-card/60 dark:hover:bg-dark-card/50"
                whileHover={reduceMotion ? undefined : { y: -5, scale: 1.02 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <div className="mb-4 lg:mb-0 lg:mr-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/30">
                    <Languages className="h-7 w-7 text-primary-600 dark:text-primary-400" strokeWidth={2.1} />
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <h4 className={`${typography.cardSubtitle} text-light-text dark:text-dark-text mb-2`}>
                    {t('educationSkills.education.languages.title')}
                  </h4>
                  <p className={`${typography.secondary} text-light-textSecondary dark:text-dark-textSecondary`}>
                    <span className="font-medium">{t('educationSkills.education.languages.spanish')}:</span>{' '}
                    {t('educationSkills.education.languages.native')}
                  </p>
                  <p className={`${typography.secondary} text-gray-600 dark:text-gray-400`}>
                    <span className="font-medium">{t('educationSkills.education.languages.english')}:</span>{' '}
                    {t('educationSkills.education.languages.level')}
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Separador visual para móvil/tablet */}
            <div className="lg:hidden flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary-300 dark:via-primary-600 to-transparent"></div>
              <span className="text-sm font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">
                {t('educationSkills.skills.title')}
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary-300 dark:via-primary-600 to-transparent"></div>
            </div>

            {/* Columna Derecha: Habilidades Técnicas */}
            <motion.div
              className="space-y-6 sm:px-8 lg:pl-12"
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: 32 }}
              whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            >

              {/* Grid de tecnologías - 3 columnas para mejor distribución */}
              <div className="grid grid-cols-3 gap-4">
                {technicalSkills.map((skill, index) => {
                  const Icon = skill.icon;
                  return (
                    <motion.div
                      key={index}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-light-card dark:bg-dark-card hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300 hover:-translate-y-1 group"
                      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
                      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                      whileHover={reduceMotion ? undefined : { y: -6, scale: 1.03 }}
                      viewport={{ once: true, amount: 0.25 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: index * 0.04 }}
                    >
                      <motion.div 
                        className="w-10 h-10 text-primary-600 dark:text-primary-400"
                        animate={reduceMotion ? undefined : { 
                          y: [0, -4, 0],
                        }}
                        transition={reduceMotion ? undefined : {
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.2
                        }}
                      >
                        <Icon className="w-full h-full drop-shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:text-primary-500" />
                      </motion.div>
                      <span className={`${typography.small} text-light-textSecondary dark:text-dark-textSecondary text-center font-medium`}>
                        {skill.name}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Conceptos adicionales */}
              <div className="pt-4 border-t border-light-border dark:border-dark-border">
                <h4 className={`${typography.secondary} text-light-text dark:text-dark-text font-semibold mb-3`}>
                  {t('educationSkills.skills.concepts.title')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm">
                    {t('educationSkills.skills.concepts.agile')}
                  </span>
                  <span className="px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm">
                    {t('educationSkills.skills.concepts.uxui')}
                  </span>
                  <span className="px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm">
                    Git/GitHub
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
