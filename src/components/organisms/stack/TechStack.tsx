import { useLanguage } from '../../../hooks';
import { typography } from '../../../config/typography';
import { cn } from '../../../utils/helpers';
import { Card } from '../../atoms';
import { Constellation } from './Constellation';
import { techGraph } from './constellationGraph';
import { TechList } from './TechList';

// The sphere is the showpiece and the list is the readable source: same technologies, grouped as in the CV.
// The section reveals the card; the sphere starts its own frames only while it is on screen.
export function TechStack() {
  const { t } = useLanguage();

  return (
    <Card variant="info" data-reveal="card">
      <h3 className={cn(typography.h4, 'text-fg')}>{t('skills.title')}</h3>
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-10">
        <div className="flex flex-col items-center gap-2">
          <Constellation graph={techGraph} />
          <p className={cn(typography.caption, 'text-fg-subtle')}>{t('skills.hint')}</p>
        </div>
        <TechList />
      </div>
    </Card>
  );
}
