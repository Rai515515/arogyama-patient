import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useT, useFmt } from '../i18n';
import CareRow from '../components/CareRow';
import FactChip from '../components/FactChip';
import { ChevronDownIcon } from '../components/icons';
import { computeAdherencePct, medicationEventsToTrackable } from '../utils/adherence';
import { medStatusLabel, frequencyLabel } from '../utils/labels';
import type { MedicationEvent } from '../domain/types';

// i18n-list
const BUCKETS = ['Morning', 'Afternoon', 'Evening'] as const;
// end-i18n-list
const bucketOf = (h: number) => (h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening');

export default function MedicationTracker() {
  const t = useT();
  const fmt = useFmt();
  const medications = useStore((s) => s.medications);
  const medicationEvents = useStore((s) => s.medicationEvents);
  const markMedicationEvent = useStore((s) => s.markMedicationEvent);
  const simulateMissedDose = useStore((s) => s.simulateMissedDose);
  const [openMed, setOpenMed] = useState<string | null>(null);

  const todayEvents = medicationEvents.filter((e) => new Date(e.scheduledFor).toDateString() === new Date().toDateString()).sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));
  const buckets: Record<string, MedicationEvent[]> = { Morning: [], Afternoon: [], Evening: [] };
  for (const e of todayEvents) buckets[bucketOf(new Date(e.scheduledFor).getHours())].push(e);

  const MedRow = ({ event, medName, showDate }: { event: MedicationEvent; medName: string; showDate?: boolean }) => (
    <CareRow
      status={event.status}
      title={showDate ? t(medName) : `${t(medName)}, ${fmt.time(event.scheduledFor)}`}
      meta={
        <>
          {showDate ? `${fmt.date(event.scheduledFor, { weekday: 'short', day: 'numeric', month: 'short' })}, ${fmt.time(event.scheduledFor)}` : t(medStatusLabel(event.status))}
          {event.skipReason && ` — ${t(event.skipReason)}`}
        </>
      }
      actions={
        event.status === 'DUE' || event.status === 'UPCOMING' ? (
          <>
            <button className="btn btn-primary btn-sm" onClick={() => markMedicationEvent(event.id, 'TAKEN')}>
              {t('I took it')}
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => markMedicationEvent(event.id, 'DELAYED')}>
              {t('Took it late')}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => markMedicationEvent(event.id, 'SKIPPED')}>
              {t('Skip')}
            </button>
            {event.status === 'DUE' && (
              <button className="btn btn-ghost btn-sm demo-action" onClick={() => simulateMissedDose(event.id)}>
                {t('Simulate missed (demo)')}
              </button>
            )}
          </>
        ) : undefined
      }
    />
  );

  return (
    <div className="page">
      <header className="page-header">
        <h1>{t('Medicines')}</h1>
        <p>{t('You confirm each dose. Arogyama keeps the record.')}</p>
      </header>

      {BUCKETS.map((b) =>
        buckets[b].length === 0 ? null : (
          <div key={b}>
            <div className="agenda-date">{t(b)}</div>
            <div className="sheet">
              <div className="care-list">
                {buckets[b].map((e) => (
                  <MedRow key={e.id} event={e} medName={medications.find((m) => m.id === e.medicationId)?.name ?? 'Medicine'} />
                ))}
              </div>
            </div>
          </div>
        ),
      )}
      {todayEvents.length === 0 && <div className="sheet empty-state">{t('No doses today.')}</div>}

      <FactChip slot="meds" topic="nutrition" />

      <div className="section-head">
        <h2>{t('All medicines')}</h2>
      </div>
      {medications.map((med) => {
        const events = medicationEvents.filter((e) => e.medicationId === med.id).sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));
        const weekPct = computeAdherencePct(medicationEventsToTrackable(events, med.category));
        const open = openMed === med.id;
        return (
          <div className="accordion-item" key={med.id}>
            <button className="accordion-trigger" onClick={() => setOpenMed(open ? null : med.id)} aria-expanded={open}>
              <div>
                <div className="accordion-trigger-title">{t(med.name)}</div>
                <div className="accordion-trigger-summary">
                  {t(med.dosage)}, {t(frequencyLabel(med.frequency))}, {t('{pct}% this week', { pct: weekPct })}
                </div>
              </div>
              <span className={`accordion-chevron${open ? ' open' : ''}`}>
                <ChevronDownIcon width={18} height={18} />
              </span>
            </button>
            {open && (
              <div className="accordion-panel">
                {med.instructions && <p>{t(med.instructions)}</p>}
                <div className="care-list">
                  {events.map((e) => (
                    <MedRow key={e.id} event={e} medName={med.name} showDate />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
