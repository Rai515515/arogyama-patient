import { Link, useParams } from 'react-router-dom';
import { useT, usePick } from '../i18n';
import { ARTICLES, articleById } from '../content/articles';
import { SOURCES } from '../content/sources';
import FactChip from '../components/FactChip';
import QuickExit from '../components/QuickExit';
import { ArrowLeftIcon, ChevronRightIcon } from '../components/icons';
import { useStage } from '../store/stage';

export function LearnIndex() {
  const t = useT();
  const p = usePick();
  return (
    <div className="page">
      <header className="page-header">
        <h1>{t('Learn')}</h1>
        <p>{t('Short pages. Every fact links to where it came from.')}</p>
      </header>
      <ul className="article-list">
        {ARTICLES.map((a) => (
          <li key={a.id}>
            <Link to={`/learn/${a.id}`} className={a.urgent ? 'urgent' : undefined}>
              <span>
                <span className="article-title">{p(a.title)}</span>
                <span className="soft small">{p(a.summary)}</span>
              </span>
              <ChevronRightIcon width={18} height={18} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function LearnArticle() {
  const { id } = useParams<{ id: string }>();
  const t = useT();
  const p = usePick();
  const stage = useStage();
  const a = id ? articleById(id) : undefined;
  if (!a) return <LearnIndex />;

  const others = ARTICLES.filter((x) => x.id !== a.id && (stage.tag === 'PP' ? x.id !== 'schemes' : true)).slice(0, 4);

  return (
    <div className="page article">
      <header className="mood-top">
        <Link to="/learn" className="back-button">
          <ArrowLeftIcon width={16} height={16} /> {t('All topics')}
        </Link>
        {a.sensitive && <QuickExit />}
      </header>
      <h1 className={a.urgent ? 'article-h urgent' : 'article-h'}>{p(a.title)}</h1>
      <p className="article-summary">{p(a.summary)}</p>
      {a.urgent && (
        <a className="btn btn-danger btn-block" href="tel:108">
          {t('Call 108')}
        </a>
      )}
      <ol className="point-list numbered">
        {a.points.map((pt, i) => (
          <li key={i}>{p(pt)}</li>
        ))}
      </ol>

      {a.id === 'ppiucd' && (
        <Link to="/choices" className="btn btn-secondary btn-block">
          {t('Record my decision privately')}
        </Link>
      )}
      {(a.id === 'mind' || a.id === 'couple') && (
        <Link to="/support" className="btn btn-secondary btn-block">
          {t('Get support')}
        </Link>
      )}
      {a.id === 'bp' && (
        <Link to="/bp" className="btn btn-secondary btn-block">
          {t('Log my BP')}
        </Link>
      )}
      {a.id === 'vaccines' && (
        <Link to="/vaccines" className="btn btn-secondary btn-block">
          {t('Open the vaccine card')}
        </Link>
      )}

      <FactChip slot={`learn-${a.id}`} kinds={['fact', 'news']} />

      <section className="sources">
        <h2 className="sheet-title">{t('Sources')}</h2>
        <ul>
          {a.sources.map((s) => {
            const src = SOURCES[s];
            return (
              <li key={s}>
                <a href={src.url} target="_blank" rel="noreferrer">
                  {src.name}
                </a>{' '}
                <span className="muted small">
                  {src.publisher}, {src.year}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="muted small">{t('General information. Follow your own doctor’s advice.')}</p>
      </section>

      <div className="section-head">
        <h2>{t('More to read')}</h2>
      </div>
      <div className="topic-row">
        {others.map((o) => (
          <Link key={o.id} to={`/learn/${o.id}`} className="topic">
            {p(o.title)}
          </Link>
        ))}
      </div>
    </div>
  );
}
