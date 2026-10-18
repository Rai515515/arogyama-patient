import type {
  MedicationEvent,
  Appointment,
  Investigation,
  Scan,
  CareTask,
  CarePlanCategory,
  AdherenceRecord,
} from '../domain/types';

/** A single trackable care item, normalized for adherence math. */
export interface TrackableItem {
  id: string;
  category: CarePlanCategory;
  scheduledFor: string;
  /** true if the item was completed (taken/attended/done), false if missed/skipped, undefined if pending */
  completed: boolean | undefined;
}

export function medicationEventsToTrackable(events: MedicationEvent[], category: CarePlanCategory): TrackableItem[] {
  return events.map((e) => ({
    id: e.id,
    category,
    scheduledFor: e.scheduledFor,
    completed:
      e.status === 'TAKEN' || e.status === 'DELAYED'
        ? true
        : e.status === 'SKIPPED' || e.status === 'MISSED'
          ? false
          : undefined,
  }));
}

export function appointmentsToTrackable(items: Appointment[]): TrackableItem[] {
  return items.map((a) => ({
    id: a.id,
    category: 'APPOINTMENT',
    scheduledFor: a.scheduledFor,
    completed: a.status === 'ATTENDED' ? true : a.status === 'MISSED' ? false : undefined,
  }));
}

export function investigationsToTrackable(items: Investigation[]): TrackableItem[] {
  return items.map((i) => ({
    id: i.id,
    category: 'TEST',
    scheduledFor: i.scheduledFor,
    completed: i.status === 'COMPLETED' ? true : i.status === 'MISSED' ? false : undefined,
  }));
}

export function scansToTrackable(items: Scan[]): TrackableItem[] {
  return items.map((s) => ({
    id: s.id,
    category: 'SCAN',
    scheduledFor: s.scheduledFor,
    completed: s.status === 'COMPLETED' ? true : s.status === 'MISSED' ? false : undefined,
  }));
}

export function careTasksToTrackable(items: CareTask[]): TrackableItem[] {
  return items.map((t) => ({
    id: t.id,
    category: 'CARE_TASK',
    scheduledFor: t.scheduledFor,
    completed: t.status === 'DONE' ? true : t.status === 'MISSED' ? false : undefined,
  }));
}

/**
 * Compute an adherence % from a list of trackable items whose outcome is
 * already known (completed=true/false). Pending (undefined) items are
 * excluded from the denominator — they haven't happened yet.
 */
export function computeAdherencePct(items: TrackableItem[]): number {
  const resolved = items.filter((i) => i.completed !== undefined);
  if (resolved.length === 0) return 100;
  const completed = resolved.filter((i) => i.completed).length;
  return Math.round((completed / resolved.length) * 100);
}

export function computeAdherenceRecord(weekKey: string, items: TrackableItem[]): AdherenceRecord {
  const resolved = items.filter((i) => i.completed !== undefined);
  const completedCount = resolved.filter((i) => i.completed).length;
  const missedCount = resolved.filter((i) => !i.completed).length;
  const overallPct = computeAdherencePct(items);

  const categories = Array.from(new Set(items.map((i) => i.category)));
  const byCategory: Partial<Record<CarePlanCategory, number>> = {};
  for (const cat of categories) {
    byCategory[cat] = computeAdherencePct(items.filter((i) => i.category === cat));
  }

  return {
    weekKey,
    overallPct,
    byCategory,
    missedCount,
    completedCount,
    totalCount: resolved.length,
  };
}

/** Detects items that are DUE (scheduled in the past) but still unresolved -> should become MISSED. */
export function isPastDue(scheduledFor: string, graceMinutes: number, now: Date = new Date()): boolean {
  const scheduled = new Date(scheduledFor).getTime();
  const graceMs = graceMinutes * 60 * 1000;
  return now.getTime() > scheduled + graceMs;
}
