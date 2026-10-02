import { useLanguage } from '../../../hooks';
import { typography } from '../../../config/typography';
import { cn } from '../../../utils/helpers';
import { Card } from '../../atoms';
import { Constellation } from './Constellation';
import { techGraph } from './constellationGraph';
import { TechSummary } from './TechSummary';

const HEADING_ID = 'stack-heading';

// The sphere is the whole showpiece: it names its front chips itself and the card adds no second visible list.
// The section reveals the card; the sphere starts its own frames only while it is on screen.
export function TechStack() {
  const { t } = useLanguage();

  return (
    <Card variant="info" data-reveal="card" className="min-w-0">
      <h3 id={HEADING_ID} className={cn(typography.h4, 'text-fg')}>
        {t('skills.title')}
      </h3>
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <Constellation graph={techGraph} />
        <p className={cn(typography.caption, 'text-fg-subtle')}>{t('skills.hint')}</p>
      </div>
      <TechSummary labelledBy={HEADING_ID} />
    </Card>
  );
}
