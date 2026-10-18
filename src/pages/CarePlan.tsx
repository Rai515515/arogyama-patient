import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useStage } from '../store/stage';
import { useT, useFmt } from '../i18n';
import CareRow from '../components/CareRow';
import FactChip from '../components/FactChip';
import { visualStateFor } from '../components/statusVisual';
import { ChevronRightIcon, GaugeIcon } from '../components/icons';
import type { CarePlanCategory } from '../domain/types';
import { medStatusLabel } from '../utils/labels';

type FilterCat = CarePlanCategory | 'ALL';

interface UnifiedItem {
  id: string;
  category: CarePlanCategory;
  title: string;
  detail?: string;
  scheduledFor: string;
  status: string;
  linkCategory: string;
}

const CATEGORY_OPTIONS: { key: FilterCat; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'MEDICINE', label: 'Medicines' },
  { key: 'SUPPLEMENT', label: 'Supplements' },
  { key: 'APPOINTMENT', label: 'Visits' },
  { key: 'TEST', label: 'Tests' },
  { key: 'SCAN', label: 'Scans' },
  { key: 'CARE_TASK', label: 'Care tasks' },
];

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

export default function CarePlan() {
  const t = useT();
  const fmt = useFmt();
  const stage = useStage();
  const medications = useStore((s) => s.medications);
  const medicationEvents = useStore((s) => s.medicationEvents);
  const appointments = useStore((s) => s.appointments);
  const investigations = useStore((s) => s.investigations);
  const scans = useStore((s) => s.scans);
  const careTasks = useStore((s) => s.careTasks);
  const [filter, setFilter] = useState<FilterCat>('ALL');
  const [showPast, setShowPast] = useState(false);

  const items: UnifiedItem[] = useMemo(() => {
    const list: UnifiedItem[] = [];
    for (const e of medicationEvents) {
      const med = medications.find((m) => m.id === e.medicationId);
      list.push({ id: e.id, category: med?.category ?? 'MEDICINE', title: med?.name ?? 'Medicine', detail: med?.dosage, scheduledFor: e.scheduledFor, status: e.status, linkCategory: 'medication' });
    }
    for (const a of appointments) list.push({ id: a.id, category: 'APPOINTMENT', title: a.title, scheduledFor: a.scheduledFor, status: a.status, linkCategory: 'appointment' });
    for (const i of investigations) list.push({ id: i.id, category: 'TEST', title: i.title, scheduledFor: i.scheduledFor, status: i.status, linkCategory: 'investigation' });
    for (const s of scans) list.push({ id: s.id, category: 'SCAN', title: s.title, scheduledFor: s.scheduledFor, status: s.status, linkCategory: 'scan' });
    for (const x of careTasks) list.push({ id: x.id, category: 'CARE_TASK', title: x.title, scheduledFor: x.scheduledFor, status: x.status, linkCategory: 'task' });
    return list.sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));
  }, [medications, medicationEvents, appointments, investigations, scans, careTasks]);

  const filtered = filter === 'ALL' ? items : items.filter((i) => i.category === filter);
  const now = new Date();
  const today = filtered.filter((i) => sameDay(new Date(i.scheduledFor), now));
  const upcoming = filtered.filter((i) => new Date(i.scheduledFor) > now && !sameDay(new Date(i.scheduledFor), now));
  const past = filtered.filter((i) => new Date(i.scheduledFor) < now && !sameDay(new Date(i.scheduledFor), now)).reverse();

  const byDay = new Map<string, UnifiedItem[]>();
  for (const i of upcoming) {
    const k = new Date(i.scheduledFor).toDateString();
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k)!.push(i);
  }
  const tmr = new Date();
  tmr.setDate(tmr.getDate() + 1);

  const Row = ({ item, muted }: { item: UnifiedItem; muted?: boolean }) => {
    const row = (
      <CareRow
        status={item.status}
        title={t(item.title)}
        muted={muted}
        meta={`${fmt.date(item.scheduledFor)}, ${fmt.time(item.scheduledFor)}${item.detail ? `, ${t(item.detail)}` : ''}`}
        trailing={visualStateFor(item.status) !== 'upcoming' ? <span className={`chip-status state-${visualStateFor(item.status)}`}>{t(medStatusLabel(item.status))}</span> : undefined}
      />
    );
    if (item.linkCategory === 'medication') return row;
    return (
      <Link to={`/event/${item.linkCategory}/${item.id}`} className="care-row-link">
        {row}
      </Link>
    );
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>{t('Your care plan')}</h1>
        <p>{stage.stage === 'POSTPARTUM' ? t('Everything prescribed for you after birth, in one timeline.') : t('Everything prescribed for your pregnancy, in one timeline.')}</p>
      </header>

      <div className="quick-links">
        <Link to="/bp" className="quick-link">
          <GaugeIcon width={18} height={18} /> {t('Blood pressure')}
        </Link>
        <Link to="/medications" className="quick-link">
          {t('Medicine tracker')} <ChevronRightIcon width={14} height={14} />
        </Link>
      </div>

      <div className="chip-row">
        {CATEGORY_OPTIONS.map((c) => (
          <button key={c.key} className={`chip${filter === c.key ? ' active' : ''}`} aria-pressed={filter === c.key} onClick={() => setFilter(c.key)}>
            {t(c.label)}
          </button>
        ))}
      </div>

      <div className="section-head">
        <h2>{t('Today')}</h2>
      </div>
      <div className="sheet">
        {today.length === 0 && <div className="empty-state">{t('Nothing today in this category.')}</div>}
        <div className="care-list">
          {today.map((item) => (
            <Row key={item.id} item={item} />
          ))}
        </div>
      </div>

      <FactChip slot="care-1" />

      <div className="section-head">
        <h2>{t('Coming up')}</h2>
      </div>
      {byDay.size === 0 && <div className="sheet empty-state">{t('Nothing else planned yet.')}</div>}
      {Array.from(byDay.entries()).map(([k, list]) => (
        <div key={k}>
          <div className="agenda-date">{k === tmr.toDateString() ? t('Tomorrow') : fmt.date(k, { weekday: 'long', day: 'numeric', month: 'short' })}</div>
          <div className="sheet">
            <div className="care-list">
              {list.map((item) => (
                <Row key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      ))}

      <div className="section-head">
        <h2>{t('Past')}</h2>
        {past.length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={() => setShowPast((v) => !v)}>
            {showPast ? t('Hide') : t('Show ({n})', { n: past.length })}
          </button>
        )}
      </div>
      {showPast && (
        <div className="sheet">
          <div className="care-list">
            {past.map((item) => (
              <Row key={item.id} item={item} muted />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
