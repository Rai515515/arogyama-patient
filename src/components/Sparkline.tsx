interface SparklineProps {
  values: number[];
  height?: number;
  width?: number;
}

/** A minimal trend line — no axes, no gridlines, just the shape of the trend. */
export default function Sparkline({ values, height = 40, width = 160 }: SparklineProps) {
  if (values.length === 0) return null;
  const max = Math.max(100, ...values);
  const min = 0;
  const stepX = width / Math.max(1, values.length - 1);

  const points = values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / (max - min)) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const lastX = (values.length - 1) * stepX;
  const lastY = height - ((values[values.length - 1] - min) / (max - min)) * height;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="sparkline">
      <polyline points={points} fill="none" stroke="var(--color-teal)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={3.2} fill="var(--color-teal)" />
    </svg>
  );
}
