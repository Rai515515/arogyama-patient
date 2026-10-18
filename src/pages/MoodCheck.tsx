import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useT, usePick } from '../i18n';
import { EPDS_INTRO, EPDS_ITEMS, epdsBand, type EpdsBand } from '../content/epds';
import { SOURCES } from '../content/sources';
import QuickExit from '../components/QuickExit';
import { PhoneIcon, ArrowLeftIcon } from '../components/icons';

export default function MoodCheck() {
  const t = useT();
  const p = usePick();
  const navigate = useNavigate();
  const saveMoodCheck = useStore((s) => s.saveMoodCheck);
  const shareMood = useStore((s) => s.privacy.share.mood);
  const updateShare = useStore((s) => s.updateShare);
  const doctor = useStore((s) => s.user.doctorName);

  const [i, setI] = useState(-1); // -1 = intro
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{ score: number; band: EpdsBand } | null>(null);

  const choose = (score: number) => {
    const next = [...answers];
    next[i] = score;
    setAnswers(next);
    if (i < EPDS_ITEMS.length - 1) {
      setI(i + 1);
    } else {
      const check = saveMoodCheck(next);
      setResult({ score: check.score, band: epdsBand(check.score, check.item10) });
    }
  };

  if (result) {
    return (
      <div className="page mood">
        <header className="page-header with-action">
          <h1>{t('Your mood check')}</h1>
          <QuickExit />
        </header>
        <div className={`mood-result mood-${result.band}`}>
          {result.band === 'urgent' && (
            <>
              <h2>{t('Please talk to someone today.')}</h2>
              <p>{t('You said thoughts of harming yourself have come to you. You are not alone, and this can get better with help. Call now — it is free and private.')}</p>
              <div className="call-strip">
                <a href="tel:14416" className="call">
                  <PhoneIcon width={18} height={18} />
                  <span>
                    <strong>14416</strong>
                    <span>{t('Tele-MANAS, free, 24x7')}</span>
                  </span>
                </a>
                <a href="tel:108" className="call call-urgent">
                  <PhoneIcon width={18} height={18} />
                  <span>
                    <strong>108</strong>
                    <span>{t('Emergency')}</span>
                  </span>
                </a>
              </div>
              <p className="soft">{t('If you are in danger right now, go to the nearest hospital or ask someone you trust to take you.')}</p>
            </>
          )}
          {result.band === 'possible' && (
            <>
              <h2>{t('It sounds like a hard time.')}</h2>
              <p>{t('Your answers suggest you may have depression. This is common after childbirth and it is treatable. Please talk to your doctor or a counsellor this week.')}</p>
              <Link to="/support" className="btn btn-primary">
                {t('Ask for counselling')}
              </Link>
            </>
          )}
          {result.band === 'low' && (
            <>
              <h2>{t('Thank you for checking in.')}</h2>
              <p>{t("Your answers don't suggest depression right now. Check again in two weeks, or any time you feel low.")}</p>
            </>
          )}
          <p className="muted small">{t('This is a screening check, not a diagnosis. Score {s} of 30.', { s: result.score })}</p>
        </div>

        <section className="sheet">
          <label className="toggle-row">
            <input type="checkbox" checked={shareMood} onChange={(e) => updateShare({ mood: e.target.checked })} />
            <span>
              <span className="setting-title">{t('Let {doctor} see my mood checks', { doctor })}</span>
              <span className="soft">{t('Off by default. You can turn it off again any time.')}</span>
            </span>
          </label>
        </section>

        <button className="btn btn-outline btn-block" onClick={() => navigate('/support')}>
          {t('Back to support')}
        </button>
        <p className="source-line">
          EPDS: {SOURCES.epds.publisher}, {SOURCES.epds.year}.
        </p>
      </div>
    );
  }

  if (i === -1) {
    return (
      <div className="page mood">
        <header className="page-header with-action">
          <h1>{t('Mood check')}</h1>
          <QuickExit />
        </header>
        <p className="mood-intro">{p(EPDS_INTRO)}</p>
        <p className="soft">{t('There are no right or wrong answers. Nobody sees this unless you choose to share it.')}</p>
        <button className="btn btn-primary btn-block" onClick={() => setI(0)}>
          {t('Begin')}
        </button>
        <p className="source-line">
          {t('Questions from the Edinburgh Postnatal Depression Scale')} — {SOURCES.epds.publisher}, {SOURCES.epds.year}.
        </p>
      </div>
    );
  }

  const item = EPDS_ITEMS[i];
  return (
    <div className="page mood">
      <header className="mood-top">
        <button className="back-button" onClick={() => setI(i - 1)}>
          <ArrowLeftIcon width={16} height={16} /> {t('Back')}
        </button>
        <span className="muted small">{t('Question {n} of {total}', { n: i + 1, total: EPDS_ITEMS.length })}</span>
        <QuickExit />
      </header>
      <div className="mood-progress" aria-hidden="true">
        <span style={{ width: `${((i + 1) / EPDS_ITEMS.length) * 100}%` }} />
      </div>
      <p className="mood-lead">{t('In the past 7 days…')}</p>
      <h2 className="mood-q">{p(item.q)}</h2>
      <div className="mood-options">
        {item.options.map((o, oi) => (
          <button key={oi} className={`mood-option${answers[i] === o.score ? ' selected' : ''}`} onClick={() => choose(o.score)}>
            {p(o.label)}
          </button>
        ))}
      </div>
    </div>
  );
}
