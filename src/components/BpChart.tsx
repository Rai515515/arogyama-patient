import type { BpReading } from '../domain/types';

/**
 * Two lines (top and bottom number) against the 140/90 line that matters.
 * Plain SVG so it costs nothing on a low-end phone.
 */
export default function BpChart({ readings, height = 150, labels }: { readings: BpReading[]; height?: number; labels: { high: string } }) {
  const data = [...readings].sort((a, b) => a.at.localeCompare(b.at)).slice(-14);
  if (data.length < 2) return null;
  const W = 320;
  const H = height;
  const padL = 30;
  const padR = 8;
  const padT = 8;
  const padB = 18;
  const min = 60;
  const max = 180;
  const x = (i: number) => padL + (i * (W - padL - padR)) / (data.length - 1);
  const y = (v: number) => padT + ((max - Math.max(min, Math.min(max, v))) * (H - padT - padB)) / (max - min);
  const line = (k: 'systolic' | 'diastolic') => data.map((r, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(r[k]).toFixed(1)}`).join(' ');

  return (
    <svg className="bp-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${data.length} readings`}>
      <rect x={padL} y={y(max)} width={W - padL - padR} height={y(160) - y(max)} fill="var(--kumkum-tint)" />
      <rect x={padL} y={y(160)} width={W - padL - padR} height={y(140) - y(160)} fill="var(--turmeric-tint)" />
      {[60, 90, 120, 140, 160, 180].map((v) => (
        <g key={v}>
          <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke={v === 140 || v === 90 ? 'var(--turmeric)' : 'var(--line-soft)'} strokeDasharray={v === 140 || v === 90 ? '4 3' : undefined} />
          <text x={padL - 5} y={y(v) + 3.5} textAnchor="end" fontSize="9" fill="var(--ink-faint)">
            {v}
          </text>
        </g>
      ))}
      <text x={W - padR} y={y(140) - 4} textAnchor="end" fontSize="9" fill="var(--turmeric-ink)">
        {labels.high}
      </text>
      <path d={line('systolic')} fill="none" stroke="var(--neem-dark)" strokeWidth="2" />
      <path d={line('diastolic')} fill="none" stroke="var(--indigo)" strokeWidth="2" />
      {data.map((r, i) => (
        <g key={r.id}>
          <circle cx={x(i)} cy={y(r.systolic)} r="3.2" fill={r.systolic >= 160 ? 'var(--kumkum)' : r.systolic >= 140 ? 'var(--turmeric)' : 'var(--neem-dark)'} />
          <circle cx={x(i)} cy={y(r.diastolic)} r="3.2" fill={r.diastolic >= 110 ? 'var(--kumkum)' : r.diastolic >= 90 ? 'var(--turmeric)' : 'var(--indigo)'} />
        </g>
      ))}
    </svg>
  );
}
