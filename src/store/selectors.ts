import type {
  MedicationEvent,
  Medication,
  Appointment,
  Investigation,
  Scan,
  CareTask,
  CarePlanCategory,
} from '../domain/types';
import {
  medicationEventsToTrackable,
  appointmentsToTrackable,
  investigationsToTrackable,
  scansToTrackable,
  careTasksToTrackable,
  computeAdherenceRecord,
  computeAdherencePct,
  type TrackableItem,
} from '../utils/adherence';

export interface TimelineItem {
  id: string;
  category: CarePlanCategory;
  title: string;
  /** dosage or other short detail, kept separate so the title can be translated */
  detail?: string;
  scheduledFor: string;
  statusLabel: string;
  status: 'TAKEN' | 'DUE' | 'UPCOMING' | 'MISSED' | 'DELAYED' | 'SKIPPED' | 'DONE' | 'ATTENDED' | 'COMPLETED';
  importance?: 'ROUTINE' | 'IMPORTANT' | 'CRITICAL';
}

function isSameDay(iso: string, day: Date): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === day.getFullYear() && d.getMonth() === day.getMonth() && d.getDate() === day.getDate()
  );
}

export function medNameFor(medications: Medication[], medicationId: string): string {
  return medications.find((m) => m.id === medicationId)?.name ?? 'Medicine';
}

export function buildTodayTimeline(
  day: Date,
  medications: Medication[],
  medicationEvents: MedicationEvent[],
  appointments: Appointment[],
  investigations: Investigation[],
  scans: Scan[],
  careTasks: CareTask[],
): TimelineItem[] {
  const items: TimelineItem[] = [];

  for (const e of medicationEvents) {
    if (!isSameDay(e.scheduledFor, day)) continue;
    const med = medications.find((m) => m.id === e.medicationId);
    items.push({
      id: e.id,
      category: med?.category ?? 'MEDICINE',
      title: med ? med.name : 'Medicine',
      detail: med?.dosage,
      scheduledFor: e.scheduledFor,
      status: e.status,
      statusLabel: labelForMedStatus(e.status),
    });
  }
  for (const a of appointments) {
    if (!isSameDay(a.scheduledFor, day)) continue;
    items.push({
      id: a.id,
      category: 'APPOINTMENT',
      title: a.title,
      scheduledFor: a.scheduledFor,
      status: a.status === 'ATTENDED' ? 'ATTENDED' : a.status === 'MISSED' ? 'MISSED' : 'UPCOMING',
      statusLabel: a.status === 'ATTENDED' ? 'Attended' : a.status === 'MISSED' ? 'Missed' : 'Upcoming',
      importance: a.importance,
    });
  }
  for (const i of investigations) {
    if (!isSameDay(i.scheduledFor, day)) continue;
    items.push({
      id: i.id,
      category: 'TEST',
      title: i.title,
      scheduledFor: i.scheduledFor,
      status: i.status === 'COMPLETED' ? 'COMPLETED' : i.status === 'MISSED' ? 'MISSED' : 'UPCOMING',
      statusLabel: i.status === 'COMPLETED' ? 'Completed' : i.status === 'MISSED' ? 'Missed' : 'Upcoming',
      importance: i.importance,
    });
  }
  for (const s of scans) {
    if (!isSameDay(s.scheduledFor, day)) continue;
    items.push({
      id: s.id,
      category: 'SCAN',
      title: s.title,
      scheduledFor: s.scheduledFor,
      status: s.status === 'COMPLETED' ? 'COMPLETED' : s.status === 'MISSED' ? 'MISSED' : 'UPCOMING',
      statusLabel: s.status === 'COMPLETED' ? 'Completed' : s.status === 'MISSED' ? 'Missed' : 'Upcoming',
      importance: s.importance,
    });
  }
  for (const t of careTasks) {
    if (!isSameDay(t.scheduledFor, day)) continue;
    items.push({
      id: t.id,
      category: 'CARE_TASK',
      title: t.title,
      scheduledFor: t.scheduledFor,
      status: t.status === 'DONE' ? 'DONE' : t.status === 'MISSED' ? 'MISSED' : 'UPCOMING',
      statusLabel: t.status === 'DONE' ? 'Done' : t.status === 'MISSED' ? 'Missed' : 'Upcoming',
      importance: t.importance,
    });
  }

  return items.sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
}

export function labelForMedStatus(status: MedicationEvent['status']): string {
  switch (status) {
    case 'TAKEN':
      return 'Patient confirmed';
    case 'DELAYED':
      return 'Taken (delayed)';
    case 'SKIPPED':
      return 'Skipped';
    case 'MISSED':
      return 'Missed';
    case 'DUE':
      return 'Due now';
    case 'UPCOMING':
    default:
      return 'Upcoming';
  }
}

export function allTrackableItems(
  medicationEvents: MedicationEvent[],
  medications: Medication[],
  appointments: Appointment[],
  investigations: Investigation[],
  scans: Scan[],
  careTasks: CareTask[],
): TrackableItem[] {
  const medsByCategory = medicationEvents.reduce<Record<string, MedicationEvent[]>>((acc, e) => {
    const med = medications.find((m) => m.id === e.medicationId);
    const cat = med?.category ?? 'MEDICINE';
    acc[cat] = acc[cat] ?? [];
    acc[cat].push(e);
    return acc;
  }, {});

  return [
    ...(medsByCategory.MEDICINE ? medicationEventsToTrackable(medsByCategory.MEDICINE, 'MEDICINE') : []),
    ...(medsByCategory.SUPPLEMENT ? medicationEventsToTrackable(medsByCategory.SUPPLEMENT, 'SUPPLEMENT') : []),
    ...appointmentsToTrackable(appointments),
    ...investigationsToTrackable(investigations),
    ...scansToTrackable(scans),
    ...careTasksToTrackable(careTasks),
  ];
}

function isThisWeek(iso: string, referenceDate: Date): boolean {
  const d = new Date(iso);
  const start = new Date(referenceDate);
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return d >= start && d < end;
}

export interface DayCompletion {
  label: string;
  pct: number | null;
  isToday: boolean;
  isFuture: boolean;
}

/** This week's completion, one entry per day (Sun-Sat), for a compact dot/bar visualization. */
export function computeDailyCompletionForWeek(
  medicationEvents: MedicationEvent[],
  medications: Medication[],
  appointments: Appointment[],
  investigations: Investigation[],
  scans: Scan[],
  careTasks: CareTask[],
  referenceDate: Date = new Date(),
): DayCompletion[] {
  const items = allTrackableItems(medicationEvents, medications, appointments, investigations, scans, careTasks);
  const start = new Date(referenceDate);
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);

  const days: DayCompletion[] = [];
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(start);
    dayStart.setDate(dayStart.getDate() + i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dayItems = items.filter((item) => {
      const d = new Date(item.scheduledFor);
      return d >= dayStart && d < dayEnd;
    });
    const resolved = dayItems.filter((i) => i.completed !== undefined);
    const endOfReferenceDay = new Date(referenceDate);
    endOfReferenceDay.setHours(23, 59, 59, 999);
    const isFuture = dayStart.getTime() > endOfReferenceDay.getTime();

    days.push({
      label: dayLabels[dayStart.getDay()],
      pct: resolved.length === 0 ? null : computeAdherencePct(dayItems),
      isToday: isSameDay(dayStart.toISOString(), referenceDate),
      isFuture,
    });
  }
  return days;
}

export function computeWeeklyAdherence(
  medicationEvents: MedicationEvent[],
  medications: Medication[],
  appointments: Appointment[],
  investigations: Investigation[],
  scans: Scan[],
  careTasks: CareTask[],
  weekKey: string,
  referenceDate: Date = new Date(),
) {
  const items = allTrackableItems(medicationEvents, medications, appointments, investigations, scans, careTasks).filter(
    (i) => isThisWeek(i.scheduledFor, referenceDate),
  );
  return computeAdherenceRecord(weekKey, items);
}

export interface MissedCareItem {
  id: string;
  title: string;
  category: CarePlanCategory;
  scheduledFor: string;
  supportiveNote: string;
}

export function buildMissedCareList(
  medicationEvents: MedicationEvent[],
  medications: Medication[],
  appointments: Appointment[],
  investigations: Investigation[],
  scans: Scan[],
  careTasks: CareTask[],
): MissedCareItem[] {
  const list: MissedCareItem[] = [];

  for (const e of medicationEvents) {
    if (e.status !== 'MISSED' && e.status !== 'SKIPPED') continue;
    const med = medications.find((m) => m.id === e.medicationId);
    list.push({
      id: e.id,
      title: med?.name ?? 'Medicine',
      category: med?.category ?? 'MEDICINE',
      scheduledFor: e.scheduledFor,
      // i18n-list
      supportiveNote:
        e.status === 'SKIPPED'
          ? 'You marked this as skipped. Your care plan has been updated.'
          : 'You missed one scheduled dose. Your care plan has been updated.',
      // end-i18n-list
    });
  }
  for (const a of appointments) {
    if (a.status !== 'MISSED') continue;
    list.push({
      id: a.id,
      title: a.title,
      category: 'APPOINTMENT',
      scheduledFor: a.scheduledFor,
      supportiveNote: 'You missed this appointment. Consider rescheduling with your clinic.',
    });
  }
  for (const i of investigations) {
    if (i.status !== 'MISSED') continue;
    list.push({
      id: i.id,
      title: i.title,
      category: 'TEST',
      scheduledFor: i.scheduledFor,
      supportiveNote: 'This test was missed. Your care plan has been updated.',
    });
  }
  for (const s of scans) {
    if (s.status !== 'MISSED') continue;
    list.push({
      id: s.id,
      title: s.title,
      category: 'SCAN',
      scheduledFor: s.scheduledFor,
      supportiveNote: 'This scan was missed. Your care plan has been updated.',
    });
  }
  for (const t of careTasks) {
    if (t.status !== 'MISSED') continue;
    list.push({
      id: t.id,
      title: t.title,
      category: 'CARE_TASK',
      scheduledFor: t.scheduledFor,
      supportiveNote: 'This task was missed. Your care plan has been updated.',
    });
  }

  return list.sort((a, b) => new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime());
}
