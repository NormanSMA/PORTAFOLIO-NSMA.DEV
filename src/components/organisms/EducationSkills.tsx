import { useLanguage } from '../../hooks';
import { GraduationCap, BadgeCheck, Languages } from 'lucide-react';
import { Container } from '../atoms';
import { typography } from '../../config/typography';
import { technicalSkills } from '../../data/skills';

export function EducationSkills() {
  const { t } = useLanguage();

  return (
    <section id="education-skills" className="py-16 md:py-24 bg-background relative overflow-hidden">
      <Container>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div
            className="text-center mb-12 md:mb-16 relative"
          >
            <h2 className={`${typography.sectionTitle} text-foreground mb-4 relative z-10`}>
              {t('educationSkills.title')}
            </h2>
            <p className={`${typography.sectionSubtitle} text-muted-foreground max-w-3xl mx-auto px-4`}>
              {t('educationSkills.subtitle')}
            </p>
          </div>

          <div
            className="grid max-w-screen-lg mx-auto space-y-8 lg:grid-cols-2 lg:space-y-0 lg:divide-x lg:divide-border"
          >
            {/* Left Column: Education */}
            <div
              className="space-y-6 sm:px-8 lg:pr-12"
            >
              {/* University */}
              <div className="flex flex-col lg:flex-row items-center lg:items-start max-w-md mx-auto lg:mx-0 rounded-2xl p-3">
                <div className="mb-4 lg:mb-0 lg:mr-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary">
                    <GraduationCap className="h-7 w-7 text-foreground" strokeWidth={2.1} />
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <h4 className={`${typography.cardSubtitle} text-foreground mb-2`}>
                    {t('educationSkills.education.university.title')}
                  </h4>
                  <p className={`${typography.secondary} text-muted-foreground mb-1`}>
                    {t('educationSkills.education.university.degree')}
                  </p>
                  <p className={`${typography.small} text-foreground font-medium`}>
                    {t('educationSkills.education.university.year')}
                  </p>
                  <p className={`${typography.small} text-muted-foreground`}>
                    {t('educationSkills.education.university.period')}
                  </p>
                </div>
              </div>

              {/* Certifications */}
              <div className="flex flex-col lg:flex-row items-center lg:items-start max-w-md mx-auto lg:mx-0 rounded-2xl p-3">
                <div className="mb-4 lg:mb-0 lg:mr-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary">
                    <BadgeCheck className="h-7 w-7 text-foreground" strokeWidth={2.1} />
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <h4 className={`${typography.cardSubtitle} text-foreground mb-2`}>
                    {t('educationSkills.education.certifications.title')}
                  </h4>
                  <p className={`${typography.secondary} text-muted-foreground`}>
                    {t('educationSkills.education.certifications.scrum')}
                  </p>
                  <p className={`${typography.secondary} text-muted-foreground`}>
                    {t('educationSkills.education.certifications.rpa')}
                  </p>
                </div>
              </div>

              {/* Languages */}
              <div className="flex flex-col lg:flex-row items-center lg:items-start max-w-md mx-auto lg:mx-0 rounded-2xl p-3">
                <div className="mb-4 lg:mb-0 lg:mr-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary">
                    <Languages className="h-7 w-7 text-foreground" strokeWidth={2.1} />
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <h4 className={`${typography.cardSubtitle} text-foreground mb-2`}>
                    {t('educationSkills.education.languages.title')}
                  </h4>
                  <p className={`${typography.secondary} text-muted-foreground`}>
                    <span className="font-medium">{t('educationSkills.education.languages.spanish')}:</span>{' '}
                    {t('educationSkills.education.languages.native')}
                  </p>
                  <p className={`${typography.secondary} text-muted-foreground`}>
                    <span className="font-medium">{t('educationSkills.education.languages.english')}:</span>{' '}
                    {t('educationSkills.education.languages.level')}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Technical Skills */}
            <div
              className="space-y-6 sm:px-8 lg:pl-12"
            >
              <div className="grid grid-cols-3 gap-4">
                {technicalSkills.map((skill, index) => {
                  const Icon = skill.icon;
                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border group"
                    >
                      <div 
                        className="w-10 h-10 text-foreground"
                      >
                        <Icon className="w-full h-full drop-shadow-sm" />
                      </div>
                      <span className={`${typography.small} text-muted-foreground text-center font-medium`}>
                        {skill.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Additional Concepts */}
              <div className="pt-4 border-t border-border">
                <h4 className={`${typography.secondary} text-foreground font-semibold mb-3`}>
                  {t('educationSkills.skills.concepts.title')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm">
                    {t('educationSkills.skills.concepts.agile')}
                  </span>
                  <span className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm">
                    {t('educationSkills.skills.concepts.uxui')}
                  </span>
                  <span className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm">
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
