import { visualStateFor } from './statusVisual';

interface StatusBadgeProps {
  status: string;
  label: string;
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  return <span className={`chip-status state-${visualStateFor(status)}`}>{label}</span>;
}
