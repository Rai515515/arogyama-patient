/**
 * Forty ticks. Forty weeks of pregnancy, then the traditional forty days after
 * birth — the same ribbon carries her from one to the other.
 */
export default function CountRibbon({ value, total = 40, label }: { value: number; total?: number; label: string }) {
  const v = Math.max(0, Math.min(total, value));
  return (
    <div className="ribbon" role="img" aria-label={label}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < v ? (i === v - 1 ? 'tick now' : 'tick on') : 'tick'} />
      ))}
    </div>
  );
}
