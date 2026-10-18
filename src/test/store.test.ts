import { describe, it, expect, beforeEach } from 'vitest';
import { useStore, ESCALATION_DEMO_TARGET_ID } from '../store/useStore';

describe('medication event status transitions', () => {
  beforeEach(() => {
    useStore.getState().resetAllData();
  });

  it('marks a due/upcoming event as TAKEN with patient-confirmation verification', () => {
    const event = useStore.getState().medicationEvents.find((e) => e.status === 'DUE' || e.status === 'UPCOMING');
    expect(event).toBeDefined();
    useStore.getState().markMedicationEvent(event!.id, 'TAKEN');
    const updated = useStore.getState().medicationEvents.find((e) => e.id === event!.id);
    expect(updated?.status).toBe('TAKEN');
    expect(updated?.verificationMethod).toBe('PATIENT_CONFIRMATION');
    expect(updated?.actionAt).toBeDefined();
  });

  it('marks an event as SKIPPED with an optional reason', () => {
    const event = useStore.getState().medicationEvents.find((e) => e.status === 'DUE' || e.status === 'UPCOMING');
    useStore.getState().markMedicationEvent(event!.id, 'SKIPPED', 'Felt unwell');
    const updated = useStore.getState().medicationEvents.find((e) => e.id === event!.id);
    expect(updated?.status).toBe('SKIPPED');
    expect(updated?.skipReason).toBe('Felt unwell');
  });

  it('does not mutate unrelated events', () => {
    const before = useStore.getState().medicationEvents;
    const target = before.find((e) => e.status === 'DUE' || e.status === 'UPCOMING')!;
    const otherIds = before.filter((e) => e.id !== target.id).map((e) => ({ id: e.id, status: e.status }));
    useStore.getState().markMedicationEvent(target.id, 'TAKEN');
    const after = useStore.getState().medicationEvents;
    for (const other of otherIds) {
      const stillThere = after.find((e) => e.id === other.id);
      expect(stillThere?.status).toBe(other.status);
    }
  });
});

describe('missed-task detection (simulateMissedDose)', () => {
  beforeEach(() => {
    useStore.getState().resetAllData();
  });

  it('flips a dose to MISSED and logs a follow-up notification', () => {
    const event = useStore.getState().medicationEvents.find((e) => e.status === 'DUE' || e.status === 'UPCOMING')!;
    useStore.getState().simulateMissedDose(event.id);
    const updated = useStore.getState().medicationEvents.find((e) => e.id === event.id);
    expect(updated?.status).toBe('MISSED');
    expect(useStore.getState().notificationLog.length).toBeGreaterThan(0);
  });
});

describe('escalation rule progression', () => {
  beforeEach(() => {
    useStore.getState().resetAllData();
    useStore.getState().resetEscalationDemo();
  });

  it('starts with no escalation rule until first advance', () => {
    expect(useStore.getState().escalations.find((r) => r.targetId === ESCALATION_DEMO_TARGET_ID)).toBeUndefined();
  });

  it('advances through the full pipeline in strict forward order and stops at the end', () => {
    const expectedStages = [
      'REMINDER_SENT',
      'AWAITING_CONFIRMATION',
      'FOLLOW_UP_SENT',
      'STILL_MISSED',
      'CAREGIVER_NOTIFIED',
    ];

    for (const expectedStage of expectedStages) {
      useStore.getState().advanceEscalationDemo();
      const rule = useStore.getState().escalations.find((r) => r.targetId === ESCALATION_DEMO_TARGET_ID);
      expect(rule?.stage).toBe(expectedStage);
    }

    // calling again after the final stage should not throw or move past CAREGIVER_NOTIFIED
    useStore.getState().advanceEscalationDemo();
    const rule = useStore.getState().escalations.find((r) => r.targetId === ESCALATION_DEMO_TARGET_ID);
    expect(rule?.stage).toBe('CAREGIVER_NOTIFIED');
  });

  it('records a history entry for every stage reached', () => {
    for (let i = 0; i < 5; i++) useStore.getState().advanceEscalationDemo();
    const rule = useStore.getState().escalations.find((r) => r.targetId === ESCALATION_DEMO_TARGET_ID);
    expect(rule?.history.length).toBe(5);
  });

  it('resetEscalationDemo removes the rule entirely', () => {
    useStore.getState().advanceEscalationDemo();
    useStore.getState().resetEscalationDemo();
    expect(useStore.getState().escalations.find((r) => r.targetId === ESCALATION_DEMO_TARGET_ID)).toBeUndefined();
  });
});
