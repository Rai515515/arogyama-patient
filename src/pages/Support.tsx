import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useT, useFmt } from '../i18n';
import { epdsBand } from '../content/epds';
import { findNearby, getPosition, mapsSearchLink, type Place } from '../services/nearby';
import type { CounsellingKind, CounsellingRequest } from '../domain/types';
import QuickExit from '../components/QuickExit';
import FactChip from '../components/FactChip';
import { PhoneIcon, PinIcon, ChevronRightIcon, LockIcon } from '../components/icons';
import { SOURCES } from '../content/sources';

const KINDS: { key: CounsellingKind; label: string; hint: string }[] = [
  { key: 'MENTAL_HEALTH', label: 'Talk to a counsellor or psychiatrist', hint: 'For low mood, worry, sleep trouble, or feeling overwhelmed.' },
  { key: 'COUPLE', label: 'Couple counselling', hint: 'For both of you: baby care, family pressure, money, intimacy, planning.' },
  { key: 'BREASTFEEDING', label: 'Breastfeeding help', hint: 'Latching, pain, low milk worries.' },
  { key: 'FAMILY_PLANNING', label: 'Contraception and spacing', hint: 'Copper-T after birth and other choices.' },
];

// i18n-list
const COUPLE_TOPICS = ['Talking to each other', 'Sharing baby care', 'Money worries', 'Pressure from family', 'Intimacy after birth', 'Spacing the next child'];
// end-i18n-list

export default function Support() {
  const t = useT();
  const fmt = useFmt();
  const moodChecks = useStore((s) => s.moodChecks);
  const counselling = useStore((s) => s.counselling);
  const requestCounselling = useStore((s) => s.requestCounselling);
  const clinic = useStore((s) => s.user.clinicName);
  const ppiucd = useStore((s) => s.ppiucd);

  const [kind, setKind] = useState<CounsellingKind | null>(null);
  const [mode, setMode] = useState<CounsellingRequest['mode']>('IN_PERSON');
  const [time, setTime] = useState<CounsellingRequest['preferredTime']>('MORNING');
  const [partner, setPartner] = useState(true);
  const [topics, setTopics] = useState<string[]>([]);
  const [sent, setSent] = useState(false);

  const [places, setPlaces] = useState<Place[] | null>(null);
  const [pos, setPos] = useState<{ lat: number; lon: number } | null>(null);
  const [nearState, setNearState] = useState<'idle' | 'locating' | 'searching' | 'error' | 'denied'>('idle');

  const last = [...moodChecks].sort((a, b) => b.at.localeCompare(a.at))[0];
  const lastBand = last ? epdsBand(last.score, last.item10) : null;

  const findNear = async () => {
    setNearState('locating');
    try {
      const g = await getPosition();
      const here = { lat: g.coords.latitude, lon: g.coords.longitude };
      setPos(here);
      setNearState('searching');
      const list = await findNearby(here.lat, here.lon);
      setPlaces(list);
      setNearState('idle');
    } catch (e) {
      const denied = typeof e === 'object' && e !== null && 'code' in e && (e as { code: number }).code === 1;
      setNearState(denied ? 'denied' : 'error');
    }
  };

  const submit = () => {
    if (!kind) return;
    requestCounselling({ kind, mode, preferredTime: time, partnerJoining: kind === 'COUPLE' ? partner : false, topics });
    setSent(true);
    setTimeout(() => {
      setKind(null);
      setSent(false);
      setTopics([]);
    }, 2600);
  };

  return (
    <div className="page support">
      <header className="page-header with-action">
        <div>
          <h1>{t('Support')}</h1>
          <p>
            <LockIcon width={14} height={14} /> {t('Private. Nothing here shows on your home screen or in notifications.')}
          </p>
        </div>
        <QuickExit />
      </header>

      <section className="call-strip" aria-label={t('Talk to someone now')}>
        <a href="tel:14416" className="call">
          <PhoneIcon width={18} height={18} />
          <span>
            <strong>14416</strong>
            <span>{t('Tele-MANAS, free, 24x7')}</span>
          </span>
        </a>
        <a href="tel:181" className="call">
          <PhoneIcon width={18} height={18} />
          <span>
            <strong>181</strong>
            <span>{t('Women Helpline')}</span>
          </span>
        </a>
        <a href="tel:108" className="call call-urgent">
          <PhoneIcon width={18} height={18} />
          <span>
            <strong>108</strong>
            <span>{t('Emergency')}</span>
          </span>
        </a>
      </section>

      {/* ---- Mood check ------------------------------------------------------ */}
      <section className="sheet">
        <h2 className="sheet-title">{t('Mood check')}</h2>
        <p className="soft">{t('Ten short questions about the last 7 days. About 3 minutes. The answers stay on this phone unless you share them.')}</p>
        {last && (
          <p className={`mood-last mood-${lastBand}`}>
            {t('Last check: {date}', { date: fmt.date(last.at, { day: 'numeric', month: 'short' }) })} —{' '}
            {lastBand === 'low' ? t('no signs of depression') : lastBand === 'possible' ? t('worth talking to someone') : t('please get support now')}
          </p>
        )}
        <Link to="/support/mood" className="btn btn-primary">
          {last ? t('Check again') : t('Start mood check')}
        </Link>
      </section>

      <FactChip slot="support-1" topic="mind" />

      {/* ---- Counselling ------------------------------------------------------ */}
      <section className="sheet">
        <h2 className="sheet-title">{t('Ask for counselling')}</h2>
        <p className="soft">{t('Your request goes to {clinic}. They will call you to fix a time.', { clinic: t(clinic) })}</p>
        <div className="kind-list">
          {KINDS.map((k) => (
            <button key={k.key} className={`kind${kind === k.key ? ' selected' : ''}`} onClick={() => setKind(kind === k.key ? null : k.key)} aria-pressed={kind === k.key}>
              <span className="kind-label">{t(k.label)}</span>
              <span className="kind-hint">{t(k.hint)}</span>
            </button>
          ))}
        </div>

        {kind && !sent && (
          <div className="request-form">
            <div className="field-label">{t('How?')}</div>
            <div className="segmented">
              <button className={mode === 'IN_PERSON' ? 'active' : undefined} onClick={() => setMode('IN_PERSON')}>
                {t('In person')}
              </button>
              <button className={mode === 'PHONE' ? 'active' : undefined} onClick={() => setMode('PHONE')}>
                {t('Phone call')}
              </button>
            </div>
            <div className="field-label">{t('Best time')}</div>
            <div className="segmented">
              {(['MORNING', 'AFTERNOON', 'EVENING'] as const).map((x) => (
                <button key={x} className={time === x ? 'active' : undefined} onClick={() => setTime(x)}>
                  {t(x === 'MORNING' ? 'Morning' : x === 'AFTERNOON' ? 'Afternoon' : 'Evening')}
                </button>
              ))}
            </div>
            {kind === 'COUPLE' && (
              <>
                <label className="toggle-row">
                  <input type="checkbox" checked={partner} onChange={(e) => setPartner(e.target.checked)} />
                  <span>{t('My partner will join')}</span>
                </label>
                <div className="field-label">{t('What would you like to talk about? (optional)')}</div>
                <div className="chip-row wrap">
                  {COUPLE_TOPICS.map((x) => (
                    <button key={x} className={`chip${topics.includes(x) ? ' active' : ''}`} onClick={() => setTopics(topics.includes(x) ? topics.filter((y) => y !== x) : [...topics, x])}>
                      {t(x)}
                    </button>
                  ))}
                </div>
              </>
            )}
            <button className="btn btn-primary btn-block" onClick={submit}>
              {t('Send request')}
            </button>
          </div>
        )}
        {sent && <p className="ok-line">{t('Request sent. The centre will call you.')}</p>}

        {counselling.length > 0 && (
          <ul className="request-list">
            {[...counselling].reverse().map((c) => (
              <li key={c.id}>
                <span>{t(KINDS.find((k) => k.key === c.kind)?.label ?? '')}</span>
                <span className="muted small">
                  {fmt.date(c.at, { day: 'numeric', month: 'short' })} — {t(c.status === 'REQUESTED' ? 'Waiting for a call' : 'Confirmed')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---- Near me --------------------------------------------------------- */}
      <section className="sheet">
        <h2 className="sheet-title">{t('Counsellors and health centres near you')}</h2>
        <p className="soft">{t('Real places from OpenStreetMap. Your location is used only for this search and is not saved.')}</p>
        {nearState === 'idle' && !places && (
          <button className="btn btn-secondary" onClick={findNear}>
            <PinIcon width={18} height={18} /> {t('Find near me')}
          </button>
        )}
        {(nearState === 'locating' || nearState === 'searching') && <p className="muted">{nearState === 'locating' ? t('Finding your location…') : t('Searching nearby…')}</p>}
        {nearState === 'denied' && <p className="field-hint">{t('Location is off. Use the map links below instead.')}</p>}
        {nearState === 'error' && <p className="field-hint">{t('Could not reach the map service. Use the map links below instead.')}</p>}
        {places && places.length === 0 && <p className="muted">{t('Nothing listed within 8 km. Try the map links below.')}</p>}
        {places && places.length > 0 && (
          <ul className="place-list">
            {places.slice(0, 10).map((pl) => (
              <li key={pl.id}>
                <div>
                  <div className="place-name">{pl.name}</div>
                  <div className="muted small">
                    {pl.distanceKm.toFixed(1)} km{pl.mentalHealth ? ` — ${t('mental health')}` : ''}
                    {pl.address ? ` — ${pl.address}` : ''}
                  </div>
                </div>
                <div className="place-actions">
                  {pl.phone && (
                    <a className="icon-btn" href={`tel:${pl.phone.split(';')[0].replace(/\s/g, '')}`} aria-label={t('Call')}>
                      <PhoneIcon width={18} height={18} />
                    </a>
                  )}
                  <a className="icon-btn" href={`https://www.google.com/maps/search/?api=1&query=${pl.lat},${pl.lon}`} target="_blank" rel="noreferrer" aria-label={t('Map')}>
                    <PinIcon width={18} height={18} />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="map-links">
          <a href={mapsSearchLink('psychiatrist', pos?.lat, pos?.lon)} target="_blank" rel="noreferrer">
            {t('Psychiatrists on the map')}
          </a>
          <a href={mapsSearchLink('counselling centre', pos?.lat, pos?.lon)} target="_blank" rel="noreferrer">
            {t('Counselling centres on the map')}
          </a>
          <a href={mapsSearchLink('primary health centre', pos?.lat, pos?.lon)} target="_blank" rel="noreferrer">
            {t('Government health centres on the map')}
          </a>
        </div>
      </section>

      {/* ---- Private choices -------------------------------------------------- */}
      <Link to="/choices" className="support-row">
        <LockIcon width={20} height={20} />
        <span>
          <strong>{t('My contraception choice')}</strong>
          <span className="soft small">{ppiucd.decision === 'UNDECIDED' ? t('Not decided yet') : t('Saved privately')}</span>
        </span>
        <ChevronRightIcon width={18} height={18} />
      </Link>

      <Link to="/learn/couple" className="support-row">
        <span className="dot" aria-hidden="true" />
        <span>
          <strong>{t('Feeling unsafe at home?')}</strong>
          <span className="soft small">{t('Women Helpline 181 is free. You can also tell your doctor privately.')}</span>
        </span>
        <ChevronRightIcon width={18} height={18} />
      </Link>

      <p className="source-line">
        {t('Source')}: <a href={SOURCES.teleManas.url}>Tele-MANAS, MoHFW</a>; <a href={SOURCES.whl181.url}>WHL 181, MWCD</a>
      </p>
    </div>
  );
}
