import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useToasts } from '../store/toasts';
import { useLang, translate, pick } from '../i18n';
import { factsForStage, factForSlot, type Fact } from '../content/facts';
import { stageContext } from '../domain/seed';
import { stageTagOf } from '../store/stage';
import { vaccineRows } from '../content/vaccines';
import { showSystemNotification, syncNudgesToWorker, registerServiceWorker } from './systemNotify';
import type { InboxKind } from '../domain/types';

/**
 * The notification engine. Runs while the app is open (and while the browser
 * keeps it alive in the background). Every notification goes to three places:
 *   1. the phone's notification tray (if permission is granted)
 *   2. an in-app banner, so she sees it even without permission
 *   3. the inbox (bell), so nothing is lost
 */

const SENT_KEY = 'arogyama-notified';
const SENSITIVE_TOPICS = new Set(['ppiucd', 'mind', 'safety']);

function sentSet(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(SENT_KEY) || '[]') as string[]);
  } catch {
    return new Set();
  }
}
function markSent(id: string) {
  try {
    const s = sentSet();
    s.add(id);
    localStorage.setItem(SENT_KEY, JSON.stringify([...s].slice(-400)));
  } catch {
    /* ignore */
  }
}

const today = () => new Date().toISOString().slice(0, 10);

export interface Deliver {
  id: string;
  kind: InboxKind;
  title: string;
  body: string;
  link?: string;
  sensitive?: boolean;
  tone?: 'info' | 'fact' | 'alert' | 'done';
}

/** Send one notification through all three channels, once. */
export async function deliver(n: Deliver, opts: { force?: boolean } = {}): Promise<boolean> {
  if (!opts.force && sentSet().has(n.id)) return false;
  markSent(n.id);
  const store = useStore.getState();
  const lang = useLang.getState().lang;
  const discreet = store.privacy.discreetNotifications;
  const t = (s: string) => translate(lang, s);
  const sysTitle = discreet && n.sensitive !== false && n.kind === 'REMINDER' ? 'Arogyama' : n.title;
  const sysBody = discreet && n.sensitive !== false && n.kind === 'REMINDER' ? t('You have a care update. Open the app to see it.') : n.body;
  store.pushInbox(n.kind, n.title, n.body, n.link);
  useToasts.getState().push({ title: n.title, body: n.body, link: n.link, tone: n.tone ?? (n.kind === 'ALERT' ? 'alert' : n.kind === 'REMINDER' ? 'info' : 'fact') });
  return showSystemNotification(sysTitle, sysBody, { tag: n.id, link: n.link });
}

function nudgeFor(f: Fact, lang: 'en' | 'ta' | 'hi'): Deliver {
  const title = f.kind === 'news' ? translate(lang, "What's new") : f.kind === 'motivation' ? translate(lang, 'For you today') : translate(lang, 'Did you know?');
  return { id: `nudge-${f.id}-${today()}`, kind: f.kind === 'news' ? 'NEWS' : f.kind === 'motivation' ? 'MOTIVATION' : 'FACT', title, body: pick(f.text, lang), link: f.learn ? `#/learn/${f.learn}` : '#/home', tone: 'fact' };
}

function tick() {
  const s = useStore.getState();
  if (!s.user.onboardingComplete || !s.notificationPrefs.remindersEnabled) return;
  const lang = useLang.getState().lang;
  const t = (x: string, v?: Record<string, string | number>) => translate(lang, x, v);
  const now = Date.now();
  const timeOf = (iso: string) => new Date(iso).toLocaleTimeString(lang === 'en' ? 'en-IN' : `${lang}-IN`, { hour: 'numeric', minute: '2-digit' });

  // 1. Medicine doses — at the scheduled minute (and up to 20 min late if the app just opened)
  for (const e of s.medicationEvents) {
    if (e.status !== 'UPCOMING' && e.status !== 'DUE') continue;
    const due = new Date(e.scheduledFor).getTime();
    if (now >= due && now - due < 20 * 60000) {
      const med = s.medications.find((m) => m.id === e.medicationId);
      if (!med) continue;
      void deliver({
        id: `dose-${e.id}`,
        kind: 'REMINDER',
        title: t('Time for {med}', { med: t(med.name) }),
        body: t('{dose}. Tap to confirm you took it.', { dose: med.dosage }),
        link: '#/home',
      });
    }
  }

  // 2. Visits, tests and scans — 60 minutes before
  const visits = [
    ...s.appointments.map((a) => ({ id: a.id, title: a.title, at: a.scheduledFor, where: a.location, done: a.status !== 'UPCOMING', cat: 'appointment' })),
    ...s.investigations.map((i) => ({ id: i.id, title: i.title, at: i.scheduledFor, where: i.location, done: i.status !== 'UPCOMING', cat: 'investigation' })),
    ...s.scans.map((x) => ({ id: x.id, title: x.title, at: x.scheduledFor, where: x.location, done: x.status !== 'UPCOMING', cat: 'scan' })),
  ];
  for (const v of visits) {
    if (v.done) continue;
    const due = new Date(v.at).getTime();
    if (due - now <= 60 * 60000 && due - now > -10 * 60000) {
      void deliver({
        id: `visit-${v.id}-${v.at}`,
        kind: 'REMINDER',
        title: t('{title} at {time}', { title: t(v.title), time: timeOf(v.at) }),
        body: t(v.where),
        link: `#/event/${v.cat}/${v.id}`,
      });
    }
  }

  // 3. Vaccines due or overdue — once a day
  const rows = vaccineRows({ records: s.vaccineRecords, stage: s.user.stage, dueDate: s.user.dueDate, birthDate: s.user.deliveryDate });
  const dueRows = rows.filter((r) => (r.status === 'due' || r.status === 'overdue') && !(r.vaccine.who === 'mother' && s.user.stage === 'POSTPARTUM'));
  if (dueRows.length > 0 && new Date().getHours() >= 8) {
    const who = dueRows[0].vaccine.who === 'mother' ? t('You') : t('Your baby');
    void deliver({
      id: `vax-${today()}`,
      kind: 'REMINDER',
      sensitive: false,
      title: t('Vaccine due: {who}', { who }),
      body: dueRows.map((r) => r.vaccine.short).join(', '),
      link: '#/vaccines',
    });
  }

  // 4. Evening BP check in the 40 days after birth, and for anyone on BP medicine
  const ctx = stageContext(s.user.stage, s.user.dueDate, s.user.deliveryDate);
  const onBpMed = s.medications.some((m) => m.id === 'med-labetalol');
  const loggedToday = s.bpReadings.some((r) => r.at.slice(0, 10) === today());
  if ((ctx.stage === 'POSTPARTUM' && ctx.ppDay <= 42) || onBpMed) {
    if (!loggedToday && new Date().getHours() >= 18) {
      void deliver({
        id: `bp-${today()}`,
        kind: 'REMINDER',
        sensitive: false,
        title: t('Time to check your BP'),
        body: ctx.stage === 'POSTPARTUM' ? t('Day {d} of 40 after birth. It takes 2 minutes.', { d: ctx.ppDay }) : t('It takes 2 minutes. Log it so your doctor can see the trend.'),
        link: '#/bp',
      });
    }
  }

  // 5. One daily fact / news / motivation, after 9 am
  if (s.lastDailyNudge !== today() && new Date().getHours() >= 9) {
    const tag = stageTagOf(ctx);
    const day = new Date().getDate();
    const kinds: Fact['kind'][] = day % 3 === 0 ? ['motivation'] : day % 3 === 1 ? ['fact'] : ['news', 'fact'];
    let f = factForSlot(tag, 'daily-push', { kinds });
    if (s.privacy.discreetNotifications && SENSITIVE_TOPICS.has(f.topic)) f = factForSlot(tag, 'daily-push-safe', { kinds: ['motivation'] });
    s.setLastDailyNudge(today());
    void deliver(nudgeFor(f, lang));
  }
}

/** Keep the service worker's daily pool in the current language and stage. */
function syncPool() {
  const s = useStore.getState();
  const lang = useLang.getState().lang;
  const tag = stageTagOf(stageContext(s.user.stage, s.user.dueDate, s.user.deliveryDate));
  const pool = factsForStage(tag).filter((f) => !(s.privacy.discreetNotifications && SENSITIVE_TOPICS.has(f.topic)));
  void syncNudgesToWorker(pool.map((f) => nudgeFor(f, lang)).map(({ title, body, link }) => ({ title, body, link })));
}

export function useNotificationEngine() {
  const lang = useLang((s) => s.lang);
  const stage = useStore((s) => s.user.stage);
  const discreet = useStore((s) => s.privacy.discreetNotifications);

  useEffect(() => {
    void registerServiceWorker();
  }, []);

  useEffect(() => {
    syncPool();
  }, [lang, stage, discreet]);

  useEffect(() => {
    const first = setTimeout(tick, 3500); // after the load screen
    const id = setInterval(tick, 30000);
    const onVisible = () => document.visibilityState === 'visible' && tick();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearTimeout(first);
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
}

/** Used by the "Send a test notification" button. */
export function sendTestNotification() {
  const lang = useLang.getState().lang;
  return deliver(
    {
      id: `test-${Date.now()}`,
      kind: 'SYSTEM',
      title: translate(lang, 'Notifications are working'),
      body: translate(lang, 'You will get reminders like this for medicines, visits and vaccines.'),
      link: '#/me',
      tone: 'done',
    },
    { force: true },
  );
}
