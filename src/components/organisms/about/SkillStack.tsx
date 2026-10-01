import { useLanguage } from '../../../hooks';
import { typography } from '../../../config/typography';
import { skillGroups, type Skill } from '../../../data/skills';
import { cn } from '../../../utils/helpers';
import { Card } from '../../atoms';

// One convention for the whole stack: a 20 px slot with the brand icon, or a neutral dot when the brand has none.
function SkillItem({ skill }: { skill: Skill }) {
  const Icon = skill.icon;

  return (
    <li className="flex items-center gap-2">
      <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center">
        {Icon ? (
          <Icon className={skill.iconClassName ?? 'size-full'} />
        ) : (
          <span className="size-1.5 rounded-full bg-fg-subtle" />
        )}
      </span>
      <span className={cn(typography.body, 'text-fg-muted')}>
        {skill.name}
        {skill.detail && <span className="text-fg-subtle"> ({skill.detail})</span>}
      </span>
    </li>
  );
}

export function SkillStack() {
  const { t } = useLanguage();

  return (
    <Card variant="info">
      <h3 className={cn(typography.h4, 'text-fg')}>{t('skills.title')}</h3>
      <div>
        {skillGroups.map((group) => (
          <div
            key={group.id}
            className="grid gap-x-8 gap-y-3 border-t border-line py-4 last:pb-0 md:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]"
          >
            <h4 id={`stack-${group.id}`} className={cn(typography.h5, 'text-fg')}>
              {t(`skills.groups.${group.id}`)}
            </h4>
            <ul aria-labelledby={`stack-${group.id}`} className="flex flex-wrap gap-x-6 gap-y-2">
              {group.skills.map((skill) => (
                <SkillItem key={skill.name} skill={skill} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}
