import type { ReactNode } from 'react';
import { visualStateFor, STATE_ICON, STATE_LABEL_CLASS } from './statusVisual';

interface CareRowProps {
  status: string;
  title: ReactNode;
  meta?: ReactNode;
  trailing?: ReactNode;
  actions?: ReactNode;
  muted?: boolean;
}

/** One prescribed-care item: state icon, title/meta, optional trailing chip and actions. */
export default function CareRow({ status, title, meta, trailing, actions, muted }: CareRowProps) {
  const visual = visualStateFor(status);
  const Icon = STATE_ICON[visual];
  return (
    <div className={`care-row${muted ? ' care-row-muted' : ''}`}>
      <span key={visual} className={`care-row-icon ${STATE_LABEL_CLASS[visual]}`} aria-hidden="true">
        <Icon width={15} height={15} strokeWidth={2.2} />
      </span>
      <div className="care-row-body">
        <div className="care-row-title-line">
          <span className="care-row-title">{title}</span>
          {trailing}
        </div>
        {meta && <div className="care-row-meta">{meta}</div>}
        {actions && <div className="care-row-actions">{actions}</div>}
      </div>
    </div>
  );
}
