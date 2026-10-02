import { useLanguage } from '../../../hooks';
import { typography } from '../../../config/typography';
import { skillGroups, type Skill } from '../../../data/skills';
import { cn } from '../../../utils/helpers';
import { TechGlyph } from './TechGlyph';

// One convention for every technology: a 20 px slot with its brand glyph, then the name.
function TechItem({ skill }: { skill: Skill }) {
  return (
    <li className="flex items-center gap-2">
      <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center">
        <TechGlyph tech={skill.tech} />
      </span>
      <span className={cn(typography.body, 'text-fg-muted')}>
        {skill.name}
        {skill.detail && <span className="text-fg-subtle"> ({skill.detail})</span>}
      </span>
    </li>
  );
}

export function TechList() {
  const { t } = useLanguage();

  return (
    <div>
      {skillGroups.map((group) => (
        <div key={group.id} className="flex flex-col gap-3 border-t border-line py-4 first:border-t-0 first:pt-0 last:pb-0">
          <h4 id={`stack-${group.id}`} className={cn(typography.h5, 'text-fg')}>
            {t(`skills.groups.${group.id}`)}
          </h4>
          <ul aria-labelledby={`stack-${group.id}`} className="flex flex-wrap gap-x-5 gap-y-2">
            {group.skills.map((skill) => (
              <TechItem key={skill.name} skill={skill} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
