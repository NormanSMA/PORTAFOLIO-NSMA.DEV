import { useState, useRef, useEffect, useCallback } from 'react';
import { ExternalLink } from 'lucide-react';
import { useLanguage, useTheme } from '../../hooks';
import { Container } from '../atoms';
import { typography } from '../../config/typography';
import { getProjects } from '../../data/projects';

export function Projects() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [maxLines, setMaxLines] = useState(3);
  const referenceTextRef = useRef<HTMLParagraphElement>(null);
  const closeButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const toggleButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

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

  const toggleExpanded = useCallback((projectId: string) => {
    setExpandedProject(prev => {
      if (prev === projectId) {
        setTimeout(() => toggleButtonRefs.current.get(projectId)?.focus(), 50);
        return null;
      }
      setTimeout(() => closeButtonRefs.current.get(projectId)?.focus(), 350);
      return projectId;
    });
  }, []);

  return (
    <section id="projects" className="relative overflow-hidden bg-background py-14 md:py-20">
      <Container>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div
            className="mb-10 text-center md:mb-12"
          >
            <h2 className={`${typography.sectionTitle} text-foreground mb-4`}>
              {t('projects.title')}
            </h2>
            <p className={`${typography.sectionSubtitle} text-muted-foreground max-w-3xl mx-auto px-4`}>
              {t('projects.subtitle')}
            </p>
          </div>

          {/* Projects Grid */}
          <div
            className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3"
          >
            {projects.map((project) => {
              const IconComponent = project.icon;
              const isExpanded = expandedProject === project.id;
              const isReference = project.id === 'bolsa';

              return (
                <article
                  key={project.id}
                  className="group relative overflow-visible rounded-2xl border border-border bg-card"
                >
                  {/* Main Card */}
                  <div className="relative">
                    {/* Image Container */}
                    <div className="relative h-44 overflow-hidden rounded-t-2xl bg-card sm:h-48 md:h-44 lg:h-48">
                      <img
                        src={project.imageDark && theme === 'dark' ? project.imageDark : project.image}
                        alt={project.title}
                        className="h-full w-full object-cover"
                      />
                      {/* Category Badge con icono */}
                      <div className="absolute left-3 top-3 flex items-center gap-1.5 overflow-hidden rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background sm:left-4 sm:top-4 sm:gap-2 sm:px-4 sm:text-sm">
                        <IconComponent className="w-4 h-4 flex-shrink-0" />
                        <span className="relative z-10">{project.category}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4 rounded-b-2xl bg-card p-5 sm:p-6">
                      {/* Title */}
                      <h3 className="text-xl sm:text-2xl md:text-xl lg:text-2xl text-foreground font-bold line-clamp-1">
                        {project.title}
                      </h3>

                      {/* Description */}
                      {isReference ? (
                        <p ref={referenceTextRef} className="text-sm sm:text-base md:text-sm lg:text-base text-muted-foreground leading-relaxed">
                          {project.shortDescription}
                        </p>
                      ) : (
                        <p
                          className={`text-sm sm:text-base md:text-sm lg:text-base text-muted-foreground leading-relaxed line-clamp-${maxLines}`}
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: maxLines,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {project.shortDescription}
                        </p>
                      )}

                      {/* Technologies */}
                      <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
                        {project.technologies.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="inline-flex items-center justify-center px-2.5 py-1 sm:px-3 sm:py-1.5 bg-secondary text-foreground rounded-full text-xs sm:text-xs font-medium border border-transparent text-center"
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
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground sm:gap-2 sm:text-base"
                          >
                            <span>Ver proyecto</span>
                            <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-2 text-muted-foreground font-semibold text-xs sm:text-sm">
                            Aplicación móvil
                          </span>
                        )}

                        {project.fullDescription && (
                          <button
                            ref={(el) => {
                              if (el) toggleButtonRefs.current.set(project.id, el);
                              else toggleButtonRefs.current.delete(project.id);
                            }}
                            onClick={() => toggleExpanded(project.id)}
                            className="flex cursor-pointer items-center justify-center gap-1 rounded-full bg-secondary/70 px-3 py-1.5"
                            aria-label="Ver más información"
                          >
                            <span className="text-xs sm:text-sm text-foreground font-medium">...</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"
                              className={`h-3 w-3 sm:h-3.5 sm:w-3.5 text-foreground ${isExpanded ? 'rotate-180' : ''}`}
                            >
                              <path d="M4.646 2.146a.5.5 0 0 0 0 .708L7.793 6L4.646 9.146a.5.5 0 1 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 0 0-.708 0z" fill="currentColor" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Panel */}
                  {project.fullDescription && (
                    <div
                      className={`absolute right-0 top-0 z-10 h-full w-full ${
                        isExpanded ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-full opacity-0 pointer-events-none'
                      }`}
                    >
                      <div className="h-full w-full rounded-2xl border border-border bg-card p-5 sm:p-6">
                        <div className="flex flex-col h-full">
                          <button
                            ref={(el) => {
                              if (el) closeButtonRefs.current.set(project.id, el);
                              else closeButtonRefs.current.delete(project.id);
                            }}
                            onClick={() => setExpandedProject(null)}
                            className="self-end mb-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary sm:mb-4 sm:h-8 sm:w-8"
                            aria-label="Cerrar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                              className="h-3.5 w-3.5 text-foreground sm:h-4 sm:w-4"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <h4 className="text-lg sm:text-xl md:text-lg lg:text-xl text-foreground font-bold mb-3 sm:mb-4">{project.title}</h4>
                            <p className="text-sm sm:text-base md:text-sm lg:text-base text-muted-foreground leading-relaxed">
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
