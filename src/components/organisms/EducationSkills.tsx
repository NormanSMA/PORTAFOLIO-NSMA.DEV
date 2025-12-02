import { useState } from 'react';
import { useLanguage } from '../../hooks';
import { Container } from '../atoms';
import { typography } from '../../config/typography';
import { technicalSkills } from '../../data/skills';

export function EducationSkills() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'education' | 'skills'>('education');

  return (
    <section id="education-skills" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900/95 relative overflow-hidden">
      <Container>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className={`${typography.sectionTitle} text-light-text dark:text-dark-text mb-4`}>
              {t('educationSkills.title')}
            </h2>
            <p className={`${typography.sectionSubtitle} text-light-textSecondary dark:text-dark-textSecondary max-w-3xl mx-auto px-4`}>
              {t('educationSkills.subtitle')}
            </p>
          </div>

          {/* Layout: Tabs on left, Content on right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left: Tabs Navigation */}
            <div className="lg:col-span-4 space-y-3">
              <button
                onClick={() => setActiveTab('education')}
                className={`w-full text-left px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'education'
                    ? 'bg-primary-600 dark:bg-primary-500 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className={`${typography.cardSubtitle} block`}>
                  {t('educationSkills.tabs.education')}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('skills')}
                className={`w-full text-left px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'skills'
                    ? 'bg-primary-600 dark:bg-primary-500 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className={`${typography.cardSubtitle} block`}>
                  {t('educationSkills.tabs.skills')}
                </span>
              </button>
            </div>

            {/* Right: Content Area */}
            <div className="lg:col-span-8">
              {activeTab === 'education' ? (
                <div className="space-y-8 animate-fadeIn">
                  {/* Universidad */}
                  <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">🎓</span>
                      </div>
                      <div className="flex-1">
                        <h3 className={`${typography.cardSubtitle} text-gray-900 dark:text-white mb-2`}>
                          {t('educationSkills.education.university.title')}
                        </h3>
                        <p className={`${typography.secondary} text-gray-700 dark:text-gray-300 mb-1`}>
                          {t('educationSkills.education.university.degree')}
                        </p>
                        <p className={`${typography.small} text-gray-500 dark:text-gray-400`}>
                          {t('educationSkills.education.university.period')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Certificaciones */}
                  <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className={`${typography.cardSubtitle} text-gray-900 dark:text-white mb-4 flex items-center gap-2`}>
                      <span className="text-2xl">📜</span>
                      {t('educationSkills.education.certifications.title')}
                    </h3>
                    <ul className="space-y-3">
                      <li className={`${typography.secondary} text-gray-700 dark:text-gray-300 flex items-start gap-2`}>
                        <span className="text-primary-600 dark:text-primary-400 mt-1">●</span>
                        <span>{t('educationSkills.education.certifications.scrum')}</span>
                      </li>
                      <li className={`${typography.secondary} text-gray-700 dark:text-gray-300 flex items-start gap-2`}>
                        <span className="text-primary-600 dark:text-primary-400 mt-1">●</span>
                        <span>{t('educationSkills.education.certifications.rpa')}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Idiomas */}
                  <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className={`${typography.cardSubtitle} text-gray-900 dark:text-white mb-4 flex items-center gap-2`}>
                      <span className="text-2xl">🌎</span>
                      {t('educationSkills.education.languages.title')}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className={`${typography.secondary} text-gray-900 dark:text-white font-semibold`}>
                          {t('educationSkills.education.languages.spanish')}
                        </p>
                        <p className={`${typography.small} text-gray-600 dark:text-gray-400`}>
                          {t('educationSkills.education.languages.native')}
                        </p>
                      </div>
                      <div>
                        <p className={`${typography.secondary} text-gray-900 dark:text-white font-semibold`}>
                          {t('educationSkills.education.languages.english')}
                        </p>
                        <p className={`${typography.small} text-gray-600 dark:text-gray-400`}>
                          {t('educationSkills.education.languages.intermediate')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-fadeIn">
                  {/* Habilidades Técnicas con iconos */}
                  <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className={`${typography.cardSubtitle} text-gray-900 dark:text-white mb-8`}>
                      {t('educationSkills.skills.title')}
                    </h3>

                    {/* Grid de tecnologías con iconos */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-8">
                      {technicalSkills.map((skill, index) => {
                        const Icon = skill.icon;
                        return (
                          <div
                            key={index}
                            className="flex flex-col items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300 hover:-translate-y-1 group"
                          >
                            <div className="w-12 h-12 group-hover:scale-110 transition-transform duration-300">
                              <Icon />
                            </div>
                            <span className={`${typography.small} text-gray-900 dark:text-white text-center font-medium`}>
                              {skill.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Detalles adicionales */}
                    <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                      <div>
                        <h4 className={`${typography.secondary} text-gray-900 dark:text-white font-semibold mb-2`}>
                          {t('educationSkills.skills.concepts.title')}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm">
                            {t('educationSkills.skills.concepts.agile')}
                          </span>
                          <span className="px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm">
                            {t('educationSkills.skills.concepts.security')}
                          </span>
                          <span className="px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm">
                            Active Directory
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
