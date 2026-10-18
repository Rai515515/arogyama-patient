import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useStage } from '../store/stage';
import { useT, useFmt } from '../i18n';
import { permissionState, requestPermission, periodicSyncLikely, type PermissionState } from '../services/systemNotify';
import { sendTestNotification } from '../services/engine';
import { buildIcs, saveIcs } from '../utils/ics';
import LangSwitch from '../components/LangSwitch';
import FactChip from '../components/FactChip';
import { ShieldIcon, CalendarPlusIcon, ChevronRightIcon } from '../components/icons';
import type { PrivacySettings } from '../domain/types';

const SHARE_ROWS: { key: keyof PrivacySettings['share']; label: string; sensitive?: boolean }[] = [
  { key: 'bp', label: 'BP readings' },
  { key: 'medicines', label: 'Medicines taken or missed' },
  { key: 'vaccines', label: 'Vaccines' },
  { key: 'mood', label: 'Mood check results', sensitive: true },
  { key: 'contraception', label: 'Contraception choice', sensitive: true },
  { key: 'counselling', label: 'Counselling requests', sensitive: true },
];

export default function Profile() {
  const t = useT();
  const fmt = useFmt();
  const stage = useStage();
  const user = useStore((s) => s.user);
  const medications = useStore((s) => s.medications);
  const privacy = useStore((s) => s.privacy);
  const updatePrivacy = useStore((s) => s.updatePrivacy);
  const updateShare = useStore((s) => s.updateShare);
  const caregivers = useStore((s) => s.caregivers);
  const prefs = useStore((s) => s.notificationPrefs);
  const updateNotificationPrefs = useStore((s) => s.updateNotificationPrefs);
  const resetAllData = useStore((s) => s.resetAllData);
  const [perm, setPerm] = useState<PermissionState>(permissionState());
  const [newPin, setNewPin] = useState('');
  const [pinSaved, setPinSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const exportMedicineReminders = () => {
    const events = medications.flatMap((m) =>
      m.timesOfDay.map((time) => {
        const [h, mm] = time.split(':').map(Number);
        const start = new Date();
        start.setHours(h, mm, 0, 0);
        if (start.getTime() < Date.now()) start.setDate(start.getDate() + 1);
        return {
          uid: `med-${m.id}-${time}`,
          title: `${t(m.name)} — ${m.dosage}`,
          description: m.instructions ? t(m.instructions) : '',
          start,
          durationMinutes: 10,
          rrule: 'FREQ=DAILY;COUNT=60',
          alarmMinutesBefore: 0,
        };
      }),
    );
    saveIcs('arogyama-medicines.ics', buildIcs(events));
  };

  const exportData = () => {
    const raw = localStorage.getItem('arogyama-storage') ?? '{}';
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arogyama-my-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>{user.name}</h1>
        <p>
          {stage.stage === 'POSTPARTUM'
            ? t('Day {d} after birth', { d: stage.ppDay })
            : t('Week {w}, due {date}', { w: stage.weeks, date: fmt.date(user.dueDate, { day: 'numeric', month: 'short', year: 'numeric' }) })}
        </p>
      </header>

      <dl className="facts-grid">
        <div>
          <dt>{t('Doctor')}</dt>
          <dd>{t(user.doctorName)}</dd>
        </div>
        <div>
          <dt>{t('Hospital number')}</dt>
          <dd>{user.hospitalNo}</dd>
        </div>
        <div className="span2">
          <dt>{t('Health centre')}</dt>
          <dd>{t(user.clinicName)}</dd>
        </div>
      </dl>

      <div className="section-head">
        <h2>{t('Language')}</h2>
      </div>
      <LangSwitch />

      {/* ---- Notifications ---------------------------------------------------- */}
      <div className="section-head">
        <h2>{t('Notifications')}</h2>
      </div>
      <section className="sheet">
        <div className="status-line">
          <span className={`status-dot status-${perm}`} />
          {perm === 'granted'
            ? t('Phone notifications are on.')
            : perm === 'denied'
              ? t('Phone notifications are blocked')
              : perm === 'unsupported'
                ? t('This browser cannot show notifications. Reminders will show inside the app.')
                : t('Phone notifications are off')}
        </div>
        <div className="row-gap">
          {perm === 'default' && (
            <button className="btn btn-primary btn-sm" onClick={async () => setPerm(await requestPermission())}>
              {t('Turn on notifications')}
            </button>
          )}
          <button className="btn btn-outline btn-sm" onClick={() => void sendTestNotification()}>
            {t('Send a test notification')}
          </button>
        </div>
        <label className="toggle-row">
          <input type="checkbox" checked={prefs.remindersEnabled} onChange={(e) => updateNotificationPrefs({ remindersEnabled: e.target.checked })} />
          <span className="setting-title">{t('Reminders, daily fact and news')}</span>
        </label>
        <label className="toggle-row">
          <input type="checkbox" checked={privacy.discreetNotifications} onChange={(e) => updatePrivacy({ discreetNotifications: e.target.checked })} />
          <span>
            <span className="setting-title">{t('Discreet notifications')}</span>
            <span className="soft">{t('Show "You have a care update" instead of medicine names. Useful on a shared phone.')}</span>
          </span>
        </label>
        <div className="explain">
          <p className="small">
            <strong>{t('When the app is closed')}</strong>{' '}
            {periodicSyncLikely()
              ? t('Installed on Android, your phone can still show one daily fact. For medicine alarms that always ring, add them to your phone calendar.')
              : t('For medicine alarms that always ring, add them to your phone calendar.')}
          </p>
          <button className="btn btn-secondary btn-sm" onClick={exportMedicineReminders}>
            <CalendarPlusIcon width={16} height={16} /> {t('Add medicine alarms to my calendar')}
          </button>
        </div>
      </section>

      {/* ---- Privacy ---------------------------------------------------------- */}
      <div className="section-head">
        <h2>
          <ShieldIcon width={18} height={18} /> {t('Privacy')}
        </h2>
      </div>
      <section className="sheet">
        <div className="setting-title">{privacy.pin ? t('PIN is set for private sections') : t('No PIN set')}</div>
        <div className="row-gap pin-row">
          <input
            className="pin-input"
            inputMode="numeric"
            maxLength={4}
            placeholder={privacy.pin ? t('New PIN') : t('4 digits')}
            value={newPin}
            onChange={(e) => {
              setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4));
              setPinSaved(false);
            }}
          />
          <button
            className="btn btn-outline btn-sm"
            disabled={newPin.length !== 4}
            onClick={() => {
              updatePrivacy({ pin: newPin, lockSensitive: true });
              setNewPin('');
              setPinSaved(true);
            }}
          >
            {t('Save PIN')}
          </button>
          {privacy.pin && (
            <button className="btn btn-ghost btn-sm" onClick={() => updatePrivacy({ pin: undefined })}>
              {t('Remove PIN')}
            </button>
          )}
        </div>
        {pinSaved && <p className="ok-line">{t('PIN saved.')}</p>}

        <div className="setting-title share-head">{t('What {doctor} can see', { doctor: t(user.doctorName) })}</div>
        <p className="soft small">{t('Private topics are off until you turn them on.')}</p>
        {SHARE_ROWS.map((r) => (
          <label key={r.key} className="toggle-row compact">
            <input type="checkbox" checked={privacy.share[r.key]} onChange={(e) => updateShare({ [r.key]: e.target.checked })} />
            <span>
              {t(r.label)}
              {r.sensitive && <span className="tag-private">{t('private')}</span>}
            </span>
          </label>
        ))}
      </section>

      <FactChip slot="me-1" kinds={['news']} />

      <div className="section-head">
        <h2>{t('More')}</h2>
      </div>
      <div className="link-list">
        <Link to="/insights">
          {t('How this week went')} <ChevronRightIcon width={16} height={16} />
        </Link>
        <Link to="/medications">
          {t('Medicine tracker')} <ChevronRightIcon width={16} height={16} />
        </Link>
        <Link to="/schedule">
          {t('Full schedule')} <ChevronRightIcon width={16} height={16} />
        </Link>
        <Link to="/learn">
          {t('Learn')} <ChevronRightIcon width={16} height={16} />
        </Link>
        <Link to="/escalation-demo">
          {t('How missed care is followed up (demo)')} <ChevronRightIcon width={16} height={16} />
        </Link>
      </div>

      {caregivers.length > 0 && (
        <p className="muted small">
          {t('Emergency contact')}: {caregivers[0].name}
        </p>
      )}

      <div className="section-head">
        <h2>{t('My data')}</h2>
      </div>
      <section className="sheet">
        <p className="soft small">{t('Your information is stored only on this phone.')}</p>
        <div className="row-gap">
          <button className="btn btn-outline btn-sm" onClick={exportData}>
            {t('Download my data')}
          </button>
          {!confirmReset ? (
            <button className="btn btn-danger-outline btn-sm" onClick={() => setConfirmReset(true)}>
              {t('Reset demo')}
            </button>
          ) : (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                resetAllData();
                setConfirmReset(false);
              }}
            >
              {t('Yes, reset everything')}
            </button>
          )}
        </div>
      </section>

      <p className="callout callout-danger">{t('In an emergency, call 108 or go to the nearest hospital.')}</p>
      <p className="muted small center">{t('Arogyama organises your care. It does not diagnose and does not change medicines.')}</p>
    </div>
  );
}
