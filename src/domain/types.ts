// ============================================================================
// Arogyama domain model
// ----------------------------------------------------------------------------
// This file defines the core domain types for the Arogyama MVP — a single
// patient's own care journey. It models the full loop the product is built
// around:
//
//   PRESCRIBED -> SCHEDULED -> REMINDER -> PATIENT ACTION ->
//   COMPLETION CONFIRMATION -> ADHERENCE RECORD -> MISSED-TASK DETECTION ->
//   ESCALATION (DEMO)
//
// Nothing here performs diagnosis or recommends dosage changes. All content
// surfaced to patients based on these types must stay descriptive/organizational.
// v2: a separate doctor app (doctor/) reads the same shapes. The patient
// decides per category what is shared (PrivacySettings.share).
// ============================================================================

/** ISO-8601 date string, e.g. "2026-09-04" */
export type ISODate = string;
/** ISO-8601 datetime string, e.g. "2026-09-04T09:00:00.000Z" */
export type ISODateTime = string;

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

export type Stage = 'PREGNANT' | 'POSTPARTUM';

export interface User {
  id: string;
  name: string;
  /** Hospital / patient number, the identifier clinicians search by */
  hospitalNo: string;
  stage: Stage;
  dueDate: ISODate;
  /** set once the baby is born */
  deliveryDate?: ISODate;
  lastMenstrualPeriod?: ISODate;
  doctorName: string;
  clinicName: string;
  phone?: string;
  createdAt: ISODateTime;
  onboardingComplete: boolean;
}

export type CaregiverRelationship = 'Spouse/Partner' | 'Parent' | 'Sibling' | 'Friend' | 'Other';

/**
 * An optional emergency contact used only to make the escalation demo
 * (see EscalationDemo.tsx) concrete — "who would be notified" in a real
 * deployment. There is no caregiver-facing view in this app: a patient's
 * care data is never exposed to anyone else.
 */
export interface Caregiver {
  id: string;
  name: string;
  relationship: CaregiverRelationship;
  phone?: string;
  /** Whether this contact is used as the target of the escalation demo */
  notifyOnEscalation: boolean;
}

// ---------------------------------------------------------------------------
// Pregnancy & care plan
// ---------------------------------------------------------------------------

export interface Pregnancy {
  id: string;
  userId: string;
  dueDate: ISODate;
  lastMenstrualPeriod: ISODate;
  isHighRisk: boolean;
}

export type CarePlanCategory =
  | 'MEDICINE'
  | 'SUPPLEMENT'
  | 'SCAN'
  | 'TEST'
  | 'APPOINTMENT'
  | 'CARE_TASK';

export interface CarePlan {
  id: string;
  userId: string;
  prescribedBy: string;
  prescribedAt: ISODateTime;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Medication
// ---------------------------------------------------------------------------

export type MedicationFrequency = 'ONCE_DAILY' | 'TWICE_DAILY' | 'THRICE_DAILY' | 'WEEKLY';

export interface Medication {
  id: string;
  carePlanId: string;
  name: string;
  dosage: string;
  category: 'MEDICINE' | 'SUPPLEMENT';
  frequency: MedicationFrequency;
  /** Times of day this medicine is scheduled, "HH:mm" 24h */
  timesOfDay: string[];
  startDate: ISODate;
  endDate?: ISODate;
  instructions?: string;
  prescribedBy: string;
  active: boolean;
}

/**
 * Status lifecycle for a single scheduled dose (a "MedicationSchedule" slot
 * materialized into a "MedicationEvent" instance for a specific date/time).
 *
 *   UPCOMING -> DUE -> (TAKEN | DELAYED | SKIPPED | MISSED)
 *
 * TAKEN / DELAYED / SKIPPED are patient-initiated. MISSED is system-detected
 * when a DUE event passes its grace window with no patient action.
 */
export type MedicationEventStatus = 'UPCOMING' | 'DUE' | 'TAKEN' | 'DELAYED' | 'SKIPPED' | 'MISSED';

export interface MedicationSchedule {
  id: string;
  medicationId: string;
  /** Scheduled date+time for this dose */
  scheduledFor: ISODateTime;
}

export interface MedicationEvent {
  id: string;
  medicationId: string;
  scheduleId: string;
  scheduledFor: ISODateTime;
  status: MedicationEventStatus;
  /** When the patient action (taken/delayed/skipped) was recorded */
  actionAt?: ISODateTime;
  /** How completion was verified — MVP only supports patient confirmation */
  verificationMethod?: VerificationMethod;
  /** Free-text reason captured for a skip, optional */
  skipReason?: string;
}

// ---------------------------------------------------------------------------
// Appointments, investigations, scans
// ---------------------------------------------------------------------------

export type EventImportance = 'ROUTINE' | 'IMPORTANT' | 'CRITICAL';
export type AppointmentStatus = 'UPCOMING' | 'DUE' | 'ATTENDED' | 'MISSED' | 'RESCHEDULED';

export interface Appointment {
  id: string;
  carePlanId: string;
  title: string;
  clinicianName: string;
  location: string;
  scheduledFor: ISODateTime;
  status: AppointmentStatus;
  importance: EventImportance;
  prepChecklist: string[];
  notes?: string;
}

export type InvestigationKind = 'BLOOD_TEST' | 'URINE_TEST' | 'OTHER_TEST';
export type InvestigationStatus = 'UPCOMING' | 'DUE' | 'COMPLETED' | 'MISSED';

export interface Investigation {
  id: string;
  carePlanId: string;
  kind: InvestigationKind;
  title: string;
  location: string;
  scheduledFor: ISODateTime;
  status: InvestigationStatus;
  importance: EventImportance;
  resultSummary?: string;
  reportUploaded?: boolean;
}

export type ScanStatus = 'UPCOMING' | 'DUE' | 'COMPLETED' | 'MISSED';

export interface Scan {
  id: string;
  carePlanId: string;
  title: string;
  location: string;
  scheduledFor: ISODateTime;
  status: ScanStatus;
  importance: EventImportance;
  prepChecklist: string[];
  reportUploaded?: boolean;
}

// ---------------------------------------------------------------------------
// General care tasks (non-medication, non-appointment actionable items)
// ---------------------------------------------------------------------------

export type CareTaskStatus = 'UPCOMING' | 'DUE' | 'DONE' | 'MISSED';

export interface CareTask {
  id: string;
  carePlanId: string;
  title: string;
  description: string;
  scheduledFor: ISODateTime;
  status: CareTaskStatus;
  importance: EventImportance;
}

// ---------------------------------------------------------------------------
// Educational content
// ---------------------------------------------------------------------------

export type EducationCategory =
  | 'TRIMESTER_GUIDE'
  | 'NUTRITION'
  | 'ANTENATAL_VISITS'
  | 'DOCTOR_QUESTIONS'
  | 'WARNING_SIGNS';

export interface EducationalContent {
  id: string;
  category: EducationCategory;
  title: string;
  summary: string;
  body: string[];
  /** true for content that must direct to urgent care rather than self-management */
  isUrgentSafety: boolean;
}

// ---------------------------------------------------------------------------
// Adherence & escalation
// ---------------------------------------------------------------------------

export interface AdherenceRecord {
  /** ISO week key, e.g. "2026-W36" */
  weekKey: string;
  overallPct: number;
  byCategory: Partial<Record<CarePlanCategory, number>>;
  missedCount: number;
  completedCount: number;
  totalCount: number;
}

/**
 * Escalation pipeline stages, in strict forward order. A rule instance
 * advances one stage at a time as time passes without patient confirmation.
 */
export type EscalationStage =
  | 'REMINDER_SENT'
  | 'AWAITING_CONFIRMATION'
  | 'FOLLOW_UP_SENT'
  | 'STILL_MISSED'
  | 'CAREGIVER_NOTIFIED';

export interface EscalationRule {
  id: string;
  /** the medication event (or task) this escalation instance tracks */
  targetType: 'MEDICATION_EVENT' | 'APPOINTMENT' | 'CARE_TASK';
  targetId: string;
  targetLabel: string;
  stage: EscalationStage;
  history: EscalationHistoryEntry[];
  isDemo: boolean;
}

export interface EscalationHistoryEntry {
  stage: EscalationStage;
  at: ISODateTime;
  note: string;
}

// ---------------------------------------------------------------------------
// Verification & notifications (see src/services)
// ---------------------------------------------------------------------------

export type VerificationMethod = 'PATIENT_CONFIRMATION';

export type NotificationEventType =
  | 'REMINDER_SCHEDULED'
  | 'REMINDER_SENT'
  | 'FOLLOW_UP_SENT'
  | 'ESCALATION_TRIGGERED';

export interface NotificationEvent {
  id: string;
  type: NotificationEventType;
  targetLabel: string;
  message: string;
  at: ISODateTime;
}

export type NotificationChannel = 'IN_APP' | 'SMS_DEMO' | 'EMAIL_DEMO';

export interface NotificationPreferences {
  remindersEnabled: boolean;
  channel: NotificationChannel;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

// ---------------------------------------------------------------------------
// v2 additions
// ---------------------------------------------------------------------------

export type BpSymptom = 'HEADACHE' | 'VISION' | 'RIB_PAIN' | 'SWELLING' | 'BREATHLESS' | 'FITS';

export interface BpReading {
  id: string;
  at: ISODateTime;
  systolic: number;
  diastolic: number;
  pulse?: number;
  symptoms: BpSymptom[];
}

export type BpLevel = 'NORMAL' | 'HIGH' | 'SEVERE';

export interface MoodCheck {
  id: string;
  at: ISODateTime;
  answers: number[];
  score: number;
  item10: number;
}

export type PpiucdDecision = 'UNDECIDED' | 'YES' | 'NO' | 'MORE_INFO' | 'WITH_PARTNER';

export interface PpiucdState {
  decision: PpiucdDecision;
  updatedAt?: ISODateTime;
  questions?: string;
}

export type CounsellingKind = 'MENTAL_HEALTH' | 'COUPLE' | 'BREASTFEEDING' | 'FAMILY_PLANNING';

export interface CounsellingRequest {
  id: string;
  at: ISODateTime;
  kind: CounsellingKind;
  mode: 'IN_PERSON' | 'PHONE';
  preferredTime: 'MORNING' | 'AFTERNOON' | 'EVENING';
  partnerJoining: boolean;
  topics: string[];
  status: 'REQUESTED' | 'CONFIRMED';
}

export interface PrivacySettings {
  /** 4-digit PIN guarding sensitive screens; undefined = no PIN */
  pin?: string;
  lockSensitive: boolean;
  /** notifications say "You have an update" instead of naming medicines/topics */
  discreetNotifications: boolean;
  /** what the treating doctor can see in the doctor app */
  share: {
    bp: boolean;
    medicines: boolean;
    vaccines: boolean;
    mood: boolean;
    contraception: boolean;
    counselling: boolean;
  };
}

export type InboxKind = 'REMINDER' | 'FACT' | 'NEWS' | 'MOTIVATION' | 'ALERT' | 'SYSTEM';

export interface InboxItem {
  id: string;
  at: ISODateTime;
  kind: InboxKind;
  title: string;
  body: string;
  read: boolean;
  link?: string;
}
