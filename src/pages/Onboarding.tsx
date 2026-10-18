import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { LANGS, useLang, useT, useFmt } from '../i18n';
import { stageContext } from '../domain/seed';
import { requestPermission, permissionState, notificationSupport, type PermissionState } from '../services/systemNotify';
import { BabyIcon, LeafIcon } from '../components/icons';
import LangSwitch from '../components/LangSwitch';

type Step = 0 | 1 | 2 | 3;
type Known = 'due' | 'lmp' | 'month';

const DAY = 86400000;
const iso = (d: Date) => d.toISOString().slice(0, 10);

function addDays(dateIso: string, days: number) {
  return iso(new Date(new Date(dateIso).getTime() + days * DAY));
}

export default function Onboarding({ onFinished }: { onFinished?: () => void }) {
  const navigate = useNavigate();
  const t = useT();
  const fmt = useFmt();
  const user = useStore((s) => s.user);
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const chosen = useLang((s) => s.chosen);
  const setLang = useLang((s) => s.setLang);

  const [step, setStep] = useState<Step>(chosen ? 1 : 0);
  const [stage, setStage] = useState<'PREGNANT' | 'POSTPARTUM' | null>(null);
  const [known, setKnown] = useState<Known>('month');
  const [dueDate, setDueDate] = useState(user.dueDate);
  const [lmp, setLmp] = useState(user.lastMenstrualPeriod ?? addDays(iso(new Date()), -168));
  const [month, setMonth] = useState(6);
  const [birthDate, setBirthDate] = useState(addDays(iso(new Date()), -12));

  const [name, setName] = useState(user.name);
  const [doctorName, setDoctorName] = useState(user.doctorName);
  const [clinicName, setClinicName] = useState(user.clinicName);
  const [contact, setContact] = useState('');

  const [perm, setPerm] = useState<PermissionState>(permissionState());
  const [discreet, setDiscreet] = useState(false);
  const [pin, setPin] = useState('');
  const [agree, setAgree] = useState(false);

  const todayIso = iso(new Date());

  const computedDue = useMemo(() => {
    if (stage === 'POSTPARTUM') return birthDate;
    if (known === 'due') return dueDate;
    if (known === 'lmp') return addDays(lmp, 280);
    const weeks = Math.round((month - 0.5) * 4.345);
    return addDays(todayIso, 280 - weeks * 7);
  }, [stage, known, dueDate, lmp, month, birthDate, todayIso]);

  const preview = useMemo(() => {
    if (!stage) return null;
    const ctx = stageContext(stage, computedDue, stage === 'POSTPARTUM' ? birthDate : undefined);
    if (stage === 'POSTPARTUM') return t('Day {d} after birth', { d: ctx.ppDay });
    return t('About week {w} — due around {date}', { w: ctx.weeks, date: fmt.date(computedDue, { day: 'numeric', month: 'long', year: 'numeric' }) });
  }, [stage, computedDue, birthDate, t, fmt]);

  const stageValid = (() => {
    if (!stage) return false;
    if (stage === 'POSTPARTUM') return birthDate <= todayIso && birthDate >= addDays(todayIso, -365);
    const ctx = stageContext('PREGNANT', computedDue);
    return ctx.weeks >= 1 && ctx.weeks <= 42;
  })();

  const finish = () => {
    completeOnboarding({
      name,
      stage: stage ?? 'PREGNANT',
      dueDate: computedDue,
      deliveryDate: stage === 'POSTPARTUM' ? birthDate : undefined,
      doctorName,
      clinicName,
      caregiverName: contact.trim() || undefined,
      caregiverRelationship: 'Spouse/Partner',
      remindersEnabled: true,
      pin: pin.length === 4 ? pin : undefined,
      discreetNotifications: discreet,
    });
    onFinished?.();
    navigate('/home', { replace: true });
  };

  return (
    <div className="onboard">
      {step === 0 && (
        <section className="onboard-lang">
          <div className="onboard-mark" aria-hidden="true">
            <LeafIcon width={30} height={30} />
          </div>
          <h1 className="onboard-brand">Arogyama</h1>
          <p className="onboard-lang-hint">Choose your language · மொழியைத் தேர்ந்தெடுங்கள் · अपनी भाषा चुनें</p>
          <div className="lang-cards">
            {LANGS.map((l) => (
              <button
                key={l.code}
                className="lang-card"
                lang={l.code}
                onClick={() => {
                  setLang(l.code);
                  setStep(1);
                }}
              >
                <span className="lang-card-native">{l.native}</span>
                {l.code !== 'en' && <span className="lang-card-en">{l.english}</span>}
              </button>
            ))}
          </div>
        </section>
      )}

      {step > 0 && (
        <>
          <div className="onboard-top">
            <ol className="stepper" aria-label={t('Step {n} of 3', { n: step })}>
              {[1, 2, 3].map((n) => (
                <li key={n} className={n === step ? 'current' : n < step ? 'done' : undefined}>
                  {n}
                </li>
              ))}
            </ol>
            <LangSwitch compact />
          </div>

          {step === 1 && (
            <section className="onboard-step">
              <h1>{t('Where are you today?')}</h1>
              <p className="soft">{t('You can start at any month of pregnancy, or after your baby is born.')}</p>

              <div className="choice-pair">
                <button className={`choice${stage === 'PREGNANT' ? ' selected' : ''}`} onClick={() => setStage('PREGNANT')} aria-pressed={stage === 'PREGNANT'}>
                  <LeafIcon width={24} height={24} />
                  <span>{t('I am pregnant')}</span>
                </button>
                <button className={`choice${stage === 'POSTPARTUM' ? ' selected' : ''}`} onClick={() => setStage('POSTPARTUM')} aria-pressed={stage === 'POSTPARTUM'}>
                  <BabyIcon width={24} height={24} />
                  <span>{t('My baby is born')}</span>
                </button>
              </div>

              {stage === 'PREGNANT' && (
                <div className="onboard-block">
                  <div className="field-label">{t('What do you know?')}</div>
                  <div className="segmented" role="radiogroup">
                    {(
                      [
                        ['month', t('The month')],
                        ['lmp', t('Last period date')],
                        ['due', t('Due date')],
                      ] as [Known, string][]
                    ).map(([k, label]) => (
                      <button key={k} role="radio" aria-checked={known === k} className={known === k ? 'active' : undefined} onClick={() => setKnown(k)}>
                        {label}
                      </button>
                    ))}
                  </div>

                  {known === 'month' && (
                    <div className="month-picker" role="radiogroup" aria-label={t('Month of pregnancy')}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((m) => (
                        <button key={m} role="radio" aria-checked={month === m} className={month === m ? 'active' : undefined} onClick={() => setMonth(m)}>
                          {m}
                        </button>
                      ))}
                      <div className="month-caption">{t('Month {m} of pregnancy', { m: month })}</div>
                    </div>
                  )}
                  {known === 'lmp' && (
                    <div className="field">
                      <label htmlFor="lmp">{t('First day of your last period')}</label>
                      <input id="lmp" type="date" value={lmp} max={todayIso} onChange={(e) => setLmp(e.target.value)} />
                    </div>
                  )}
                  {known === 'due' && (
                    <div className="field">
                      <label htmlFor="due">{t('Expected due date (from your scan or doctor)')}</label>
                      <input id="due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                    </div>
                  )}
                </div>
              )}

              {stage === 'POSTPARTUM' && (
                <div className="onboard-block">
                  <div className="field">
                    <label htmlFor="birth">{t("Baby's date of birth")}</label>
                    <input id="birth" type="date" value={birthDate} max={todayIso} onChange={(e) => setBirthDate(e.target.value)} />
                  </div>
                </div>
              )}

              {preview && stageValid && <p className="stage-preview">{preview}</p>}
              {stage && !stageValid && <p className="field-error">{t('Please check the date.')}</p>}
              {stage === 'PREGNANT' && known === 'month' && <p className="field-hint">{t('A month is an estimate. Your doctor can correct the date later.')}</p>}

              <button className="btn btn-primary btn-block onboard-next" disabled={!stageValid} onClick={() => setStep(2)}>
                {t('Continue')}
              </button>
            </section>
          )}

          {step === 2 && (
            <section className="onboard-step">
              <h1>{t('About you')}</h1>
              <p className="soft">{t('Filled in with demo details. Change anything.')}</p>
              <div className="field">
                <label htmlFor="name">{t('Your name')}</label>
                <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="doc">{t('Your doctor')}</label>
                <input id="doc" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="clinic">{t('Hospital or health centre')}</label>
                <input id="clinic" value={clinicName} onChange={(e) => setClinicName(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="contact">{t('Someone to call in an emergency (optional)')}</label>
                <input id="contact" value={contact} placeholder={t('Name')} onChange={(e) => setContact(e.target.value)} />
              </div>
              <div className="onboard-actions">
                <button className="btn btn-ghost" onClick={() => setStep(1)}>
                  {t('Back')}
                </button>
                <button className="btn btn-primary" disabled={!name.trim()} onClick={() => setStep(3)}>
                  {t('Continue')}
                </button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="onboard-step">
              <h1>{t('Reminders and privacy')}</h1>

              <div className="setting-block">
                <div className="setting-title">{t('Phone notifications')}</div>
                <p className="soft">{t('Medicine times, visits, vaccines, and one useful fact a day.')}</p>
                {perm === 'granted' ? (
                  <p className="ok-line">{t('Notifications are on.')}</p>
                ) : perm === 'denied' ? (
                  <p className="field-hint">{t('Notifications are blocked in your browser settings. Reminders will still show inside the app.')}</p>
                ) : perm === 'unsupported' ? (
                  <p className="field-hint">
                    {notificationSupport().needsInstall
                      ? t('On iPhone: tap Share, then "Add to Home Screen", and open Arogyama from there to allow notifications.')
                      : t('This browser cannot show notifications. Reminders will show inside the app.')}
                  </p>
                ) : (
                  <button className="btn btn-secondary" onClick={async () => setPerm(await requestPermission())}>
                    {t('Turn on notifications')}
                  </button>
                )}
              </div>

              <label className="toggle-row">
                <input type="checkbox" checked={discreet} onChange={(e) => setDiscreet(e.target.checked)} />
                <span>
                  <span className="setting-title">{t('Discreet notifications')}</span>
                  <span className="soft">{t('Show "You have a care update" instead of medicine names. Useful on a shared phone.')}</span>
                </span>
              </label>

              <div className="setting-block">
                <label className="setting-title" htmlFor="pin">
                  {t('PIN for private sections (optional)')}
                </label>
                <p className="soft">{t('Mood checks, counselling and contraception choices stay behind this PIN.')}</p>
                <input
                  id="pin"
                  className="pin-input"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={pin}
                  placeholder="••••"
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                />
              </div>

              <label className="toggle-row consent">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                <span className="soft">
                  {t('I understand Arogyama organises my care and does not replace my doctor. My information stays on this phone unless I choose to share it with my doctor.')}
                </span>
              </label>

              <div className="onboard-actions">
                <button className="btn btn-ghost" onClick={() => setStep(2)}>
                  {t('Back')}
                </button>
                <button className="btn btn-primary" disabled={!agree || (pin.length > 0 && pin.length < 4)} onClick={finish}>
                  {t('Start')}
                </button>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
