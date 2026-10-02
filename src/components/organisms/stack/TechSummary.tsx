import { useLanguage } from '../../../hooks';
import { skillGroups } from '../../../data/skills';

interface TechSummaryProps {
  // Id of the heading that names the whole list.
  labelledBy: string;
}

// The sphere is decorative, so this is the readable source of the same technologies, grouped as in the CV.
// Visually hidden, never display:none, so screen readers still reach it. role="list" restores semantics Safari drops.
export function TechSummary({ labelledBy }: TechSummaryProps) {
  const { t } = useLanguage();

  return (
    <ul role="list" aria-labelledby={labelledBy} className="sr-only">
      {skillGroups.map((group) => (
        <li key={group.id}>
          <p id={`stack-${group.id}`}>{t(`skills.groups.${group.id}`)}</p>
          <ul role="list" aria-labelledby={`stack-${group.id}`}>
            {group.skills.map((skill) => (
              <li key={skill.name}>{skill.detail ? `${skill.name} (${skill.detail})` : skill.name}</li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
