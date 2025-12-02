import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../hooks';
import { Container } from '../atoms';
import { typography } from '../../config/typography';
import { ExternalLinkIcon } from '../atoms/icons';
import { getProjects } from '../../data/projects';

export function Projects() {
  const { t } = useLanguage();
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [maxLines, setMaxLines] = useState(3);
  const referenceTextRef = useRef<HTMLParagraphElement>(null);

  const projects = getProjects(t);

  // Calculate max lines based on reference text (Android card)
  useEffect(() => {
    if (referenceTextRef.current) {
      const lineHeight = parseFloat(getComputedStyle(referenceTextRef.current).lineHeight);
      const height = referenceTextRef.current.scrollHeight;
      const lines = Math.floor(height / lineHeight);
      setMaxLines(lines > 0 ? lines : 3);
    }
  }, [t]);

  const toggleExpanded = (projectId: string) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  return (
    <section id="projects" className="py-16 md:py-24 bg-light-bg dark:bg-dark-bg relative overflow-hidden">
      <Container>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className={`${typography.sectionTitle} text-light-text dark:text-dark-text mb-4`}>
              {t('projects.title')}
            </h2>
            <p className={`${typography.sectionSubtitle} text-light-textSecondary dark:text-dark-textSecondary max-w-3xl mx-auto px-4`}>
              {t('projects.subtitle')}
            </p>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {projects.map((project) => {
              const IconComponent = project.icon;
              const isExpanded = expandedProject === project.id;
              const isReference = project.id === 'bolsa'; // Android card es la referencia
              
              return (
                <article
                  key={project.id}
                  className="group relative bg-light-card dark:bg-dark-card rounded-2xl overflow-visible border border-light-border dark:border-dark-border hover:-translate-y-2 transition-all duration-300"
                >
                  {/* Main Card */}
                  <div className="relative">
                    {/* Image Container */}
                    <div className="relative h-44 sm:h-48 md:h-44 lg:h-48 overflow-hidden bg-light-card dark:bg-dark-card rounded-t-2xl">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Category Badge con icono */}
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-primary-600 dark:bg-primary-500 text-white px-3 py-1.5 sm:px-4 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2">
                        <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>{project.category}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 sm:p-6 space-y-4 bg-light-card dark:bg-dark-card rounded-b-2xl">
                      {/* Title */}
                      <h3 className="text-xl sm:text-2xl md:text-xl lg:text-2xl text-light-text dark:text-dark-text font-bold line-clamp-1">
                        {project.title}
                      </h3>

                      {/* Description - Reference text (Android) sin line-clamp */}
                      {isReference ? (
                        <p
                          ref={referenceTextRef}
                          className="text-sm sm:text-base md:text-sm lg:text-base text-light-textSecondary dark:text-dark-textSecondary leading-relaxed"
                        >
                          {project.shortDescription}
                        </p>
                      ) : (
                        <p
                          className={`text-sm sm:text-base md:text-sm lg:text-base text-light-textSecondary dark:text-dark-textSecondary leading-relaxed line-clamp-${maxLines}`}
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: maxLines,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {project.shortDescription}
                        </p>
                      )}

                      {/* Technologies - Centradas */}
                      <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
                        {project.technologies.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="inline-flex items-center justify-center px-2.5 py-1 sm:px-3 sm:py-1.5 bg-light-border dark:bg-dark-card text-light-text dark:text-dark-textSecondary rounded-full text-xs sm:text-xs font-medium border border-transparent text-center"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2">
                        {project.url ? (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-semibold transition-colors group/link"
                          >
                            <span>Ver proyecto</span>
                            <ExternalLinkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-2 text-light-textSecondary dark:text-dark-textSecondary font-semibold text-xs sm:text-sm">
                            Aplicación móvil
                          </span>
                        )}

                        {/* Ver más button con "..." */}
                        {project.fullDescription && (
                          <button
                            onClick={() => toggleExpanded(project.id)}
                            className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-full backdrop-blur-lg bg-light-border/50 dark:bg-dark-card/50 hover:bg-primary-600/20 dark:hover:bg-primary-500/20 transition-all duration-300 cursor-pointer group/btn"
                            aria-label="Ver más información"
                          >
                            <span className="text-xs sm:text-sm text-light-text dark:text-dark-text font-medium">
                              ...
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 12 12"
                              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-light-text dark:text-dark-text transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                            >
                              <path
                                d="M4.646 2.146a.5.5 0 0 0 0 .708L7.793 6L4.646 9.146a.5.5 0 1 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 0 0-.708 0z"
                                fill="currentColor"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Panel */}
                  {project.fullDescription && (
                    <div
                      className={`absolute top-0 right-0 w-full h-full transition-all duration-500 ease-in-out z-10 ${
                        isExpanded 
                          ? 'translate-x-0 opacity-100 pointer-events-auto' 
                          : 'translate-x-full opacity-0 pointer-events-none'
                      }`}
                    >
                      <div className="w-full h-full p-5 sm:p-6 rounded-2xl backdrop-blur-xl bg-light-card/95 dark:bg-dark-card/95 border border-light-border dark:border-dark-border shadow-2xl">
                        <div className="flex flex-col h-full">
                          {/* Close button */}
                          <button
                            onClick={() => setExpandedProject(null)}
                            className="self-end mb-3 sm:mb-4 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-light-border dark:bg-dark-card hover:bg-primary-600/20 dark:hover:bg-primary-500/20 transition-colors flex-shrink-0"
                            aria-label="Cerrar"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-light-text dark:text-dark-text"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>

                          {/* Full content */}
                          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <h4 className="text-lg sm:text-xl md:text-lg lg:text-xl text-light-text dark:text-dark-text font-bold mb-3 sm:mb-4">
                              {project.title}
                            </h4>
                            <p className="text-sm sm:text-base md:text-sm lg:text-base text-light-textSecondary dark:text-dark-textSecondary leading-relaxed">
                              {project.fullDescription}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}