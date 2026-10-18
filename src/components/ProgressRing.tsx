import { useEffect, useRef, useState } from 'react';

interface ProgressRingProps {
  pct: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  tone?: 'rose' | 'sage' | 'terracotta';
}

/** Circular completion indicator that animates from 0 to its target on mount. */
export default function ProgressRing({
  pct,
  size = 132,
  strokeWidth = 11,
  label,
  sublabel,
  tone = 'rose',
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, pct));
  const [animated, setAnimated] = useState(0);
  const raf = useRef<number | undefined>(undefined);

  useEffect(() => {
    raf.current = requestAnimationFrame(() => setAnimated(clamped));
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [clamped]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - animated / 100);

  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border-soft)"
          strokeWidth={strokeWidth}
        />
        {animated > 0.5 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`var(--color-${tone})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className="progress-ring-arc"
          />
        )}
      </svg>
      {(label || sublabel) && (
        <div className="progress-ring-label">
          {label && <div className="progress-ring-value">{label}</div>}
          {sublabel && <div className="progress-ring-sublabel">{sublabel}</div>}
        </div>
      )}
    </div>
  );
}
