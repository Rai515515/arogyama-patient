import { useEffect, useMemo, useState } from 'react';
import { useT, usePick } from '../i18n';
import { randomFact } from '../content/facts';
import { SOURCES } from '../content/sources';
import { useStage } from '../store/stage';

interface SplashProps {
  onDone: () => void;
  /** ms before it closes on its own */
  duration?: number;
}

/**
 * The load screen. Every open shows one new, sourced fact — the moment she is
 * most likely to read something, because nothing else is on screen yet.
 */
export default function Splash({ onDone, duration = 3200 }: SplashProps) {
  const t = useT();
  const p = usePick();
  const stage = useStage();
  const fact = useMemo(() => randomFact(stage.tag), [stage.tag]);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setLeaving(true), duration);
    return () => clearTimeout(id);
  }, [duration]);

  useEffect(() => {
    if (!leaving) return;
    const id = setTimeout(onDone, 260);
    return () => clearTimeout(id);
  }, [leaving, onDone]);

  const src = fact.source ? SOURCES[fact.source] : undefined;

  return (
    <div
      className={`splash${leaving ? ' splash-out' : ''}`}
      role="dialog"
      aria-label={t('Loading')}
      onClick={() => setLeaving(true)}
      style={{ ['--splash-ms' as string]: `${duration}ms` }}
    >
      <div className="splash-brand">
        <span className="splash-mark" aria-hidden="true">
          <svg viewBox="0 0 40 40" width="40" height="40">
            <path d="M20 6c7 5 10 11 10 16a10 10 0 0 1-20 0c0-5 3-11 10-16Z" fill="currentColor" />
            <path d="M20 14v20" stroke="var(--neem-dark)" strokeWidth="1.6" fill="none" />
          </svg>
        </span>
        <span className="splash-name">Arogyama</span>
      </div>

      <div className="splash-body">
        <div className="splash-kicker">{fact.kind === 'news' ? t("What's new") : t('Did you know?')}</div>
        <p className="splash-fact">{p(fact.text)}</p>
        {src && <div className="splash-source">{src.publisher.split(/[,(]/)[0].trim()}, {src.year}</div>}
      </div>

      <div className="splash-foot">
        <div className="splash-progress" aria-hidden="true" />
        <span>{t('Tap to continue')}</span>
      </div>
    </div>
  );
}
