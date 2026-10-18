import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useT, usePick, useFmt } from '../i18n';
import { articleById } from '../content/articles';
import { SOURCES } from '../content/sources';
import type { PpiucdDecision } from '../domain/types';
import QuickExit from '../components/QuickExit';
import FactChip from '../components/FactChip';

const OPTIONS: { key: PpiucdDecision; label: string }[] = [
  { key: 'YES', label: 'Yes, I want a Copper-T after delivery' },
  { key: 'WITH_PARTNER', label: 'I want to talk with my partner first' },
  { key: 'MORE_INFO', label: 'I need more information' },
  { key: 'NO', label: 'No, not for me' },
  { key: 'UNDECIDED', label: 'Not decided' },
];

/** PPIUCD counselling and a private, changeable decision. */
export default function Choices() {
  const t = useT();
  const p = usePick();
  const fmt = useFmt();
  const ppiucd = useStore((s) => s.ppiucd);
  const setPpiucd = useStore((s) => s.setPpiucd);
  const share = useStore((s) => s.privacy.share.contraception);
  const updateShare = useStore((s) => s.updateShare);
  const doctor = useStore((s) => s.user.doctorName);
  const requestCounselling = useStore((s) => s.requestCounselling);
  const [questions, setQuestions] = useState(ppiucd.questions ?? '');
  const [requested, setRequested] = useState(false);
  const article = articleById('ppiucd')!;

  return (
    <div className="page">
      <header className="page-header with-action">
        <div>
          <h1>{p(article.title)}</h1>
          <p>{p(article.summary)}</p>
        </div>
        <QuickExit />
      </header>

      <ul className="point-list">
        {article.points.map((pt, i) => (
          <li key={i}>{p(pt)}</li>
        ))}
      </ul>

      <FactChip slot="choices" topic="ppiucd" />

      <section className="sheet">
        <h2 className="sheet-title">{t('My decision')}</h2>
        <div className="radio-list" role="radiogroup">
          {OPTIONS.map((o) => (
            <label key={o.key} className={`radio-row${ppiucd.decision === o.key ? ' selected' : ''}`}>
              <input type="radio" name="ppiucd" checked={ppiucd.decision === o.key} onChange={() => setPpiucd(o.key, questions)} />
              {t(o.label)}
            </label>
          ))}
        </div>
        {ppiucd.updatedAt && <p className="muted small">{t('Saved {date}', { date: fmt.date(ppiucd.updatedAt, { day: 'numeric', month: 'short' }) })}</p>}
        <div className="field">
          <label htmlFor="q">{t('Questions for my doctor')}</label>
          <textarea id="q" rows={3} value={questions} onChange={(e) => setQuestions(e.target.value)} onBlur={() => setPpiucd(ppiucd.decision, questions)} />
        </div>
        <label className="toggle-row">
          <input type="checkbox" checked={share} onChange={(e) => updateShare({ contraception: e.target.checked })} />
          <span>
            <span className="setting-title">{t('Let {doctor} see my choice and questions', { doctor })}</span>
            <span className="soft">{t('Off by default. Your family does not see this.')}</span>
          </span>
        </label>
        {!requested ? (
          <button
            className="btn btn-secondary"
            onClick={() => {
              requestCounselling({ kind: 'FAMILY_PLANNING', mode: 'IN_PERSON', preferredTime: 'MORNING', partnerJoining: false, topics: [] });
              setRequested(true);
            }}
          >
            {t('Ask for a private talk about this')}
          </button>
        ) : (
          <p className="ok-line">{t('Request sent. The centre will call you.')}</p>
        )}
      </section>

      <p className="source-line">
        {t('Source')}: <a href={SOURCES.ppiucdIndia.url}>{SOURCES.ppiucdIndia.publisher}, {SOURCES.ppiucdIndia.year}</a>
      </p>
      <Link to="/support" className="link-chip">
        {t('Back to support')}
      </Link>
    </div>
  );
}
