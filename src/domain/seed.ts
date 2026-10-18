import type {
  User,
  Pregnancy,
  CarePlan,
  Medication,
  MedicationEvent,
  Appointment,
  Investigation,
  Scan,
  CareTask,
  Caregiver,
  NotificationPreferences,
  Stage,
  BpReading,
  PrivacySettings,
  PpiucdState,
} from './types';

// ----------------------------------------------------------------------------
// Fictional demo data. "Ananya", treated by Dr. Meera Sharma at Arogyama
// Women's Health Centre. She has pregnancy-related high BP (on labetalol), which
// carries into the 40 days after delivery. Everything is invented.
//
// v2: the care plan is generated for whatever stage she starts the app at —
// any week of pregnancy, or any day after delivery.
// ----------------------------------------------------------------------------

const DAY = 86400000;

function at(days: number, hour = 9, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function dateOnly(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const DEMO_USER_ID = 'user-ananya';
export const DEMO_PREGNANCY_ID = 'pregnancy-1';
export const DEMO_CAREPLAN_ID = 'careplan-1';
const DOCTOR = 'Dr. Meera Sharma';
const CLINIC = 'Arogyama Women’s Health Centre';

/** Default demo stage: 24 weeks pregnant. */
const DEFAULT_WEEKS = 24;

export function dueDateForWeeks(weeks: number): string {
  return dateOnly((40 - weeks) * 7);
}

export function seedUser(): User {
  return {
    id: DEMO_USER_ID,
    name: 'Ananya',
    hospitalNo: '204517-K',
    stage: 'PREGNANT',
    dueDate: dueDateForWeeks(DEFAULT_WEEKS),
    lastMenstrualPeriod: dateOnly(-DEFAULT_WEEKS * 7),
    doctorName: DOCTOR,
    clinicName: CLINIC,
    phone: '+91 98xxxxxx10',
    createdAt: new Date().toISOString(),
    onboardingComplete: false,
  };
}

export function seedPregnancy(): Pregnancy {
  return {
    id: DEMO_PREGNANCY_ID,
    userId: DEMO_USER_ID,
    dueDate: dueDateForWeeks(DEFAULT_WEEKS),
    lastMenstrualPeriod: dateOnly(-DEFAULT_WEEKS * 7),
    isHighRisk: true,
  };
}

export function seedCarePlan(): CarePlan {
  return {
    id: DEMO_CAREPLAN_ID,
    userId: DEMO_USER_ID,
    prescribedBy: DOCTOR,
    prescribedAt: at(-14),
    notes: 'Care plan for pregnancy with raised blood pressure.',
  };
}

export function seedCaregivers(): Caregiver[] {
  return [{ id: 'caregiver-1', name: 'Rohan', relationship: 'Spouse/Partner', phone: '+91 98xxxxxx22', notifyOnEscalation: true }];
}

export function seedNotificationPrefs(): NotificationPreferences {
  return { remindersEnabled: true, channel: 'IN_APP', quietHoursStart: '22:00', quietHoursEnd: '07:00' };
}

export function seedPrivacy(): PrivacySettings {
  return {
    pin: undefined,
    lockSensitive: true,
    discreetNotifications: false,
    share: { bp: true, medicines: true, vaccines: true, mood: false, contraception: false, counselling: false },
  };
}

export function seedPpiucd(): PpiucdState {
  return { decision: 'UNDECIDED' };
}

// ---------------------------------------------------------------------------
// Stage-aware plan
// ---------------------------------------------------------------------------

export interface StageContext {
  stage: Stage;
  /** completed gestational weeks today (pregnant) */
  weeks: number;
  /** days since delivery (postpartum) */
  ppDay: number;
}

export function stageContext(stage: Stage, dueDate: string, deliveryDate?: string, today = new Date()): StageContext {
  if (stage === 'POSTPARTUM' && deliveryDate) {
    const d = new Date(deliveryDate);
    const ppDay = Math.max(0, Math.floor((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) / DAY));
    return { stage, weeks: 40, ppDay };
  }
  const due = new Date(dueDate);
  const daysLeft = Math.round((Date.UTC(due.getFullYear(), due.getMonth(), due.getDate()) - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) / DAY);
  const weeks = Math.max(0, Math.min(42, Math.floor((280 - daysLeft) / 7)));
  return { stage, weeks, ppDay: 0 };
}

export function seedMedications(ctx: StageContext = { stage: 'PREGNANT', weeks: DEFAULT_WEEKS, ppDay: 0 }): Medication[] {
  const meds: Medication[] = [];
  const base = { carePlanId: DEMO_CAREPLAN_ID, prescribedBy: DOCTOR, active: true, startDate: dateOnly(-30) };
  if (ctx.stage === 'PREGNANT' && ctx.weeks < 13) {
    meds.push({
      ...base,
      id: 'med-folic',
      name: 'Folic acid',
      dosage: '1 tablet',
      category: 'SUPPLEMENT',
      frequency: 'ONCE_DAILY',
      timesOfDay: ['09:00'],
      instructions: 'Take every day in the first three months.',
    });
    return meds;
  }
  meds.push({
    ...base,
    id: 'med-iron-folic',
    name: 'Iron & Folic Acid',
    dosage: '1 tablet',
    category: 'SUPPLEMENT',
    frequency: 'ONCE_DAILY',
    timesOfDay: ['09:00'],
    instructions: ctx.stage === 'POSTPARTUM' ? 'Continue for 180 days after delivery.' : 'Take with water, after breakfast.',
  });
  meds.push({
    ...base,
    id: 'med-calcium',
    name: 'Calcium + Vitamin D3',
    dosage: '500 mg',
    category: 'SUPPLEMENT',
    frequency: 'TWICE_DAILY',
    timesOfDay: ['09:00', '20:00'],
    instructions: 'Keep 2 hours away from the iron tablet.',
  });
  if (ctx.stage === 'POSTPARTUM' || ctx.weeks >= 20) {
    meds.push({
      ...base,
      id: 'med-labetalol',
      name: 'Labetalol',
      dosage: '100 mg',
      category: 'MEDICINE',
      frequency: 'TWICE_DAILY',
      timesOfDay: ['08:00', '19:00'],
      startDate: dateOnly(-10),
      instructions: 'For blood pressure. Do not stop on your own.',
    });
  }
  return meds;
}

/**
 * A week of dose events (3 days back, today, 3 days forward) with a realistic
 * mix of statuses so every screen has something to show.
 */
export function seedMedicationEvents(meds: Medication[]): MedicationEvent[] {
  const events: MedicationEvent[] = [];
  const now = new Date();
  for (const med of meds) {
    for (let dayOffset = -3; dayOffset <= 3; dayOffset++) {
      med.timesOfDay.forEach((time, idx) => {
        const [h, m] = time.split(':').map(Number);
        const d = new Date();
        d.setDate(d.getDate() + dayOffset);
        d.setHours(h, m, 0, 0);
        const id = `${med.id}-d${dayOffset}-${idx}`;
        let status: MedicationEvent['status'] = 'UPCOMING';
        let actionAt: string | undefined;
        let verificationMethod: MedicationEvent['verificationMethod'];
        let skipReason: string | undefined;
        if (dayOffset < 0) {
          if (med.id === 'med-calcium' && dayOffset === -1 && idx === 1) {
            status = 'DELAYED';
            const a = new Date(d);
            a.setHours(h + 2, m, 0, 0);
            actionAt = a.toISOString();
            verificationMethod = 'PATIENT_CONFIRMATION';
          } else if (med.id === 'med-labetalol' && dayOffset === -2 && idx === 0) {
            status = 'MISSED';
          } else if (med.id === 'med-iron-folic' && dayOffset === -1) {
            status = 'SKIPPED';
            skipReason = 'Felt nauseated';
            actionAt = d.toISOString();
            verificationMethod = 'PATIENT_CONFIRMATION';
          } else {
            status = 'TAKEN';
            actionAt = d.toISOString();
            verificationMethod = 'PATIENT_CONFIRMATION';
          }
        } else if (dayOffset === 0) {
          if (d.getTime() < now.getTime() - 30 * 60 * 1000) {
            // earlier today: confirmed if long past (the demo opens mid-day), due if recent
            if (now.getTime() - d.getTime() > 3 * 60 * 60 * 1000) {
              status = 'TAKEN';
              actionAt = d.toISOString();
              verificationMethod = 'PATIENT_CONFIRMATION';
            } else status = 'DUE';
          } else if (d.getTime() < now.getTime() + 30 * 60 * 1000) {
            status = 'DUE';
          }
        }
        events.push({ id, medicationId: med.id, scheduleId: `sched-${id}`, scheduledFor: d.toISOString(), status, actionAt, verificationMethod, skipReason });
      });
    }
  }
  return events;
}

/** Days from today to the next 9th of the month (PMSMA day). */
function daysToNext9th(): number {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), 9);
  if (target.getTime() <= new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) target.setMonth(target.getMonth() + 1);
  return Math.round((target.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / DAY);
}

const ROOM = `${CLINIC}, Room 4`;

export function seedAppointments(ctx: StageContext = { stage: 'PREGNANT', weeks: DEFAULT_WEEKS, ppDay: 0 }): Appointment[] {
  const base = { carePlanId: DEMO_CAREPLAN_ID, clinicianName: DOCTOR, location: ROOM };
  if (ctx.stage === 'POSTPARTUM') {
    const d = ctx.ppDay;
    const visit = (id: string, title: string, dayAfterBirth: number, importance: Appointment['importance'], prep: string[]): Appointment => {
      const offset = dayAfterBirth - d;
      return {
        ...base,
        id,
        title,
        scheduledFor: at(offset, 10, 30),
        status: offset < 0 ? 'ATTENDED' : 'UPCOMING',
        importance,
        prepChecklist: prep,
      };
    };
// i18n-list
    return [
      visit('pnc-1', 'Postnatal check-up (day 2–3)', 3, 'IMPORTANT', ['Bring your BP readings', 'Note any bleeding or fever']),
      visit('pnc-2', 'Postnatal check-up (week 1–2)', 10, 'IMPORTANT', ['Bring your BP readings', 'Bring baby’s vaccination card', 'Write down questions about feeding']),
      visit('pnc-3', 'Postnatal check-up and BP review (week 6)', 42, 'CRITICAL', ['Bring your BP readings', 'Bring baby for 6-week vaccines', 'Ask about contraception']),
    ];
// end-i18n-list
  }
  const list: Appointment[] = [
    {
      ...base,
      id: 'appt-anc-past',
      title: 'Antenatal check-up',
      scheduledFor: at(-7, 11, 0),
      status: 'ATTENDED',
      importance: 'IMPORTANT',
      prepChecklist: ['Bring previous reports', 'Note any new symptoms', 'List current medicines'],
    },
    {
      ...base,
      id: 'appt-anc-upcoming',
      title: 'Antenatal check-up',
      scheduledFor: at(4, 11, 30),
      status: 'UPCOMING',
      importance: 'IMPORTANT',
      prepChecklist: ['Bring your care card', 'Bring your BP readings', 'Bring latest blood test report', 'Write down any questions for your doctor'],
    },
    {
      ...base,
      id: 'appt-pmsma',
      title: 'PMSMA free check-up (9th of the month)',
      clinicianName: 'Government health centre',
      location: 'Nearest PHC / government hospital',
      scheduledFor: at(daysToNext9th(), 9, 30),
      status: 'UPCOMING',
      importance: 'ROUTINE',
      prepChecklist: ['Carry your care card', 'Free tests, scan and medicines'],
    },
  ];
  if (ctx.weeks >= 28) {
    list.push({
      ...base,
      id: 'appt-birthplan',
      title: 'Birth plan and contraception talk',
      scheduledFor: at(9, 11, 0),
      status: 'UPCOMING',
      importance: 'IMPORTANT',
      prepChecklist: ['Decide who will stay with you', 'Ask about first-hour breastfeeding', 'Ask about PPIUCD'],
    });
  }
  return list;
}

export function seedInvestigations(ctx: StageContext = { stage: 'PREGNANT', weeks: DEFAULT_WEEKS, ppDay: 0 }): Investigation[] {
  const base = { carePlanId: DEMO_CAREPLAN_ID, location: 'Arogyama Diagnostics Lab' };
  if (ctx.stage === 'POSTPARTUM') {
    return [
      {
        ...base,
        id: 'test-hb-pp',
        kind: 'BLOOD_TEST',
        title: 'Haemoglobin check',
        scheduledFor: at(42 - ctx.ppDay, 8, 30),
        status: 42 - ctx.ppDay < 0 ? 'COMPLETED' : 'UPCOMING',
        importance: 'ROUTINE',
      },
    ];
  }
  if (ctx.weeks < 13) {
    return [
      { ...base, id: 'test-first', kind: 'BLOOD_TEST', title: 'First antenatal blood tests', scheduledFor: at(3, 8, 0), status: 'UPCOMING', importance: 'IMPORTANT' },
    ];
  }
  const list: Investigation[] = [
    {
      ...base,
      id: 'test-cbc-past',
      kind: 'BLOOD_TEST',
      title: 'Complete blood count',
      scheduledFor: at(-5, 8, 30),
      status: 'COMPLETED',
      importance: 'ROUTINE',
      resultSummary: 'Reviewed by Dr. Sharma at last visit.',
      reportUploaded: true,
    },
    { ...base, id: 'test-urine', kind: 'URINE_TEST', title: 'Urine protein test', scheduledFor: at(4, 9, 0), status: 'UPCOMING', importance: 'IMPORTANT' },
  ];
  if (ctx.weeks <= 28) {
    list.push({ ...base, id: 'test-glucose-upcoming', kind: 'BLOOD_TEST', title: 'Oral glucose tolerance test', scheduledFor: at(6, 8, 0), status: 'UPCOMING', importance: 'IMPORTANT' });
  }
  return list;
}

export function seedScans(ctx: StageContext = { stage: 'PREGNANT', weeks: DEFAULT_WEEKS, ppDay: 0 }): Scan[] {
  if (ctx.stage === 'POSTPARTUM') return [];
  const base = { carePlanId: DEMO_CAREPLAN_ID, location: 'Arogyama Imaging Centre' };
  if (ctx.weeks < 14) {
    return [
      { ...base, id: 'scan-nt', title: 'Dating and NT scan', scheduledFor: at(5, 10, 0), status: 'UPCOMING', importance: 'IMPORTANT', prepChecklist: ['Drink water before the scan'] },
    ];
  }
  const list: Scan[] = [];
  if (ctx.weeks >= 20) {
    list.push({
      ...base,
      id: 'scan-anomaly-past',
      title: 'Anomaly scan',
      scheduledFor: at(-(ctx.weeks - 20) * 7 - 3, 10, 0),
      status: 'COMPLETED',
      importance: 'IMPORTANT',
      prepChecklist: ['Drink water before the scan', 'Bring previous scan reports'],
      reportUploaded: true,
    });
    list.push({
      ...base,
      id: 'scan-growth-upcoming',
      title: 'Growth scan',
      scheduledFor: at(2, 10, 30),
      status: 'UPCOMING',
      importance: 'IMPORTANT',
      prepChecklist: ['Arrive 15 minutes early', 'Bring your care card'],
    });
  } else {
    list.push({
      ...base,
      id: 'scan-anomaly',
      title: 'Anomaly scan',
      scheduledFor: at((20 - ctx.weeks) * 7, 10, 0),
      status: 'UPCOMING',
      importance: 'IMPORTANT',
      prepChecklist: ['Drink water before the scan', 'Bring previous scan reports'],
    });
  }
  return list;
}

export function seedCareTasks(ctx: StageContext = { stage: 'PREGNANT', weeks: DEFAULT_WEEKS, ppDay: 0 }): CareTask[] {
  const base = { carePlanId: DEMO_CAREPLAN_ID };
  if (ctx.stage === 'POSTPARTUM') {
    return [
      { ...base, id: 'task-bp-today', title: 'Check and log your BP', description: 'Sit for 5 minutes, then check. Log it in the app.', scheduledFor: at(0, 18, 0), status: 'UPCOMING', importance: 'IMPORTANT' },
      { ...base, id: 'task-bp-tomorrow', title: 'Check and log your BP', description: 'Sit for 5 minutes, then check. Log it in the app.', scheduledFor: at(1, 18, 0), status: 'UPCOMING', importance: 'IMPORTANT' },
      { ...base, id: 'task-mood', title: 'Weekly mood check', description: 'Ten short questions, about 3 minutes.', scheduledFor: at(2, 20, 0), status: 'UPCOMING', importance: 'ROUTINE' },
      { ...base, id: 'task-rest', title: 'Rest when the baby sleeps', description: 'Ask family to take one night feed or the housework.', scheduledFor: at(-1, 14, 0), status: 'DONE', importance: 'ROUTINE' },
    ];
  }
  const list: CareTask[] = [
    { ...base, id: 'task-walk', title: '20-minute gentle walk', description: 'Light activity, as advised by your doctor.', scheduledFor: at(-1, 18, 0), status: 'DONE', importance: 'ROUTINE' },
  ];
  if (ctx.weeks >= 20) {
    list.push({ ...base, id: 'task-bp', title: 'Check and log your BP', description: 'Sit for 5 minutes, then check. Log it in the app.', scheduledFor: at(0, 18, 30), status: 'UPCOMING', importance: 'IMPORTANT' });
  }
  if (ctx.weeks >= 28) {
    list.push({ ...base, id: 'task-kick-count', title: 'Count baby’s movements', description: 'Note how often your baby moves. Less movement than usual means call your doctor.', scheduledFor: at(0, 20, 0), status: 'UPCOMING', importance: 'ROUTINE' });
    list.push({ ...base, id: 'task-bag', title: 'Pack your hospital bag', description: 'Care card, reports, clothes for you and baby.', scheduledFor: at(3, 17, 0), status: 'UPCOMING', importance: 'ROUTINE' });
  }
  if (ctx.weeks >= 24) {
    list.push({ ...base, id: 'task-ppiucd', title: 'Think about spacing after birth', description: 'Read about the postpartum Copper-T and note your questions.', scheduledFor: at(1, 20, 0), status: 'UPCOMING', importance: 'ROUTINE' });
  }
  return list;
}

/** Vaccines already given, by vaccine id → ISO date. */
export function seedVaccineRecords(ctx: StageContext, deliveryDate?: string): Record<string, string | undefined> {
  const rec: Record<string, string | undefined> = {};
  if (ctx.stage === 'PREGNANT') {
    if (ctx.weeks >= 18) rec.td1 = dateOnly(-35);
    if (ctx.weeks >= 32) rec.td2 = dateOnly(-7);
    return rec;
  }
  rec.td1 = dateOnly(-ctx.ppDay - 120);
  rec.td2 = dateOnly(-ctx.ppDay - 92);
  if (deliveryDate) {
    rec.bcg = deliveryDate;
    rec.opv0 = deliveryDate;
    rec.hepb0 = deliveryDate;
  }
  if (ctx.ppDay >= 50 && deliveryDate) {
    const d6 = new Date(new Date(deliveryDate).getTime() + 43 * DAY).toISOString().slice(0, 10);
    for (const id of ['opv1', 'penta1', 'rvv1', 'fipv1', 'pcv1']) rec[id] = d6;
  }
  return rec;
}

/** A believable BP history for the demo patient. */
export function seedBpReadings(ctx: StageContext): BpReading[] {
  const pattern: [number, number, number][] =
    ctx.stage === 'POSTPARTUM'
      ? [
          [-6, 146, 94],
          [-5, 142, 92],
          [-4, 138, 88],
          [-3, 152, 98],
          [-2, 136, 86],
          [-1, 134, 86],
        ]
      : [
          [-9, 128, 82],
          [-7, 132, 84],
          [-5, 138, 88],
          [-3, 142, 92],
          [-1, 136, 86],
        ];
  const maxBack = ctx.stage === 'POSTPARTUM' ? ctx.ppDay : 30;
  return pattern
    .filter(([d]) => -d <= Math.max(maxBack, 1))
    .map(([d, s, di], i) => ({ id: `bp-seed-${i}`, at: at(d, 8, 15), systolic: s, diastolic: di, pulse: 82, symptoms: [] }));
}

export interface StagePlan {
  medications: Medication[];
  medicationEvents: MedicationEvent[];
  appointments: Appointment[];
  investigations: Investigation[];
  scans: Scan[];
  careTasks: CareTask[];
  vaccineRecords: Record<string, string | undefined>;
  bpReadings: BpReading[];
}

export function buildStagePlan(stage: Stage, dueDate: string, deliveryDate?: string): StagePlan {
  const ctx = stageContext(stage, dueDate, deliveryDate);
  const medications = seedMedications(ctx);
  return {
    medications,
    medicationEvents: seedMedicationEvents(medications),
    appointments: seedAppointments(ctx),
    investigations: seedInvestigations(ctx),
    scans: seedScans(ctx),
    careTasks: seedCareTasks(ctx),
    vaccineRecords: seedVaccineRecords(ctx, deliveryDate),
    bpReadings: seedBpReadings(ctx),
  };
}
