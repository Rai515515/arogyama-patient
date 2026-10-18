import { Link } from 'react-router-dom';
import { useStore, currentWeekKey } from '../store/useStore';
import { useT, useFmt } from '../i18n';
import { computeWeeklyAdherence, buildMissedCareList, computeDailyCompletionForWeek } from '../store/selectors';
import ProgressRing from '../components/ProgressRing';
import CareRow from '../components/CareRow';
import FactChip from '../components/FactChip';
import { ChevronRightIcon } from '../components/icons';

const CATEGORY_LABELS: Record<string, string> = {
  MEDICINE: 'Medicines',
  SUPPLEMENT: 'Supplements',
  SCAN: 'Scans',
  TEST: 'Tests',
  APPOINTMENT: 'Visits',
  CARE_TASK: 'Care tasks',
};

export default function Insights() {
  const t = useT();
  const fmt = useFmt();
  const medications = useStore((s) => s.medications);
  const medicationEvents = useStore((s) => s.medicationEvents);
  const appointments = useStore((s) => s.appointments);
  const investigations = useStore((s) => s.investigations);
  const scans = useStore((s) => s.scans);
  const careTasks = useStore((s) => s.careTasks);

  const adherence = computeWeeklyAdherence(medicationEvents, medications, appointments, investigations, scans, careTasks, currentWeekKey());
  const days = computeDailyCompletionForWeek(medicationEvents, medications, appointments, investigations, scans, careTasks);
  const missed = buildMissedCareList(medicationEvents, medications, appointments, investigations, scans, careTasks);
  const start = new Date();
  start.setDate(start.getDate() - start.getDay());

  return (
    <div className="page">
      <header className="page-header">
        <h1>{t('This week')}</h1>
        <p>{t('How much of your plan got done. No judgement — just the picture.')}</p>
      </header>

      <div className="today-hero">
        <ProgressRing pct={adherence.overallPct} size={92} strokeWidth={9} label={`${adherence.overallPct}%`} tone="sage" />
        <div className="today-hero-body">
          <div className="today-hero-headline">{t('{done} of {total} confirmed', { done: adherence.completedCount, total: adherence.totalCount })}</div>
          <div className="today-hero-sub">{t('{n} missed', { n: adherence.missedCount })}</div>
        </div>
      </div>

      <section className="sheet">
        <h2 className="sheet-title">{t('Day by day')}</h2>
        <div className="week-dot-row">
          {days.map((day, idx) => {
            const d = new Date(start);
            d.setDate(d.getDate() + idx);
            return (
              <div className="week-dot-col" key={idx}>
                <div
                  className={`week-dot${day.isToday ? ' is-today' : ''}`}
                  style={{ background: day.pct === null ? undefined : day.pct >= 100 ? 'var(--neem)' : day.pct >= 50 ? 'var(--neem-tint)' : 'var(--kumkum-tint)' }}
                  title={day.pct === null ? t('Nothing planned') : `${day.pct}%`}
                />
                <span className="week-dot-label">{fmt.weekday(d)}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="sheet">
        <h2 className="sheet-title">{t('By type')}</h2>
        {Object.entries(adherence.byCategory).map(([cat, pct]) => (
          <div key={cat} className="category-bar-row">
            <div className="category-bar-head">
              <span className="soft">{t(CATEGORY_LABELS[cat] ?? cat)}</span>
              <strong>{pct}%</strong>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </section>

      <FactChip slot="insights" kinds={['motivation']} />

      <section className="sheet">
        <h2 className="sheet-title">{t('Missed care')}</h2>
        {missed.length === 0 && <div className="empty-state">{t('Nothing missed recently.')}</div>}
        <div className="care-list">
          {missed.map((m) => (
            <CareRow key={m.id} status="MISSED" title={t(m.title)} meta={`${fmt.date(m.scheduledFor)} — ${t(m.supportiveNote)}`} />
          ))}
        </div>
      </section>

      <Link to="/escalation-demo" className="link-chip">
        {t('How missed care is followed up (demo)')} <ChevronRightIcon width={13} height={13} />
      </Link>
    </div>
  );
}
