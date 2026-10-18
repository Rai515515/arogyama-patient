import { useEffect, useState } from 'react';

interface PregnancyTrackProps {
  weeks: number;
  trimester: 1 | 2 | 3;
}

const TOTAL_WEEKS = 40;

/** Horizontal week-40 journey bar with a trimester-segmented track and current-week marker. */
export default function PregnancyTrack({ weeks, trimester }: PregnancyTrackProps) {
  const targetPct = Math.max(2, Math.min(100, (weeks / TOTAL_WEEKS) * 100));
  const [pct, setPct] = useState(2);

  useEffect(() => {
    const id = requestAnimationFrame(() => setPct(targetPct));
    return () => cancelAnimationFrame(id);
  }, [targetPct]);

  return (
    <div className="pregnancy-track-wrap">
      <div className="pregnancy-track">
        <div className="pregnancy-track-seg" />
        <div className="pregnancy-track-seg" />
        <div className="pregnancy-track-seg" />
        <div className="pregnancy-track-fill" style={{ width: `${pct}%` }} />
        <div className="pregnancy-track-marker" style={{ left: `${pct}%` }} />
      </div>
      <div className="pregnancy-track-labels">
        <span className={trimester === 1 ? 'active' : undefined}>1st trimester</span>
        <span className={trimester === 2 ? 'active' : undefined}>2nd trimester</span>
        <span className={trimester === 3 ? 'active' : undefined}>3rd trimester</span>
      </div>
    </div>
  );
}
