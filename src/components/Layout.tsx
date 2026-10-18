import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { HomeIcon, CareIcon, SyringeIcon, SupportIcon, ProfileIcon, BellIcon } from './icons';
import { useT } from '../i18n';
import { useStore } from '../store/useStore';
import { useNotificationEngine } from '../services/engine';
import LangSwitch from './LangSwitch';
import ToastHost from './ToastHost';

const PRIMARY_LINKS = [
  { to: '/home', label: 'Home', Icon: HomeIcon },
  { to: '/care-plan', label: 'Care', Icon: CareIcon },
  { to: '/vaccines', label: 'Vaccines', Icon: SyringeIcon },
  { to: '/support', label: 'Support', Icon: SupportIcon },
  { to: '/me', label: 'Me', Icon: ProfileIcon },
];

export default function Layout() {
  const location = useLocation();
  const t = useT();
  const unread = useStore((s) => s.inbox.filter((i) => !i.read).length);
  useNotificationEngine();

  return (
    <div className="app-shell">
      <div className="app-frame">
        <header className="app-bar">
          <Link to="/home" className="app-bar-brand" aria-label="Arogyama">
            <svg viewBox="0 0 40 40" width="22" height="22" aria-hidden="true">
              <path d="M20 6c7 5 10 11 10 16a10 10 0 0 1-20 0c0-5 3-11 10-16Z" fill="var(--neem)" />
              <path d="M20 14v20" stroke="var(--paper)" strokeWidth="1.8" />
            </svg>
            Arogyama
          </Link>
          <div className="app-bar-actions">
            <LangSwitch compact />
            <Link to="/inbox" className="bell" aria-label={t('Notifications ({n} unread)', { n: unread })}>
              <BellIcon width={21} height={21} />
              {unread > 0 && <span className="bell-count">{unread > 9 ? '9+' : unread}</span>}
            </Link>
          </div>
        </header>

        <ToastHost />

        <main className="main-area" key={location.pathname}>
          <Outlet />
        </main>

        <nav className="bottom-nav" aria-label={t('Main')}>
          {PRIMARY_LINKS.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <span className="nav-icon" aria-hidden="true">
                <Icon />
              </span>
              {t(label)}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
