import { useStore, ESCALATION_DEMO_TARGET_ID, ESCALATION_DEMO_LABEL } from '../store/useStore';
import { useT, useFmt } from '../i18n';
import type { EscalationStage } from '../domain/types';
import { BellIcon } from '../components/icons';

const STAGES: { key: EscalationStage; label: string; description: string }[] = [
  { key: 'REMINDER_SENT', label: 'Missed', description: 'A scheduled dose passed without confirmation.' },
  { key: 'AWAITING_CONFIRMATION', label: 'Noticed', description: 'No "I took it" received yet.' },
  { key: 'FOLLOW_UP_SENT', label: 'Gentle reminder', description: 'A second reminder is sent.' },
  { key: 'STILL_MISSED', label: 'Still missed', description: 'Still not confirmed after the reminder.' },
  { key: 'CAREGIVER_NOTIFIED', label: 'Family told (demo)', description: 'The contact she chose would be told.' },
];

export default function EscalationDemo() {
  const t = useT();
  const fmt = useFmt();
  const escalations = useStore((s) => s.escalations);
  const caregivers = useStore((s) => s.caregivers);
  const notificationLog = useStore((s) => s.notificationLog);
  const advance = useStore((s) => s.advanceEscalationDemo);
  const reset = useStore((s) => s.resetEscalationDemo);

  const rule = escalations.find((r) => r.targetId === ESCALATION_DEMO_TARGET_ID);
  const currentIdx = rule ? STAGES.findIndex((s) => s.key === rule.stage) : -1;
  const isComplete = rule?.stage === 'CAREGIVER_NOTIFIED';
  const contact = caregivers.find((c) => c.notifyOnEscalation);

  return (
    <div className="page">
      <header className="page-header">
        <div className="title-row">
          <h1>{t('When a dose is missed')}</h1>
          <span className="badge-demo">{t('Demo')}</span>
        </div>
        <p>{t('Step by step, what happens when prescribed care is not confirmed.')}</p>
      </header>

      <section className="sheet">
        <strong>{ESCALATION_DEMO_LABEL}</strong>
        <p className="muted small">{t('Simulated — nothing here contacts anyone.')}</p>
        <ol className="escalation-track">
          {STAGES.map((stage, idx) => {
            const reached = idx <= currentIdx;
            const at = rule?.history.find((h) => h.stage === stage.key)?.at;
            return (
              <li key={stage.key} className={`escalation-step${reached ? ' reached' : ''}${idx === currentIdx ? ' current' : ''}`}>
                <div className="step-marker">{idx + 1}</div>
                <div>
                  <div className="step-title">{t(stage.label)}</div>
                  <div className="muted small">{t(stage.description)}</div>
                  {reached && at && <div className="muted small">{fmt.time(at)}</div>}
                </div>
              </li>
            );
          })}
        </ol>
        <div className="row-gap">
          <button className="btn btn-primary" onClick={advance} disabled={isComplete}>
            {!rule ? t('Start walkthrough') : isComplete ? t('Complete') : t('Next step')}
          </button>
          <button className="btn btn-outline" onClick={reset} disabled={!rule}>
            {t('Reset')}
          </button>
        </div>
        {isComplete && <p className="callout callout-demo">{t('In a live system, {name} would now be told that this dose is still not confirmed.', { name: contact ? contact.name : t('your contact') })}</p>}
      </section>

      <section className="sheet">
        <h2 className="sheet-title">{t('Event log')}</h2>
        {notificationLog.length === 0 && <div className="empty-state">{t('No events yet.')}</div>}
        <div className="care-list">
          {notificationLog.map((n) => (
            <div className="care-row" key={n.id}>
              <span className="care-row-icon state-due" aria-hidden="true">
                <BellIcon width={14} height={14} strokeWidth={2.2} />
              </span>
              <div className="care-row-body">
                <div className="care-row-title">{n.message}</div>
                <div className="care-row-meta">{fmt.time(n.at)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
