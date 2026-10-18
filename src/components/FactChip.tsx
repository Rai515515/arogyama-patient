import { Link } from 'react-router-dom';
import { useT, usePick, useFmt } from '../i18n';
import { factForSlot, type Fact, type FactTopic } from '../content/facts';
import { SOURCES } from '../content/sources';
import { useStage } from '../store/stage';

interface FactChipProps {
  /** where this chip sits — same slot shows the same fact all day */
  slot: string;
  kinds?: Fact['kind'][];
  topic?: FactTopic;
  /** band = tinted strip, quiet = thin rule between list rows */
  variant?: 'band' | 'quiet';
  fact?: Fact;
}

/** A small, sourced fact that turns up in random places across the app. */
export default function FactChip({ slot, kinds, topic, variant = 'band', fact }: FactChipProps) {
  const t = useT();
  const p = usePick();
  const fmt = useFmt();
  const stage = useStage();
  const f = fact ?? factForSlot(stage.tag, slot, { kinds, topic });
  const src = f.source ? SOURCES[f.source] : undefined;
  const label = f.kind === 'news' ? t("What's new") : f.kind === 'motivation' ? t('For you today') : t('Did you know?');

  return (
    <aside className={`fact fact-${variant} fact-kind-${f.kind}`} aria-label={label}>
      <div className="fact-label">
        {label}
        {f.date && <span className="fact-date">{fmt.date(f.date, { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
      </div>
      <p className="fact-text">{p(f.text)}</p>
      {(src || f.learn) && (
        <div className="fact-foot">
          {src && (
            <a href={src.url} target="_blank" rel="noreferrer" className="fact-source">
              {src.publisher.split(/[,(]/)[0].trim()}
            </a>
          )}
          {f.learn && (
            <Link to={`/learn/${f.learn}`} className="fact-more">
              {t('Read more')}
            </Link>
          )}
        </div>
      )}
    </aside>
  );
}
