import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  Pregnancy,
  CarePlan,
  Medication,
  MedicationEvent,
  MedicationEventStatus,
  Appointment,
  Investigation,
  Scan,
  CareTask,
  Caregiver,
  NotificationEvent,
  NotificationPreferences,
  EscalationRule,
  EscalationStage,
  Stage,
  BpReading,
  BpSymptom,
  MoodCheck,
  PpiucdState,
  PpiucdDecision,
  CounsellingRequest,
  PrivacySettings,
  InboxItem,
  InboxKind,
} from '../domain/types';
import {
  seedUser,
  seedPregnancy,
  seedCarePlan,
  seedCaregivers,
  seedNotificationPrefs,
  seedPrivacy,
  seedPpiucd,
  buildStagePlan,
} from '../domain/seed';
import { notificationService } from '../services/notifications';
import { patientConfirmationProvider } from '../services/verification';
import { isoWeekKey } from '../utils/gestation';

const ESCALATION_STAGE_ORDER: EscalationStage[] = [
  'REMINDER_SENT',
  'AWAITING_CONFIRMATION',
  'FOLLOW_UP_SENT',
  'STILL_MISSED',
  'CAREGIVER_NOTIFIED',
];

export interface OnboardingInput {
  name: string;
  stage: Stage;
  dueDate: string;
  deliveryDate?: string;
  doctorName: string;
  clinicName: string;
  caregiverName?: string;
  caregiverRelationship?: Caregiver['relationship'];
  remindersEnabled: boolean;
  pin?: string;
  discreetNotifications?: boolean;
}

interface ArogyamaState {
  user: User;
  pregnancy: Pregnancy;
  carePlan: CarePlan;
  caregivers: Caregiver[];
  notificationPrefs: NotificationPreferences;

  medications: Medication[];
  medicationEvents: MedicationEvent[];
  appointments: Appointment[];
  investigations: Investigation[];
  scans: Scan[];
  careTasks: CareTask[];

  notificationLog: NotificationEvent[];
  escalations: EscalationRule[];

  // v2
  vaccineRecords: Record<string, string | undefined>;
  bpReadings: BpReading[];
  moodChecks: MoodCheck[];
  ppiucd: PpiucdState;
  counselling: CounsellingRequest[];
  privacy: PrivacySettings;
  inbox: InboxItem[];
  /** the date (YYYY-MM-DD) of the last daily fact/motivation notification */
  lastDailyNudge?: string;

  // -- actions -----------------------------------------------------------
  completeOnboarding: (input: OnboardingInput) => void;
  markBabyBorn: (deliveryDate: string) => void;
  markMedicationEvent: (eventId: string, status: MedicationEventStatus, skipReason?: string) => void;
  markAppointmentAttended: (appointmentId: string) => void;
  markInvestigationCompleted: (investigationId: string) => void;
  markScanCompleted: (scanId: string) => void;
  markCareTaskDone: (taskId: string) => void;
  addCaregiver: (name: string, relationship: Caregiver['relationship'], phone?: string) => void;
  removeCaregiver: (caregiverId: string) => void;
  toggleCaregiverNotify: (caregiverId: string) => void;
  updateNotificationPrefs: (prefs: Partial<NotificationPreferences>) => void;

  setVaccineGiven: (vaccineId: string, date: string | undefined) => void;
  addBpReading: (systolic: number, diastolic: number, pulse: number | undefined, symptoms: BpSymptom[]) => BpReading;
  saveMoodCheck: (answers: number[]) => MoodCheck;
  setPpiucd: (decision: PpiucdDecision, questions?: string) => void;
  requestCounselling: (req: Omit<CounsellingRequest, 'id' | 'at' | 'status'>) => void;
  updatePrivacy: (patch: Partial<PrivacySettings>) => void;
  updateShare: (patch: Partial<PrivacySettings['share']>) => void;
  pushInbox: (kind: InboxKind, title: string, body: string, link?: string) => InboxItem;
  markInboxRead: (id?: string) => void;
  setLastDailyNudge: (day: string) => void;

  // demo-only actions
  simulateMissedDose: (eventId: string) => void;
  advanceEscalationDemo: () => void;
  resetEscalationDemo: () => void;

  resetAllData: () => void;
}

function buildInitialData() {
  const user = seedUser();
  const plan = buildStagePlan(user.stage, user.dueDate, user.deliveryDate);
  return {
    user,
    pregnancy: seedPregnancy(),
    carePlan: seedCarePlan(),
    caregivers: seedCaregivers(),
    notificationPrefs: seedNotificationPrefs(),
    ...plan,
    notificationLog: [] as NotificationEvent[],
    escalations: [] as EscalationRule[],
    moodChecks: [] as MoodCheck[],
    ppiucd: seedPpiucd(),
    counselling: [] as CounsellingRequest[],
    privacy: seedPrivacy(),
    inbox: [] as InboxItem[],
    lastDailyNudge: undefined as string | undefined,
  };
}

/** The demo medication event used for the Escalation Demo screen. */
export const ESCALATION_DEMO_TARGET_ID = 'escalation-demo-med';
export const ESCALATION_DEMO_LABEL = 'Labetalol — 7:00 PM dose';

let inboxCounter = 0;

export const useStore = create<ArogyamaState>()(
  persist(
    (set, get) => ({
      ...buildInitialData(),

      completeOnboarding: (input) => {
        const plan = buildStagePlan(input.stage, input.dueDate, input.deliveryDate);
        set((state) => ({
          user: {
            ...state.user,
            name: input.name || state.user.name,
            stage: input.stage,
            dueDate: input.dueDate,
            deliveryDate: input.stage === 'POSTPARTUM' ? input.deliveryDate : undefined,
            doctorName: input.doctorName || state.user.doctorName,
            clinicName: input.clinicName || state.user.clinicName,
            onboardingComplete: true,
          },
          pregnancy: { ...state.pregnancy, dueDate: input.dueDate },
          ...plan,
          caregivers:
            input.caregiverName && input.caregiverName.trim().length > 0
              ? [
                  {
                    id: `caregiver-${Date.now()}`,
                    name: input.caregiverName.trim(),
                    relationship: input.caregiverRelationship ?? 'Other',
                    notifyOnEscalation: true,
                  },
                ]
              : state.caregivers,
          notificationPrefs: { ...state.notificationPrefs, remindersEnabled: input.remindersEnabled },
          privacy: {
            ...state.privacy,
            pin: input.pin && /^\d{4}$/.test(input.pin) ? input.pin : undefined,
            discreetNotifications: input.discreetNotifications ?? state.privacy.discreetNotifications,
          },
        }));
      },

      markBabyBorn: (deliveryDate) => {
        const state = get();
        const plan = buildStagePlan('POSTPARTUM', state.user.dueDate, deliveryDate);
        set({
          user: { ...state.user, stage: 'POSTPARTUM', deliveryDate },
          ...plan,
          // keep anything she already recorded for herself
          vaccineRecords: { ...plan.vaccineRecords, ...state.vaccineRecords, bcg: plan.vaccineRecords.bcg, opv0: plan.vaccineRecords.opv0, hepb0: plan.vaccineRecords.hepb0 },
          bpReadings: [...state.bpReadings, ...plan.bpReadings.filter((r) => !state.bpReadings.some((x) => x.id === r.id))],
        });
      },

      markMedicationEvent: (eventId, status, skipReason) => {
        const nowIso = new Date().toISOString();
        set((state) => ({
          medicationEvents: state.medicationEvents.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  status,
                  actionAt: nowIso,
                  verificationMethod:
                    status === 'TAKEN' || status === 'DELAYED' || status === 'SKIPPED' ? patientConfirmationProvider.id : e.verificationMethod,
                  skipReason: status === 'SKIPPED' ? skipReason : undefined,
                }
              : e,
          ),
        }));
      },

      markAppointmentAttended: (appointmentId) => {
        set((state) => ({ appointments: state.appointments.map((a) => (a.id === appointmentId ? { ...a, status: 'ATTENDED' } : a)) }));
      },

      markInvestigationCompleted: (investigationId) => {
        set((state) => ({
          investigations: state.investigations.map((i) => (i.id === investigationId ? { ...i, status: 'COMPLETED' } : i)),
        }));
      },

      markScanCompleted: (scanId) => {
        set((state) => ({ scans: state.scans.map((s) => (s.id === scanId ? { ...s, status: 'COMPLETED' } : s)) }));
      },

      markCareTaskDone: (taskId) => {
        set((state) => ({ careTasks: state.careTasks.map((t) => (t.id === taskId ? { ...t, status: 'DONE' } : t)) }));
      },

      addCaregiver: (name, relationship, phone) => {
        set((state) => ({
          caregivers: [...state.caregivers, { id: `caregiver-${Date.now()}`, name, relationship, phone, notifyOnEscalation: true }],
        }));
      },

      removeCaregiver: (caregiverId) => {
        set((state) => ({ caregivers: state.caregivers.filter((c) => c.id !== caregiverId) }));
      },

      toggleCaregiverNotify: (caregiverId) => {
        set((state) => ({
          caregivers: state.caregivers.map((c) => (c.id === caregiverId ? { ...c, notifyOnEscalation: !c.notifyOnEscalation } : c)),
        }));
      },

      updateNotificationPrefs: (prefs) => {
        set((state) => ({ notificationPrefs: { ...state.notificationPrefs, ...prefs } }));
      },

      setVaccineGiven: (vaccineId, date) => {
        set((state) => ({ vaccineRecords: { ...state.vaccineRecords, [vaccineId]: date } }));
      },

      addBpReading: (systolic, diastolic, pulse, symptoms) => {
        const reading: BpReading = { id: `bp-${Date.now()}`, at: new Date().toISOString(), systolic, diastolic, pulse, symptoms };
        set((state) => ({ bpReadings: [...state.bpReadings, reading] }));
        return reading;
      },

      saveMoodCheck: (answers) => {
        const score = answers.reduce((a, b) => a + b, 0);
        const check: MoodCheck = { id: `mood-${Date.now()}`, at: new Date().toISOString(), answers, score, item10: answers[9] ?? 0 };
        set((state) => ({ moodChecks: [...state.moodChecks, check] }));
        return check;
      },

      setPpiucd: (decision, questions) => {
        set((state) => ({ ppiucd: { decision, questions: questions ?? state.ppiucd.questions, updatedAt: new Date().toISOString() } }));
      },

      requestCounselling: (req) => {
        set((state) => ({
          counselling: [...state.counselling, { ...req, id: `cr-${Date.now()}`, at: new Date().toISOString(), status: 'REQUESTED' }],
        }));
      },

      updatePrivacy: (patch) => {
        set((state) => ({ privacy: { ...state.privacy, ...patch } }));
      },

      updateShare: (patch) => {
        set((state) => ({ privacy: { ...state.privacy, share: { ...state.privacy.share, ...patch } } }));
      },

      pushInbox: (kind, title, body, link) => {
        inboxCounter += 1;
        const item: InboxItem = { id: `in-${Date.now()}-${inboxCounter}`, at: new Date().toISOString(), kind, title, body, read: false, link };
        set((state) => ({ inbox: [item, ...state.inbox].slice(0, 60) }));
        return item;
      },

      markInboxRead: (id) => {
        set((state) => ({ inbox: state.inbox.map((i) => (id === undefined || i.id === id ? { ...i, read: true } : i)) }));
      },

      setLastDailyNudge: (day) => set({ lastDailyNudge: day }),

      simulateMissedDose: (eventId) => {
        set((state) => ({ medicationEvents: state.medicationEvents.map((e) => (e.id === eventId ? { ...e, status: 'MISSED' } : e)) }));
        const event = notificationService.sendFollowUp(ESCALATION_DEMO_LABEL);
        set((state) => ({ notificationLog: [event, ...state.notificationLog] }));
      },

      advanceEscalationDemo: () => {
        const state = get();
        let rule = state.escalations.find((r) => r.targetId === ESCALATION_DEMO_TARGET_ID);
        const nowIso = new Date().toISOString();

        if (!rule) {
          const reminderEvent = notificationService.scheduleReminder(ESCALATION_DEMO_LABEL, nowIso);
          rule = {
            id: `escalation-${Date.now()}`,
            targetType: 'MEDICATION_EVENT',
            targetId: ESCALATION_DEMO_TARGET_ID,
            targetLabel: ESCALATION_DEMO_LABEL,
            stage: 'REMINDER_SENT',
            isDemo: true,
            history: [{ stage: 'REMINDER_SENT', at: nowIso, note: 'Initial reminder sent to patient.' }],
          };
          set((s) => ({ escalations: [...s.escalations, rule as EscalationRule], notificationLog: [reminderEvent, ...s.notificationLog] }));
          return;
        }

        const currentIdx = ESCALATION_STAGE_ORDER.indexOf(rule.stage);
        if (currentIdx >= ESCALATION_STAGE_ORDER.length - 1) return;

        const nextStage = ESCALATION_STAGE_ORDER[currentIdx + 1];
        let note = '';
        let logEvent: NotificationEvent | undefined;
        switch (nextStage) {
          case 'AWAITING_CONFIRMATION':
            note = 'No patient confirmation received yet.';
            break;
          case 'FOLLOW_UP_SENT':
            logEvent = notificationService.sendFollowUp(ESCALATION_DEMO_LABEL);
            note = 'Follow-up reminder sent.';
            break;
          case 'STILL_MISSED':
            note = 'Dose still unconfirmed after follow-up window.';
            break;
          case 'CAREGIVER_NOTIFIED': {
            const caregiver = state.caregivers.find((c) => c.notifyOnEscalation);
            logEvent = notificationService.triggerEscalation(ESCALATION_DEMO_LABEL, caregiver?.name);
            note = `[Demo] Caregiver notification simulated${caregiver ? ` for ${caregiver.name}` : ''}.`;
            break;
          }
        }
        const updatedRule: EscalationRule = { ...rule, stage: nextStage, history: [...rule.history, { stage: nextStage, at: new Date().toISOString(), note }] };
        set((s) => ({
          escalations: s.escalations.map((r) => (r.id === updatedRule.id ? updatedRule : r)),
          notificationLog: logEvent ? [logEvent, ...s.notificationLog] : s.notificationLog,
        }));
      },

      resetEscalationDemo: () => {
        set((state) => ({ escalations: state.escalations.filter((r) => r.targetId !== ESCALATION_DEMO_TARGET_ID) }));
      },

      resetAllData: () => {
        set(() => buildInitialData());
      },
    }),
    {
      name: 'arogyama-storage',
      version: 2,
      // v1 data has no stage/vaccines/privacy — start fresh rather than half-migrate.
      migrate: () => buildInitialData() as unknown as ArogyamaState,
    },
  ),
);

export function currentWeekKey(): string {
  return isoWeekKey(new Date());
}
