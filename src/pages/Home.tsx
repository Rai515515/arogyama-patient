import { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useStage } from '../store/stage';
import { useT, useFmt } from '../i18n';
import { buildTodayTimeline } from '../store/selectors';
import { vaccineRows, nextVaccineGroup } from '../content/vaccines';
import { bpLevel, latestReading } from '../utils/bp';
import { categoryLabel } from '../utils/labels';
import CareRow from '../components/CareRow';
import FactChip from '../components/FactChip';
import CountRibbon from '../components/CountRibbon';
import Sparkline from '../components/Sparkline';
import { visualStateFor } from '../components/statusVisual';
import { ChevronRightIcon, SyringeIcon, GaugeIcon, SupportIcon } from '../components/icons';

function greetingKey(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning, {name}';
  if (h < 17) return 'Good afternoon, {name}';
  return 'Good evening, {name}';
}

// i18n-list
const TRIMESTER = ['', 'first trimester', 'second trimester', 'third trimester'];
// end-i18n-list

export default function Home() {
  const t = useT();
  const fmt = useFmt();
  const stage = useStage();
  const user = useStore((s) => s.user);
  const medications = useStore((s) => s.medications);
  const medicationEvents = useStore((s) => s.medicationEvents);
  const appointments = useStore((s) => s.appointments);
  const investigations = useStore((s) => s.investigations);
  const scans = useStore((s) => s.scans);
  const careTasks = useStore((s) => s.careTasks);
  const vaccineRecords = useStore((s) => s.vaccineRecords);
  const bpReadings = useStore((s) => s.bpReadings);
  const markMedicationEvent = useStore((s) => s.markMedicationEvent);
  const markCareTaskDone = useStore((s) => s.markCareTaskDone);
  const markBabyBorn = useStore((s) => s.markBabyBorn);
  const [bornOpen, setBornOpen] = useState(false);
  const [bornDate, setBornDate] = useState(new Date().toISOString().slice(0, 10));

  const pp = stage.stage === 'POSTPARTUM';
  const timeline = buildTodayTimeline(new Date(), medications, medicationEvents, appointments, investigations, scans, careTasks);
  const done = timeline.filter((i) => visualStateFor(i.status) === 'done').length;

  const vRows = vaccineRows({ records: vaccineRecords, stage: user.stage, dueDate: user.dueDate, birthDate: user.deliveryDate });
  const visibleRows = pp ? vRows.filter((r) => r.vaccine.who === 'baby') : vRows;
  const nextVax = nextVaccineGroup(visibleRows);

  const onBpMed = medications.some((m) => m.id === 'med-labetalol');
  const showBp = pp || onBpMed;
  const latest = latestReading(bpReadings);
  const level = latest ? bpLevel(latest) : 'NORMAL';
  const recent = [...bpReadings].sort((a, b) => a.at.localeCompare(b.at)).slice(-7);

  const nextUp = [...appointments, ...scans, ...investigations]
    .filter((a) => a.status === 'UPCOMING' && new Date(a.scheduledFor).getTime() > Date.now() && new Date(a.scheduledFor).toDateString() !== new Date().toDateString())
    .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor))[0];
  const nextUpCat = nextUp ? ('clinicianName' in nextUp ? 'appointment' : 'kind' in nextUp ? 'investigation' : 'scan') : '';

  return (
    <div className="page home">
      {/* ---- Where she is ---------------------------------------------------- */}
      <section className="hero">
        <p className="hero-greeting">{t(greetingKey(), { name: user.name })}</p>
        <div className="hero-count">
          <span className="hero-number">{pp ? stage.ppDay : stage.weeks}</span>
          <span className="hero-unit">
            {pp ? t('days since birth') : t('weeks pregnant')}
            <span className="hero-sub">
              {pp
                ? stage.ppDay <= 40
                  ? t('{n} of the 40 days of rest', { n: stage.ppDay })
                  : t('Past the 40 days. Keep your 6-week check-up.')
                : t('Month {m}, {tri}', { m: stage.month, tri: t(TRIMESTER[stage.tag === 'T1' ? 1 : stage.tag === 'T2' ? 2 : 3]) })}
            </span>
          </span>
        </div>
        <CountRibbon
          value={pp ? stage.ppDay : stage.weeks}
          label={pp ? t('Day {d} of 40 after birth', { d: stage.ppDay }) : t('Week {w} of 40', { w: stage.weeks })}
        />
      </section>

      {/* ---- Alerts first, only when real ---------------------------------- */}
      {showBp && latest && level !== 'NORMAL' && (
        <Link to="/bp" className={`alert-band ${level === 'SEVERE' ? 'alert-severe' : 'alert-high'}`}>
          <strong>
            {level === 'SEVERE' ? t('Your last BP needs urgent care') : t('Your last BP was high')} — {latest.systolic}/{latest.diastolic}
          </strong>
          <span>{level === 'SEVERE' ? t('Go to hospital now. Call 108.') : t('Tell your doctor or health centre today.')}</span>
        </Link>
      )}

      {/* ---- Today ---------------------------------------------------------- */}
      <div className="section-head">
        <h2>{t('Today')}</h2>
        <span className="section-meta">{t('{done} of {total} done', { done, total: timeline.length })}</span>
      </div>
      <div className="sheet">
        {timeline.length === 0 && <div className="empty-state">{t('Nothing planned today.')}</div>}
        <div className="care-list">
          {timeline.map((item, idx) => (
            <Fragment key={item.id}>
              <CareRow
                status={item.status}
                title={t(item.title)}
                meta={`${fmt.time(item.scheduledFor)}, ${t(categoryLabel(item.category))}${item.detail ? `, ${t(item.detail)}` : ''}`}
                actions={
                  (item.status === 'DUE' || item.status === 'UPCOMING' || item.status === 'MISSED') &&
                  (item.category === 'MEDICINE' || item.category === 'SUPPLEMENT') ? (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={() => markMedicationEvent(item.id, 'TAKEN')}>
                        {t('I took it')}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => markMedicationEvent(item.id, 'DELAYED')}>
                        {t('Took it late')}
                      </button>
                    </>
                  ) : item.category === 'CARE_TASK' && item.status === 'UPCOMING' ? (
                    item.title === 'Check and log your BP' ? (
                      <Link className="btn btn-primary btn-sm" to="/bp">
                        {t('Log BP')}
                      </Link>
                    ) : (
                      <button className="btn btn-outline btn-sm" onClick={() => markCareTaskDone(item.id)}>
                        {t('Mark done')}
                      </button>
                    )
                  ) : undefined
                }
              />
              {idx === 1 && timeline.length > 3 && <FactChip slot="home-today" variant="quiet" kinds={['fact']} />}
            </Fragment>
          ))}
        </div>
      </div>

      {/* ---- Vaccine: always visible, never buried -------------------------- */}
      {nextVax && (
        <Link to="/vaccines" className={`vax-card vax-${nextVax.rows[0].status}`}>
          <span className="vax-card-icon" aria-hidden="true">
            <SyringeIcon width={22} height={22} />
          </span>
          <span className="vax-card-body">
            <span className="vax-card-who">
              {nextVax.who === 'mother' ? t('Your vaccine') : t("Baby's vaccine")}
              {' — '}
              {nextVax.rows[0].status === 'overdue'
                ? t('overdue')
                : nextVax.rows[0].status === 'due'
                  ? t('due now')
                  : nextVax.rows[0].status === 'expected'
                    ? t('after birth')
                    : t('next')}
            </span>
            <span className="vax-card-names">{nextVax.rows.map((r) => r.vaccine.short).join('  ')}</span>
            <span className="vax-card-when">
              {t(nextVax.group)}, {fmt.date(nextVax.dueOn, { day: 'numeric', month: 'short' })}
            </span>
          </span>
          <ChevronRightIcon width={18} height={18} />
        </Link>
      )}

      {/* ---- BP ------------------------------------------------------------- */}
      {showBp && (
        <section className="bp-card">
          <div className="bp-card-head">
            <span className="bp-card-title">
              <GaugeIcon width={18} height={18} /> {pp ? t('BP in the 40 days after birth') : t('Blood pressure')}
            </span>
            <Link to="/bp" className="btn btn-primary btn-sm">
              {t('Log BP')}
            </Link>
          </div>
          {latest ? (
            <div className="bp-card-row">
              <div>
                <div className={`bp-reading bp-${level.toLowerCase()}`}>
                  {latest.systolic}
                  <span>/</span>
                  {latest.diastolic}
                </div>
                <div className="muted small">
                  {fmt.weekday(latest.at)} {fmt.time(latest.at)}
                </div>
              </div>
              <Sparkline values={recent.map((r) => r.systolic)} />
            </div>
          ) : (
            <p className="soft">{t('No readings yet.')}</p>
          )}
        </section>
      )}

      <FactChip slot="home-news" kinds={['news']} />

      {/* ---- Next ----------------------------------------------------------- */}
      {nextUp && (
        <Link to={`/event/${nextUpCat}/${nextUp.id}`} className="next-row">
          <span>
            <span className="next-row-label">{t('Next visit')}</span>
            <span className="next-row-title">{t(nextUp.title)}</span>
            <span className="muted small">
              {fmt.date(nextUp.scheduledFor, { weekday: 'short', day: 'numeric', month: 'short' })}, {fmt.time(nextUp.scheduledFor)}
            </span>
          </span>
          <ChevronRightIcon width={18} height={18} />
        </Link>
      )}

      {/* ---- Support, low-key on purpose ------------------------------------ */}
      <Link to="/support" className="support-row">
        <SupportIcon width={20} height={20} />
        <span>
          <strong>{t('Feeling low or stressed?')}</strong>
          <span className="soft small">{t('Private mood check, counsellors near you, free helplines.')}</span>
        </span>
        <ChevronRightIcon width={18} height={18} />
      </Link>

      <div className="section-head">
        <h2>{t('Learn in a minute')}</h2>
      </div>
      <div className="topic-row">
        {(pp
          ? ['warning', 'bp', 'breastfeeding', 'postnatal', 'ppiucd', 'mind', 'vaccines']
          : stage.tag === 'T3'
            ? ['warning', 'breastfeeding', 'ppiucd', 'bp', 'vaccines', 'schemes', 'mind']
            : ['warning', 'vaccines', 'schemes', 'bp', 'breastfeeding', 'mind']
        ).map((id) => (
          <Link key={id} to={`/learn/${id}`} className={`topic${id === 'warning' ? ' topic-urgent' : ''}`}>
            {t(TOPIC_LABEL[id])}
          </Link>
        ))}
      </div>

      <FactChip slot="home-bottom" kinds={['motivation']} />

      {!pp && stage.weeks >= 28 && (
        <div className="born-box">
          {!bornOpen ? (
            <button className="btn btn-outline btn-block" onClick={() => setBornOpen(true)}>
              {t('My baby is born')}
            </button>
          ) : (
            <div>
              <div className="field">
                <label htmlFor="born">{t("Baby's date of birth")}</label>
                <input id="born" type="date" value={bornDate} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setBornDate(e.target.value)} />
              </div>
              <p className="soft small">{t("Your plan will switch to after-birth care and your baby's vaccines.")}</p>
              <div className="row-gap">
                <button className="btn btn-primary" onClick={() => markBabyBorn(bornDate)}>
                  {t('Update my plan')}
                </button>
                <button className="btn btn-ghost" onClick={() => setBornOpen(false)}>
                  {t('Cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="home-foot muted small">
        <Link to="/insights">{t('See how this week went')}</Link>
      </p>
    </div>
  );
}

// i18n-list
export const TOPIC_LABEL: Record<string, string> = {
  warning: 'Danger signs',
  bp: 'BP after birth',
  breastfeeding: 'Breastfeeding',
  postnatal: 'Check-ups after birth',
  ppiucd: 'Copper-T after birth',
  mind: 'Your mind',
  vaccines: 'Vaccines',
  schemes: 'Free schemes',
  couple: 'Couple counselling',
};
// end-i18n-list
