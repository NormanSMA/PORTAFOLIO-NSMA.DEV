import { useLanguage } from '../../hooks';
import { Container } from '../atoms';
import { typography } from '../../config/typography';
import { technicalSkills } from '../../data/skills';

export function EducationSkills() {
  const { t } = useLanguage();

  return (
    <section id="education-skills" className="py-16 md:py-24 bg-light-bg dark:bg-dark-bg relative overflow-hidden">
      <Container>
        <div className="max-w-6xl mx-auto">
          {/* Header con decoración de puntos */}
          <div className="text-center mb-12 md:mb-16 relative">
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
          </div>

          {/* Layout de dos columnas con divisor */}
          <div className="grid max-w-screen-lg mx-auto space-y-8 lg:grid-cols-2 lg:space-y-0 lg:divide-x lg:divide-light-border dark:lg:divide-dark-border">
            
            {/* Columna Izquierda: Educación */}
            <div className="space-y-6 sm:px-8 lg:pr-12">
              
              {/* Universidad */}
              <div className="flex flex-col lg:flex-row items-center lg:items-start max-w-md mx-auto lg:mx-0">
                <div className="mb-4 lg:mb-0 lg:mr-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/30">
                    <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
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
              </div>

              {/* Certificaciones */}
              <div className="flex flex-col lg:flex-row items-center lg:items-start max-w-md mx-auto lg:mx-0">
                <div className="mb-4 lg:mb-0 lg:mr-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/30">
                    <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
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
              </div>

              {/* Idiomas */}
              <div className="flex flex-col lg:flex-row items-center lg:items-start max-w-md mx-auto lg:mx-0">
                <div className="mb-4 lg:mb-0 lg:mr-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/30">
                    <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
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
              </div>
            </div>

            {/* Separador visual para móvil/tablet */}
            <div className="lg:hidden flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary-300 dark:via-primary-600 to-transparent"></div>
              <span className="text-sm font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">
                {t('educationSkills.skills.title')}
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary-300 dark:via-primary-600 to-transparent"></div>
            </div>

            {/* Columna Derecha: Habilidades Técnicas */}
            <div className="space-y-6 sm:px-8 lg:pl-12">

              {/* Grid de tecnologías - 3 columnas para mejor distribución */}
              <div className="grid grid-cols-3 gap-4">
                {technicalSkills.map((skill, index) => {
                  const Icon = skill.icon;
                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-light-card dark:bg-dark-card hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300 hover:-translate-y-1 group"
                    >
                      <div className="w-10 h-10 group-hover:scale-110 transition-transform duration-300">
                        <Icon />
                      </div>
                      <span className={`${typography.small} text-light-textSecondary dark:text-dark-textSecondary text-center font-medium`}>
                        {skill.name}
                      </span>
                    </div>
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
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
