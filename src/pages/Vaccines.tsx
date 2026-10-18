import { Fragment, useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { useStage } from '../store/stage';
import { useT, useFmt, usePick } from '../i18n';
import { vaccineRows, VACCINE_GROUPS_BABY, VACCINE_GROUPS_MOTHER, type VaccineRow } from '../content/vaccines';
import { SOURCES } from '../content/sources';
import FactChip from '../components/FactChip';
import { CheckIcon, CalendarPlusIcon } from '../components/icons';
import { buildIcs, saveIcs } from '../utils/ics';

export default function Vaccines() {
  const t = useT();
  const fmt = useFmt();
  const p = usePick();
  const stage = useStage();
  const user = useStore((s) => s.user);
  const records = useStore((s) => s.vaccineRecords);
  const setVaccineGiven = useStore((s) => s.setVaccineGiven);
  const pp = stage.stage === 'POSTPARTUM';
  const [tab, setTab] = useState<'baby' | 'mother'>(pp ? 'baby' : 'mother');
  const [open, setOpen] = useState<string | null>(null);
  const [givenOn, setGivenOn] = useState(new Date().toISOString().slice(0, 10));

  const rows = useMemo(
    () => vaccineRows({ records, stage: user.stage, dueDate: user.dueDate, birthDate: user.deliveryDate }),
    [records, user.stage, user.dueDate, user.deliveryDate],
  );
  const mine = rows.filter((r) => r.vaccine.who === tab);
  const groups = tab === 'baby' ? VACCINE_GROUPS_BABY : VACCINE_GROUPS_MOTHER;
  const doneCount = mine.filter((r) => r.status === 'done').length;
  const selected = rows.find((r) => r.vaccine.id === open);

  const exportReminders = () => {
    const pending = rows.filter((r) => r.status !== 'done' && r.dueOn && r.dueOn.getTime() > Date.now() - 86400000);
    const events = pending.map((r) => ({
      uid: `vax-${r.vaccine.id}`,
      title: `${r.vaccine.who === 'baby' ? t("Baby's vaccine") : t('Your vaccine')}: ${r.vaccine.short}`,
      description: p(r.vaccine.protects),
      start: r.dueOn as Date,
      allDay: true,
      alarmMinutesBefore: 60 * 15,
    }));
    saveIcs('arogyama-vaccines.ics', buildIcs(events));
  };

  const stampState = (r: VaccineRow) => (pp && r.vaccine.who === 'mother' && r.status === 'overdue' ? 'missed' : r.status);

  return (
    <div className="page vaccines">
      <header className="page-header">
        <h1>{t('Vaccines')}</h1>
        <p>{t('All vaccines in the national schedule are free at government centres.')}</p>
      </header>

      <div className="segmented segmented-wide" role="tablist">
        <button role="tab" aria-selected={tab === 'baby'} className={tab === 'baby' ? 'active' : undefined} onClick={() => setTab('baby')}>
          {t('Baby')}
        </button>
        <button role="tab" aria-selected={tab === 'mother'} className={tab === 'mother' ? 'active' : undefined} onClick={() => setTab('mother')}>
          {t('You')}
        </button>
      </div>

      <p className="vax-progress">
        {t('{done} of {total} given', { done: doneCount, total: mine.length })}
        {tab === 'baby' && !pp && <span className="muted"> — {t('dates count from your due date until the baby is born')}</span>}
      </p>

      <div className="stamp-card">
        {groups.map((g, gi) => {
          const inGroup = mine.filter((r) => r.vaccine.group === g);
          if (inGroup.length === 0) return null;
          const due = inGroup[0].dueOn;
          return (
            <Fragment key={g}>
              <div className="stamp-group">
                <div className="stamp-group-when">
                  <span className="stamp-group-label">{t(g)}</span>
                  {due && <span className="stamp-group-date">{fmt.date(due, { day: 'numeric', month: 'short', year: '2-digit' })}</span>}
                </div>
                <div className="stamps">
                  {inGroup.map((r) => (
                    <button
                      key={r.vaccine.id}
                      className={`stamp stamp-${stampState(r)}`}
                      onClick={() => {
                        setOpen(r.vaccine.id);
                        setGivenOn(r.doneOn ?? new Date().toISOString().slice(0, 10));
                      }}
                      aria-label={`${r.vaccine.short}: ${t(statusLabel(stampState(r)))}`}
                    >
                      <span className="stamp-name">{r.vaccine.short}</span>
                      {r.status === 'done' ? (
                        <span className="stamp-date">{fmt.date(r.doneOn as string, { day: 'numeric', month: 'short' })}</span>
                      ) : (
                        <span className="stamp-status">{t(statusLabel(stampState(r)))}</span>
                      )}
                      {r.status === 'done' && <CheckIcon className="stamp-check" width={14} height={14} />}
                    </button>
                  ))}
                </div>
              </div>
              {gi === 2 && <FactChip slot={`vax-${tab}`} variant="quiet" topic="vaccine" />}
            </Fragment>
          );
        })}
      </div>

      <button className="btn btn-outline btn-block" onClick={exportReminders}>
        <CalendarPlusIcon width={18} height={18} /> {t('Add vaccine dates to my phone calendar')}
      </button>

      <p className="source-line">
        {t('Source')}: <a href={SOURCES.nis.url}>{SOURCES.nis.name}, MoHFW</a>; <a href={SOURCES.pibVaccines.url}>PIB, {SOURCES.pibVaccines.year}</a>
      </p>

      {selected && (
        <div className="sheet-backdrop" onClick={() => setOpen(null)}>
          <div className="bottom-sheet" role="dialog" aria-label={selected.vaccine.short} onClick={(e) => e.stopPropagation()}>
            <h2>{selected.vaccine.short}</h2>
            <p className="soft">{t('Protects against')}: {p(selected.vaccine.protects)}</p>
            {selected.vaccine.note && <p className="note-line">{p(selected.vaccine.note)}</p>}
            <p>
              {t('When')}: {t(selected.vaccine.group)}
              {selected.dueOn && `, ${fmt.date(selected.dueOn, { day: 'numeric', month: 'long', year: 'numeric' })}`}
            </p>
            {selected.status === 'done' ? (
              <>
                <p className="ok-line">
                  {t('Given on {date}', { date: fmt.date(selected.doneOn as string, { day: 'numeric', month: 'long', year: 'numeric' }) })}
                </p>
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setVaccineGiven(selected.vaccine.id, undefined);
                    setOpen(null);
                  }}
                >
                  {t('Undo')}
                </button>
              </>
            ) : (
              <>
                <div className="field">
                  <label htmlFor="given">{t('Date given')}</label>
                  <input id="given" type="date" value={givenOn} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setGivenOn(e.target.value)} />
                </div>
                <button
                  className="btn btn-primary btn-block"
                  onClick={() => {
                    setVaccineGiven(selected.vaccine.id, givenOn);
                    setOpen(null);
                  }}
                >
                  {t('Mark as given')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function statusLabel(s: string): string {
  switch (s) {
    case 'done':
      return 'Given';
    case 'due':
      return 'Due now';
    case 'overdue':
      return 'Overdue';
    case 'missed':
      return 'Not recorded';
    case 'expected':
      return 'After birth';
    default:
      return 'Upcoming';
  }
}
