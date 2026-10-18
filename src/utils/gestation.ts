/**
 * Gestational age helpers.
 *
 * We compute gestational age from the due date (EDD), assuming a standard
 * 280-day (40-week) pregnancy: gestationalDays = 280 - (dueDate - today).
 * This mirrors the common clinical shortcut used when LMP isn't precisely
 * known. Purely organizational — never used for diagnosis or dosing.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const PREGNANCY_LENGTH_DAYS = 280;

export interface GestationalAge {
  /** total completed gestational days (0-294ish) */
  days: number;
  /** completed weeks */
  weeks: number;
  /** day-of-week within the current gestational week, 0-6 */
  dayOfWeek: number;
}

/** Truncate a Date to a midnight-normalized day count for stable diffing. */
function daysBetween(a: Date, b: Date): number {
  const aMid = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const bMid = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((bMid - aMid) / MS_PER_DAY);
}

export function calculateGestationalAge(dueDateISO: string, today: Date = new Date()): GestationalAge {
  const dueDate = new Date(dueDateISO);
  const daysUntilDue = daysBetween(today, dueDate);
  const gestationalDays = Math.max(0, Math.min(PREGNANCY_LENGTH_DAYS, PREGNANCY_LENGTH_DAYS - daysUntilDue));
  const weeks = Math.floor(gestationalDays / 7);
  const dayOfWeek = gestationalDays % 7;
  return { days: gestationalDays, weeks, dayOfWeek };
}

export function formatGestationalAge(ga: GestationalAge): string {
  return `Week ${ga.weeks} • Day ${ga.dayOfWeek + 1}`;
}

export function trimesterOf(weeks: number): 1 | 2 | 3 {
  if (weeks < 13) return 1;
  if (weeks < 27) return 2;
  return 3;
}

/** ISO week key like "2026-W36", used to bucket weekly adherence records. */
export function isoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / MS_PER_DAY + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}
