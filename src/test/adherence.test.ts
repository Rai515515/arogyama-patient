import { describe, it, expect } from 'vitest';
import {
  computeAdherencePct,
  computeAdherenceRecord,
  medicationEventsToTrackable,
  isPastDue,
  type TrackableItem,
} from '../utils/adherence';
import type { MedicationEvent } from '../domain/types';

function makeEvent(id: string, status: MedicationEvent['status']): MedicationEvent {
  return {
    id,
    medicationId: 'med-1',
    scheduleId: `sched-${id}`,
    scheduledFor: new Date().toISOString(),
    status,
  };
}

describe('computeAdherencePct', () => {
  it('returns 100 when there are no resolved items', () => {
    const items: TrackableItem[] = [{ id: '1', category: 'MEDICINE', scheduledFor: new Date().toISOString(), completed: undefined }];
    expect(computeAdherencePct(items)).toBe(100);
  });

  it('computes percentage of completed vs resolved items', () => {
    const items: TrackableItem[] = [
      { id: '1', category: 'MEDICINE', scheduledFor: '', completed: true },
      { id: '2', category: 'MEDICINE', scheduledFor: '', completed: true },
      { id: '3', category: 'MEDICINE', scheduledFor: '', completed: false },
      { id: '4', category: 'MEDICINE', scheduledFor: '', completed: undefined },
    ];
    // 2 of 3 resolved -> 67%
    expect(computeAdherencePct(items)).toBe(67);
  });

  it('treats TAKEN and DELAYED medication events as completed, SKIPPED/MISSED as not', () => {
    const events = [
      makeEvent('a', 'TAKEN'),
      makeEvent('b', 'DELAYED'),
      makeEvent('c', 'SKIPPED'),
      makeEvent('d', 'MISSED'),
      makeEvent('e', 'UPCOMING'),
    ];
    const trackable = medicationEventsToTrackable(events, 'MEDICINE');
    expect(trackable.find((t) => t.id === 'a')?.completed).toBe(true);
    expect(trackable.find((t) => t.id === 'b')?.completed).toBe(true);
    expect(trackable.find((t) => t.id === 'c')?.completed).toBe(false);
    expect(trackable.find((t) => t.id === 'd')?.completed).toBe(false);
    expect(trackable.find((t) => t.id === 'e')?.completed).toBeUndefined();
    // 2 completed of 4 resolved -> 50%
    expect(computeAdherencePct(trackable)).toBe(50);
  });
});

describe('computeAdherenceRecord', () => {
  it('breaks down adherence by category and counts missed/completed', () => {
    const items: TrackableItem[] = [
      { id: '1', category: 'MEDICINE', scheduledFor: '', completed: true },
      { id: '2', category: 'MEDICINE', scheduledFor: '', completed: false },
      { id: '3', category: 'APPOINTMENT', scheduledFor: '', completed: true },
    ];
    const record = computeAdherenceRecord('2026-W36', items);
    expect(record.completedCount).toBe(2);
    expect(record.missedCount).toBe(1);
    expect(record.totalCount).toBe(3);
    expect(record.byCategory.MEDICINE).toBe(50);
    expect(record.byCategory.APPOINTMENT).toBe(100);
  });
});

describe('isPastDue', () => {
  it('returns false within the grace window', () => {
    const scheduled = new Date();
    const now = new Date(scheduled.getTime() + 10 * 60 * 1000); // 10 min later
    expect(isPastDue(scheduled.toISOString(), 30, now)).toBe(false);
  });

  it('returns true past the grace window', () => {
    const scheduled = new Date();
    const now = new Date(scheduled.getTime() + 60 * 60 * 1000); // 60 min later
    expect(isPastDue(scheduled.toISOString(), 30, now)).toBe(true);
  });
});
