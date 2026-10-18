/**
 * Calendar (.ics) export. Used for two things:
 *  1. one appointment ("Add to calendar")
 *  2. a whole reminder set (medicine times as daily repeating events + vaccine
 *     due dates), each with an alarm. The phone's own calendar then rings even
 *     when Arogyama is closed — the one reminder path that needs no server.
 */

export interface IcsEvent {
  uid: string;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  durationMinutes?: number;
  /** RRULE body, e.g. "FREQ=DAILY;COUNT=30" */
  rrule?: string;
  /** minutes before start for the alarm; 0 = at start */
  alarmMinutesBefore?: number;
  allDay?: boolean;
}

const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
const fmtDate = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;

function escapeIcs(text: string): string {
  return text.replace(/[\\,;]/g, (m) => `\\${m}`).replace(/\n/g, '\\n');
}

export function buildIcs(events: IcsEvent[]): string {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Arogyama//Care Plan//EN', 'CALSCALE:GREGORIAN'];
  for (const e of events) {
    lines.push('BEGIN:VEVENT', `UID:${e.uid}@arogyama`, `DTSTAMP:${fmt(new Date())}`);
    if (e.allDay) {
      const next = new Date(e.start);
      next.setDate(next.getDate() + 1);
      lines.push(`DTSTART;VALUE=DATE:${fmtDate(e.start)}`, `DTEND;VALUE=DATE:${fmtDate(next)}`);
    } else {
      const end = new Date(e.start.getTime() + (e.durationMinutes ?? 15) * 60000);
      lines.push(`DTSTART:${fmt(e.start)}`, `DTEND:${fmt(end)}`);
    }
    if (e.rrule) lines.push(`RRULE:${e.rrule}`);
    lines.push(`SUMMARY:${escapeIcs(e.title)}`);
    if (e.description) lines.push(`DESCRIPTION:${escapeIcs(e.description)}`);
    if (e.location) lines.push(`LOCATION:${escapeIcs(e.location)}`);
    if (e.alarmMinutesBefore !== undefined) {
      lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${escapeIcs(e.title)}`, `TRIGGER:-PT${e.alarmMinutesBefore}M`, 'END:VALARM');
    }
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function saveIcs(filename: string, ics: string): void {
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Generates and downloads a .ics file for one event. */
export function downloadIcs(title: string, description: string, location: string, startIso: string, durationMinutes = 30): void {
  saveIcs(
    `${title.replace(/[^a-z0-9]/gi, '-')}.ics`,
    buildIcs([{ uid: `${Date.now()}`, title, description, location, start: new Date(startIso), durationMinutes, alarmMinutesBefore: 60 }]),
  );
}
