import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useT, useFmt } from '../i18n';
import StatusBadge from '../components/StatusBadge';
import FactChip from '../components/FactChip';
import { downloadIcs } from '../utils/ics';
import { medStatusLabel } from '../utils/labels';
import { ArrowLeftIcon, CalendarPlusIcon, CheckIcon, UploadIcon } from '../components/icons';

export default function EventDetail() {
  const { category, id } = useParams<{ category: string; id: string }>();
  const navigate = useNavigate();
  const t = useT();
  const appointments = useStore((s) => s.appointments);
  const investigations = useStore((s) => s.investigations);
  const scans = useStore((s) => s.scans);
  const careTasks = useStore((s) => s.careTasks);
  const markAppointmentAttended = useStore((s) => s.markAppointmentAttended);
  const markInvestigationCompleted = useStore((s) => s.markInvestigationCompleted);
  const markScanCompleted = useStore((s) => s.markScanCompleted);
  const markCareTaskDone = useStore((s) => s.markCareTaskDone);
  const [uploaded, setUploaded] = useState(false);

  const common = { uploaded, setUploaded, onBack: () => navigate(-1) };

  if (category === 'appointment') {
    const item = appointments.find((a) => a.id === id);
    if (!item) return <NotFound />;
    return (
      <DetailShell
        {...common}
        title={item.title}
        subtitle={item.clinicianName}
        location={item.location}
        scheduledFor={item.scheduledFor}
        status={item.status}
        importance={item.importance}
        prepChecklist={item.prepChecklist}
        showReportUpload={false}
        onMarkDone={() => markAppointmentAttended(item.id)}
        done={item.status === 'ATTENDED'}
        doneLabel="Mark as attended"
        doneText="Attended"
        factTopic={item.id.startsWith('pnc') ? 'postnatal' : item.id === 'appt-pmsma' ? 'scheme' : undefined}
      />
    );
  }
  if (category === 'investigation') {
    const item = investigations.find((i) => i.id === id);
    if (!item) return <NotFound />;
    return (
      <DetailShell
        {...common}
        title={item.title}
        subtitle="Test"
        location={item.location}
        scheduledFor={item.scheduledFor}
        status={item.status}
        importance={item.importance}
// i18n-list
        prepChecklist={['Bring your ID and prescription slip', 'Follow any fasting instructions given by your clinic']}
// end-i18n-list
        showReportUpload
        uploaded={uploaded || Boolean(item.reportUploaded)}
        onMarkDone={() => markInvestigationCompleted(item.id)}
        done={item.status === 'COMPLETED'}
        doneLabel="Mark as completed"
        doneText="Completed"
      />
    );
  }
  if (category === 'scan') {
    const item = scans.find((s) => s.id === id);
    if (!item) return <NotFound />;
    return (
      <DetailShell
        {...common}
        title={item.title}
        subtitle="Scan"
        location={item.location}
        scheduledFor={item.scheduledFor}
        status={item.status}
        importance={item.importance}
        prepChecklist={item.prepChecklist}
        showReportUpload
        uploaded={uploaded || Boolean(item.reportUploaded)}
        onMarkDone={() => markScanCompleted(item.id)}
        done={item.status === 'COMPLETED'}
        doneLabel="Mark as completed"
        doneText="Completed"
      />
    );
  }
  if (category === 'task') {
    const item = careTasks.find((x) => x.id === id);
    if (!item) return <NotFound />;
    return (
      <DetailShell
        {...common}
        title={item.title}
        subtitle={item.description}
        location="At home"
        scheduledFor={item.scheduledFor}
        status={item.status}
        importance={item.importance}
        prepChecklist={[]}
        showReportUpload={false}
        onMarkDone={() => markCareTaskDone(item.id)}
        done={item.status === 'DONE'}
        doneLabel="Mark as done"
        doneText="Done"
      />
    );
  }
  return <NotFound />;

  function NotFound() {
    return (
      <div className="page">
        <div className="empty-state">{t('Item not found.')}</div>
        <Link to="/schedule" className="link-chip">
          {t('Back to schedule')}
        </Link>
      </div>
    );
  }
}

interface DetailShellProps {
  title: string;
  subtitle: string;
  location: string;
  scheduledFor: string;
  status: string;
  importance: 'ROUTINE' | 'IMPORTANT' | 'CRITICAL';
  prepChecklist: string[];
  showReportUpload: boolean;
  uploaded: boolean;
  setUploaded: (v: boolean) => void;
  onMarkDone: () => void;
  done: boolean;
  doneLabel: string;
  doneText: string;
  onBack: () => void;
  factTopic?: 'postnatal' | 'scheme';
}

function DetailShell(props: DetailShellProps) {
  const t = useT();
  const fmt = useFmt();
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  return (
    <div className="page">
      <button className="back-button" onClick={props.onBack}>
        <ArrowLeftIcon width={16} height={16} /> {t('Back')}
      </button>

      <header className="page-header">
        <div className="title-row">
          <h1>{t(props.title)}</h1>
          <StatusBadge status={props.status} label={t(medStatusLabel(props.status))} />
        </div>
        <p>{t(props.subtitle)}</p>
        {props.importance !== 'ROUTINE' && <span className={`badge-${props.importance.toLowerCase()}`}>{t(props.importance === 'CRITICAL' ? 'Do not miss' : 'Important')}</span>}
      </header>

      <dl className="facts-grid">
        <div>
          <dt>{t('When')}</dt>
          <dd>
            {fmt.date(props.scheduledFor, { weekday: 'short', day: 'numeric', month: 'short' })}, {fmt.time(props.scheduledFor)}
          </dd>
        </div>
        <div>
          <dt>{t('Where')}</dt>
          <dd>{t(props.location)}</dd>
        </div>
      </dl>

      {props.prepChecklist.length > 0 && (
        <section className="sheet">
          <h2 className="sheet-title">{t('Before you go')}</h2>
          {props.prepChecklist.map((item, idx) => (
            <label className="checkbox-row" key={idx}>
              <input type="checkbox" checked={Boolean(checked[idx])} onChange={() => setChecked((c) => ({ ...c, [idx]: !c[idx] }))} />
              <span>{t(item)}</span>
            </label>
          ))}
        </section>
      )}

      {props.factTopic && <FactChip slot={`event-${props.title}`} topic={props.factTopic} />}

      {props.showReportUpload && (
        <section className="sheet">
          <h2 className="sheet-title">{t('Report')}</h2>
          <p className="muted small">{t('Prototype — no file is uploaded or stored.')}</p>
          {props.uploaded ? (
            <p className="ok-line">
              <CheckIcon width={16} height={16} /> {t('Report marked as uploaded.')}
            </p>
          ) : (
            <button className="btn btn-outline btn-sm" onClick={() => props.setUploaded(true)}>
              <UploadIcon width={16} height={16} /> {t('Upload report (prototype)')}
            </button>
          )}
        </section>
      )}

      <div className="row-gap">
        <button className="btn btn-primary" disabled={props.done} onClick={props.onMarkDone}>
          {props.done ? t(props.doneText) : t(props.doneLabel)}
        </button>
        <button className="btn btn-outline" onClick={() => downloadIcs(t(props.title), t(props.subtitle), t(props.location), props.scheduledFor)}>
          <CalendarPlusIcon width={16} height={16} /> {t('Add to calendar')}
        </button>
      </div>
    </div>
  );
}
