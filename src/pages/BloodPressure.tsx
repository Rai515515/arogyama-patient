import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useStage } from '../store/stage';
import { useT, useFmt } from '../i18n';
import { bpLevel, isPlausibleBp } from '../utils/bp';
import { deliver } from '../services/engine';
import type { BpLevel, BpReading, BpSymptom } from '../domain/types';
import BpChart from '../components/BpChart';
import FactChip from '../components/FactChip';
import CountRibbon from '../components/CountRibbon';
import { PhoneIcon, PinIcon } from '../components/icons';
import { SOURCES } from '../content/sources';
import { mapsSearchLink } from '../services/nearby';

const SYMPTOMS: { key: BpSymptom; label: string }[] = [
  { key: 'HEADACHE', label: 'Severe headache' },
  { key: 'VISION', label: 'Blurred vision or seeing spots' },
  { key: 'RIB_PAIN', label: 'Pain below the ribs' },
  { key: 'SWELLING', label: 'Sudden swelling of face or hands' },
  { key: 'BREATHLESS', label: 'Short of breath' },
  { key: 'FITS', label: 'Fits (seizure)' },
];

export default function BloodPressure() {
  const t = useT();
  const fmt = useFmt();
  const stage = useStage();
  const readings = useStore((s) => s.bpReadings);
  const addBpReading = useStore((s) => s.addBpReading);
  const doctor = useStore((s) => s.user.doctorName);
  const shareBp = useStore((s) => s.privacy.share.bp);
  const pp = stage.stage === 'POSTPARTUM';

  const [sys, setSys] = useState('');
  const [dia, setDia] = useState('');
  const [pulse, setPulse] = useState('');
  const [symptoms, setSymptoms] = useState<BpSymptom[]>([]);
  const [result, setResult] = useState<{ reading: BpReading; level: BpLevel } | null>(null);

  const s = Number(sys);
  const d = Number(dia);
  const valid = isPlausibleBp(s, d);

  const save = () => {
    const reading = addBpReading(s, d, pulse ? Number(pulse) : undefined, symptoms);
    const level = bpLevel(reading);
    setResult({ reading, level });
    setSys('');
    setDia('');
    setPulse('');
    setSymptoms([]);
    if (level !== 'NORMAL') {
      void deliver(
        {
          id: `bp-alert-${reading.id}`,
          kind: 'ALERT',
          sensitive: false,
          title: level === 'SEVERE' ? t('Go to hospital now') : t('Your BP is high'),
          body: level === 'SEVERE' ? t('BP {s}/{d}. Call 108 or go to the nearest hospital.', { s, d }) : t('BP {s}/{d}. Tell your doctor or health centre today.', { s, d }),
          link: '#/bp',
          tone: 'alert',
        },
        { force: true },
      );
    }
  };

  const sorted = [...readings].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <div className="page">
      <header className="page-header">
        <h1>{t('Blood pressure')}</h1>
        {pp ? (
          <>
            <p>{t('Day {d} of 40 after birth. High BP can come back in these weeks, even if you feel well.', { d: stage.ppDay })}</p>
            <CountRibbon value={stage.ppDay} label={t('Day {d} of 40 after birth', { d: stage.ppDay })} />
          </>
        ) : (
          <p>{t('Check at the same time each day, after sitting quietly for 5 minutes.')}</p>
        )}
      </header>

      {result && (
        <div className={`bp-result bp-result-${result.level.toLowerCase()}`} role="alert">
          <div className="bp-result-num">
            {result.reading.systolic}/{result.reading.diastolic}
          </div>
          {result.level === 'NORMAL' && <p>{t('Below 140/90. Keep checking as your doctor advised.')}</p>}
          {result.level === 'HIGH' && <p>{t('This is high (140/90 or more). Tell your doctor or health centre today. Do not change your medicine on your own.')}</p>}
          {result.level === 'SEVERE' && (
            <>
              <p>
                <strong>{t('Go to hospital now.')}</strong> {t('This reading or your symptoms need urgent care, even if you feel fine.')}
              </p>
              <div className="row-gap">
                <a className="btn btn-danger" href="tel:108">
                  <PhoneIcon width={18} height={18} /> {t('Call 108')}
                </a>
                <a className="btn btn-outline" href={mapsSearchLink('hospital')} target="_blank" rel="noreferrer">
                  <PinIcon width={18} height={18} /> {t('Nearest hospital')}
                </a>
              </div>
            </>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => setResult(null)}>
            {t('Close')}
          </button>
        </div>
      )}

      <section className="sheet bp-form">
        <h2 className="sheet-title">{t('Add a reading')}</h2>
        <div className="bp-inputs">
          <div className="field">
            <label htmlFor="sys">{t('Top number')}</label>
            <input id="sys" inputMode="numeric" pattern="[0-9]*" placeholder="120" value={sys} onChange={(e) => setSys(e.target.value.replace(/\D/g, '').slice(0, 3))} />
          </div>
          <span className="bp-slash" aria-hidden="true">
            /
          </span>
          <div className="field">
            <label htmlFor="dia">{t('Bottom number')}</label>
            <input id="dia" inputMode="numeric" pattern="[0-9]*" placeholder="80" value={dia} onChange={(e) => setDia(e.target.value.replace(/\D/g, '').slice(0, 3))} />
          </div>
          <div className="field bp-pulse">
            <label htmlFor="pulse">{t('Pulse')}</label>
            <input id="pulse" inputMode="numeric" pattern="[0-9]*" placeholder="—" value={pulse} onChange={(e) => setPulse(e.target.value.replace(/\D/g, '').slice(0, 3))} />
          </div>
        </div>
        <fieldset className="symptom-set">
          <legend>{t('Do you have any of these now?')}</legend>
          {SYMPTOMS.map((x) => (
            <label key={x.key} className={`symptom${symptoms.includes(x.key) ? ' on' : ''}`}>
              <input
                type="checkbox"
                checked={symptoms.includes(x.key)}
                onChange={(e) => setSymptoms(e.target.checked ? [...symptoms, x.key] : symptoms.filter((k) => k !== x.key))}
              />
              {t(x.label)}
            </label>
          ))}
        </fieldset>
        {sys && dia && !valid && <p className="field-error">{t('Check the numbers. The top number is usually bigger than the bottom one.')}</p>}
        <button className="btn btn-primary btn-block" disabled={!valid} onClick={save}>
          {t('Save reading')}
        </button>
      </section>

      {readings.length >= 2 && (
        <section className="sheet">
          <h2 className="sheet-title">{t('Last two weeks')}</h2>
          <BpChart readings={readings} labels={{ high: t('140/90 line') }} />
          <div className="chart-key">
            <span className="key-top">{t('Top number')}</span>
            <span className="key-bottom">{t('Bottom number')}</span>
          </div>
        </section>
      )}

      <FactChip slot="bp-page" topic="bp" />

      <section className="sheet">
        <h2 className="sheet-title">{t('What the numbers mean')}</h2>
        <dl className="bands">
          <div className="band band-normal">
            <dt>{t('Below 140/90')}</dt>
            <dd>{t('Goal range. Keep logging.')}</dd>
          </div>
          <div className="band band-high">
            <dt>{t('140/90 or more')}</dt>
            <dd>{t('High. Tell your doctor or health centre today.')}</dd>
          </div>
          <div className="band band-severe">
            <dt>{t('160/110 or more, or danger symptoms')}</dt>
            <dd>{t('Emergency. Go to hospital now. Call 108.')}</dd>
          </div>
        </dl>
        <p className="source-line">
          {t('Source')}: <a href={SOURCES.whoPreeclampsia.url}>WHO, 2026</a>; <a href={SOURCES.niceNg133.url}>NICE NG133</a>; <a href={SOURCES.acogUrgent.url}>ACOG</a>
        </p>
      </section>

      <section className="sheet">
        <h2 className="sheet-title">{t('All readings')}</h2>
        {shareBp && <p className="muted small">{t('Shared with {doctor}', { doctor: doctor })}</p>}
        <ul className="reading-list">
          {sorted.map((r) => {
            const lv = bpLevel(r);
            return (
              <li key={r.id}>
                <span className={`reading-num bp-${lv.toLowerCase()}`}>
                  {r.systolic}/{r.diastolic}
                </span>
                <span className="muted small">
                  {fmt.date(r.at, { weekday: 'short', day: 'numeric', month: 'short' })}, {fmt.time(r.at)}
                </span>
                {r.symptoms.length > 0 && <span className="reading-flag">{t('with symptoms')}</span>}
              </li>
            );
          })}
        </ul>
      </section>

      <Link to="/learn/bp" className="link-chip">
        {t('Why the 40 days after birth matter')}
      </Link>
    </div>
  );
}
