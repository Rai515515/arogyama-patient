import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useT, useFmt } from '../i18n';
import { permissionState, requestPermission, type PermissionState } from '../services/systemNotify';
import { sendTestNotification } from '../services/engine';
import { BellIcon } from '../components/icons';

// i18n-list
const KIND_LABEL: Record<string, string> = {
  REMINDER: 'Reminder',
  FACT: 'Did you know?',
  NEWS: "What's new",
  MOTIVATION: 'For you today',
  ALERT: 'Alert',
  SYSTEM: 'App',
};
// end-i18n-list

export default function Inbox() {
  const t = useT();
  const fmt = useFmt();
  const inbox = useStore((s) => s.inbox);
  const markInboxRead = useStore((s) => s.markInboxRead);
  const [perm, setPerm] = useState<PermissionState>(permissionState());

  useEffect(() => {
    const id = setTimeout(() => markInboxRead(), 1500);
    return () => clearTimeout(id);
  }, [markInboxRead]);

  return (
    <div className="page">
      <header className="page-header">
        <h1>{t('Notifications')}</h1>
        <p>{t('Everything Arogyama has sent you, newest first.')}</p>
      </header>

      {perm !== 'granted' && (
        <div className="notice">
          <BellIcon width={20} height={20} />
          <div>
            <strong>{perm === 'denied' ? t('Phone notifications are blocked') : t('Phone notifications are off')}</strong>
            <p className="soft small">
              {perm === 'denied'
                ? t('Allow notifications for this site in your browser settings. Until then they appear here and as banners inside the app.')
                : perm === 'unsupported'
                  ? t('On iPhone: tap Share, then "Add to Home Screen", and open Arogyama from there to allow notifications.')
                  : t('Turn them on to get medicine and vaccine reminders on your phone.')}
            </p>
            {perm === 'default' && (
              <button className="btn btn-primary btn-sm" onClick={async () => setPerm(await requestPermission())}>
                {t('Turn on notifications')}
              </button>
            )}
          </div>
        </div>
      )}

      <button className="btn btn-outline btn-sm test-btn" onClick={() => void sendTestNotification()}>
        {t('Send a test notification')}
      </button>

      {inbox.length === 0 ? (
        <div className="empty-state">{t('Nothing yet. Reminders, facts and news will collect here.')}</div>
      ) : (
        <ul className="inbox-list">
          {inbox.map((n) => (
            <li key={n.id} className={`inbox-item inbox-${n.kind.toLowerCase()}${n.read ? '' : ' unread'}`}>
              <Link to={n.link ? n.link.replace(/^#/, '') : '/home'}>
                <span className="inbox-kind">
                  {t(KIND_LABEL[n.kind])} <span className="muted">{fmt.date(n.at, { day: 'numeric', month: 'short' })}, {fmt.time(n.at)}</span>
                </span>
                <span className="inbox-title">{n.title}</span>
                <span className="inbox-body">{n.body}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
