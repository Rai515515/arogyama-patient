import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useT, useFmt } from '../i18n';
import CareRow from '../components/CareRow';
import FactChip from '../components/FactChip';
import { visualStateFor } from '../components/statusVisual';
import { medStatusLabel } from '../utils/labels';

interface ScheduleEntry {
  id: string;
  linkCategory: string;
  title: string;
  scheduledFor: string;
  status: string;
  importance: 'ROUTINE' | 'IMPORTANT' | 'CRITICAL';
  typeLabel: string;
}

export default function Schedule() {
  const t = useT();
  const fmt = useFmt();
  const medications = useStore((s) => s.medications);
  const medicationEvents = useStore((s) => s.medicationEvents);
  const appointments = useStore((s) => s.appointments);
  const investigations = useStore((s) => s.investigations);
  const scans = useStore((s) => s.scans);
  const careTasks = useStore((s) => s.careTasks);

  const entries: ScheduleEntry[] = [
    ...medicationEvents.map((e) => {
      const med = medications.find((m) => m.id === e.medicationId);
      return { id: e.id, linkCategory: 'medication', title: med?.name ?? 'Medicine', scheduledFor: e.scheduledFor, status: e.status, importance: 'ROUTINE' as const, typeLabel: med?.category === 'SUPPLEMENT' ? 'Supplement' : 'Medicine' };
    }),
    ...appointments.map((a) => ({ id: a.id, linkCategory: 'appointment', title: a.title, scheduledFor: a.scheduledFor, status: a.status, importance: a.importance, typeLabel: 'Visit' })),
    ...investigations.map((i) => ({ id: i.id, linkCategory: 'investigation', title: i.title, scheduledFor: i.scheduledFor, status: i.status, importance: i.importance, typeLabel: 'Test' })),
    ...scans.map((s) => ({ id: s.id, linkCategory: 'scan', title: s.title, scheduledFor: s.scheduledFor, status: s.status, importance: s.importance, typeLabel: 'Scan' })),
    ...careTasks.map((x) => ({ id: x.id, linkCategory: 'task', title: x.title, scheduledFor: x.scheduledFor, status: x.status, importance: x.importance, typeLabel: 'Care task' })),
  ].sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));

  const map = new Map<string, ScheduleEntry[]>();
  for (const e of entries) {
    const key = new Date(e.scheduledFor).toDateString();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  const grouped = Array.from(map.entries());
  const todayKey = new Date().toDateString();
  const tmr = new Date();
  tmr.setDate(tmr.getDate() + 1);

  return (
    <div className="page">
      <header className="page-header">
        <h1>{t('Schedule')}</h1>
        <p>{t('All planned care, in order.')}</p>
      </header>
      {grouped.map(([dayKey, dayEntries], gi) => (
        <Fragment key={dayKey}>
          <div className="agenda-date">
            {dayKey === todayKey ? t('Today') : dayKey === tmr.toDateString() ? t('Tomorrow') : fmt.date(dayKey, { weekday: 'long', day: 'numeric', month: 'short' })}
          </div>
          <div className="sheet">
            <div className="care-list">
              {dayEntries.map((entry) => {
                const row = (
                  <CareRow
                    key={entry.id}
                    status={entry.status}
                    title={t(entry.title)}
                    meta={`${t(entry.typeLabel)}, ${fmt.time(entry.scheduledFor)}`}
                    trailing={
                      entry.importance !== 'ROUTINE' ? (
                        <span className={`badge-${entry.importance.toLowerCase()}`}>{t(entry.importance === 'CRITICAL' ? 'Do not miss' : 'Important')}</span>
                      ) : visualStateFor(entry.status) !== 'upcoming' ? (
                        <span className={`chip-status state-${visualStateFor(entry.status)}`}>{t(medStatusLabel(entry.status))}</span>
                      ) : undefined
                    }
                  />
                );
                if (entry.linkCategory === 'medication') return row;
                return (
                  <Link key={entry.id} to={`/event/${entry.linkCategory}/${entry.id}`} className="care-row-link">
                    {row}
                  </Link>
                );
              })}
            </div>
          </div>
          {gi === 2 && <FactChip slot="schedule" variant="quiet" />}
        </Fragment>
      ))}
    </div>
  );
}
