import { describe, it, expect } from 'vitest';
import { calculateGestationalAge, formatGestationalAge, trimesterOf, isoWeekKey } from '../utils/gestation';

describe('calculateGestationalAge', () => {
  it('computes week 24 for a due date 16 weeks from now', () => {
    const today = new Date('2026-09-04T00:00:00.000Z');
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 16 * 7);
    const ga = calculateGestationalAge(dueDate.toISOString().slice(0, 10), today);
    expect(ga.weeks).toBe(24);
  });

  it('clamps gestational age at 0 for a due date far in the future', () => {
    const today = new Date('2026-01-01T00:00:00.000Z');
    const ga = calculateGestationalAge('2027-06-01', today);
    expect(ga.days).toBe(0);
    expect(ga.weeks).toBe(0);
  });

  it('clamps gestational age at term for an overdue due date', () => {
    const today = new Date('2026-06-01T00:00:00.000Z');
    const ga = calculateGestationalAge('2026-01-01', today);
    expect(ga.days).toBeLessThanOrEqual(280);
  });

  it('formats gestational age as "Week N • Day M"', () => {
    const formatted = formatGestationalAge({ weeks: 24, dayOfWeek: 2, days: 170 });
    expect(formatted).toBe('Week 24 • Day 3');
  });
});

describe('trimesterOf', () => {
  it('returns 1 for weeks < 13', () => {
    expect(trimesterOf(0)).toBe(1);
    expect(trimesterOf(12)).toBe(1);
  });
  it('returns 2 for weeks 13-26', () => {
    expect(trimesterOf(13)).toBe(2);
    expect(trimesterOf(26)).toBe(2);
  });
  it('returns 3 for weeks 27+', () => {
    expect(trimesterOf(27)).toBe(3);
    expect(trimesterOf(39)).toBe(3);
  });
});

describe('isoWeekKey', () => {
  it('produces a stable YYYY-Www format', () => {
    const key = isoWeekKey(new Date('2026-09-04T00:00:00.000Z'));
    expect(key).toMatch(/^\d{4}-W\d{2}$/);
  });
});
