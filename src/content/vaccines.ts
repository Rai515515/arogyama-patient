import type { LText } from '../i18n';

/**
 * India's National Immunization Schedule (Universal Immunization Programme).
 * Sources: MoHFW National Immunization Schedule; PIB "Celebrating the Power of
 * Vaccines" (17 Mar 2026), which lists Td (not TT) for pregnant women.
 */

export interface Vaccine {
  id: string;
  who: 'mother' | 'baby';
  /** short name shown on the stamp, kept in Latin script as printed on the MCP card */
  short: string;
  protects: LText;
  /** English group label, translated with t() */
  group: string;
  /** days after the anchor (mother: Td-1 date / first visit; baby: birth) */
  offsetDays: number;
  /** how long after the due day it still counts as "due" rather than "overdue" */
  graceDays: number;
  note?: LText;
}

const L = (en: string, ta: string, hi: string): LText => ({ en, ta, hi });

const POLIO = L('Polio', 'போலியோ', 'पोलियो');
const PENTA = L(
  'Diphtheria, whooping cough, tetanus, hepatitis B, Hib',
  'தொண்டை அடைப்பான், கக்குவான் இருமல், டெட்டனஸ், ஹெபடைடிஸ் B, Hib',
  'डिप्थीरिया, काली खाँसी, टिटनेस, हेपेटाइटिस B, Hib',
);
const ROTA = L('Rotavirus diarrhoea', 'ரோட்டாவைரஸ் வயிற்றுப்போக்கு', 'रोटावायरस दस्त');
const PCV = L('Pneumonia (pneumococcal)', 'நிமோனியா (நிமோகாக்கல்)', 'निमोनिया (न्यूमोकोकल)');
const MR = L('Measles, rubella', 'தட்டம்மை, ரூபெல்லா', 'खसरा, रूबेला');
const JE = L('Japanese encephalitis', 'ஜப்பானிய மூளைக்காய்ச்சல்', 'जापानी इंसेफ़ेलाइटिस');
const JE_NOTE = L('Only in districts where JE is common', 'JE அதிகமுள்ள மாவட்டங்களில் மட்டும்', 'सिर्फ़ उन ज़िलों में जहाँ JE आम है');
const VITA = L('Vitamin A supplement', 'வைட்டமின் A', 'विटामिन A');
const DPT = L('Diphtheria, whooping cough, tetanus', 'தொண்டை அடைப்பான், கக்குவான் இருமல், டெட்டனஸ்', 'डिप्थीरिया, काली खाँसी, टिटनेस');
const TD = L('Tetanus, diphtheria', 'டெட்டனஸ், தொண்டை அடைப்பான்', 'टिटनेस, डिप्थीरिया');

export const VACCINES: Vaccine[] = [
  // Mother
  { id: 'td1', who: 'mother', short: 'Td-1', protects: TD, group: 'Early in pregnancy', offsetDays: 0, graceDays: 28 },
  {
    id: 'td2',
    who: 'mother',
    short: 'Td-2',
    protects: TD,
    group: '4 weeks after Td-1',
    offsetDays: 28,
    graceDays: 28,
    note: L(
      'Or a single Td booster if you had 2 doses in a pregnancy within the last 3 years',
      'கடந்த 3 ஆண்டுகளுக்குள் ஒரு கர்ப்பத்தில் 2 டோஸ் போட்டிருந்தால், ஒரு பூஸ்டர் மட்டும் போதும்',
      'अगर पिछले 3 साल में किसी गर्भावस्था में 2 खुराक ली हों, तो सिर्फ़ एक बूस्टर',
    ),
  },

  // Baby — at birth
  { id: 'bcg', who: 'baby', short: 'BCG', protects: L('Tuberculosis', 'காசநோய்', 'टीबी'), group: 'At birth', offsetDays: 0, graceDays: 14 },
  { id: 'opv0', who: 'baby', short: 'OPV-0', protects: POLIO, group: 'At birth', offsetDays: 0, graceDays: 14 },
  {
    id: 'hepb0',
    who: 'baby',
    short: 'Hep B',
    protects: L('Hepatitis B', 'ஹெபடைடிஸ் B', 'हेपेटाइटिस B'),
    group: 'At birth',
    offsetDays: 0,
    graceDays: 1,
    note: L('Within 24 hours of birth', 'பிறந்து 24 மணி நேரத்துக்குள்', 'जन्म के 24 घंटे के अंदर'),
  },
  // 6 weeks
  { id: 'opv1', who: 'baby', short: 'OPV-1', protects: POLIO, group: '6 weeks', offsetDays: 42, graceDays: 14 },
  { id: 'penta1', who: 'baby', short: 'Penta-1', protects: PENTA, group: '6 weeks', offsetDays: 42, graceDays: 14 },
  { id: 'rvv1', who: 'baby', short: 'RVV-1', protects: ROTA, group: '6 weeks', offsetDays: 42, graceDays: 14 },
  { id: 'fipv1', who: 'baby', short: 'fIPV-1', protects: POLIO, group: '6 weeks', offsetDays: 42, graceDays: 14 },
  { id: 'pcv1', who: 'baby', short: 'PCV-1', protects: PCV, group: '6 weeks', offsetDays: 42, graceDays: 14 },
  // 10 weeks
  { id: 'opv2', who: 'baby', short: 'OPV-2', protects: POLIO, group: '10 weeks', offsetDays: 70, graceDays: 14 },
  { id: 'penta2', who: 'baby', short: 'Penta-2', protects: PENTA, group: '10 weeks', offsetDays: 70, graceDays: 14 },
  { id: 'rvv2', who: 'baby', short: 'RVV-2', protects: ROTA, group: '10 weeks', offsetDays: 70, graceDays: 14 },
  // 14 weeks
  { id: 'opv3', who: 'baby', short: 'OPV-3', protects: POLIO, group: '14 weeks', offsetDays: 98, graceDays: 14 },
  { id: 'penta3', who: 'baby', short: 'Penta-3', protects: PENTA, group: '14 weeks', offsetDays: 98, graceDays: 14 },
  { id: 'fipv2', who: 'baby', short: 'fIPV-2', protects: POLIO, group: '14 weeks', offsetDays: 98, graceDays: 14 },
  { id: 'rvv3', who: 'baby', short: 'RVV-3', protects: ROTA, group: '14 weeks', offsetDays: 98, graceDays: 14 },
  { id: 'pcv2', who: 'baby', short: 'PCV-2', protects: PCV, group: '14 weeks', offsetDays: 98, graceDays: 14 },
  // 9–12 months
  { id: 'mr1', who: 'baby', short: 'MR-1', protects: MR, group: '9–12 months', offsetDays: 274, graceDays: 90 },
  { id: 'je1', who: 'baby', short: 'JE-1', protects: JE, group: '9–12 months', offsetDays: 274, graceDays: 90, note: JE_NOTE },
  { id: 'pcvb', who: 'baby', short: 'PCV-B', protects: PCV, group: '9–12 months', offsetDays: 274, graceDays: 90 },
  { id: 'vita1', who: 'baby', short: 'Vit A', protects: VITA, group: '9–12 months', offsetDays: 274, graceDays: 90 },
  // 16–24 months
  { id: 'mr2', who: 'baby', short: 'MR-2', protects: MR, group: '16–24 months', offsetDays: 487, graceDays: 240 },
  { id: 'je2', who: 'baby', short: 'JE-2', protects: JE, group: '16–24 months', offsetDays: 487, graceDays: 240, note: JE_NOTE },
  { id: 'dptb1', who: 'baby', short: 'DPT-B1', protects: DPT, group: '16–24 months', offsetDays: 487, graceDays: 240 },
  { id: 'opvb', who: 'baby', short: 'OPV-B', protects: POLIO, group: '16–24 months', offsetDays: 487, graceDays: 240 },
  // 5–6 years
  { id: 'dptb2', who: 'baby', short: 'DPT-B2', protects: DPT, group: '5–6 years', offsetDays: 1826, graceDays: 365 },
];

export const VACCINE_GROUPS_MOTHER = ['Early in pregnancy', '4 weeks after Td-1'];
export const VACCINE_GROUPS_BABY = ['At birth', '6 weeks', '10 weeks', '14 weeks', '9–12 months', '16–24 months', '5–6 years'];

export type VaccineStatus = 'done' | 'due' | 'overdue' | 'upcoming' | 'expected';

const DAY = 86400000;

export interface VaccineRow {
  vaccine: Vaccine;
  dueOn: Date | null;
  doneOn?: string;
  status: VaccineStatus;
}

/**
 * Work out each vaccine's due date and status.
 * - Mother's Td is anchored on Td-1 (given, or "now" if not yet given).
 * - Baby's schedule is anchored on the birth date. Before birth we anchor on the
 *   due date and mark everything "expected".
 */
export function vaccineRows(opts: {
  records: Record<string, string | undefined>;
  stage: 'PREGNANT' | 'POSTPARTUM';
  dueDate: string;
  birthDate?: string;
  today?: Date;
}): VaccineRow[] {
  const today = opts.today ?? new Date();
  const td1Done = opts.records.td1;
  const motherAnchor = td1Done ? new Date(td1Done) : today;
  const babyAnchor = opts.birthDate ? new Date(opts.birthDate) : new Date(opts.dueDate);

  return VACCINES.map((v) => {
    const doneOn = opts.records[v.id];
    let dueOn: Date | null = null;
    if (v.who === 'mother') {
      dueOn = new Date(motherAnchor.getTime() + v.offsetDays * DAY);
    } else {
      dueOn = new Date(babyAnchor.getTime() + v.offsetDays * DAY);
    }
    let status: VaccineStatus;
    if (doneOn) status = 'done';
    else if (v.who === 'baby' && !opts.birthDate) status = 'expected';
    else if (v.who === 'mother' && opts.stage === 'POSTPARTUM' && !doneOn) status = 'overdue';
    else if (today.getTime() < dueOn.getTime() - DAY) status = 'upcoming';
    else if (today.getTime() <= dueOn.getTime() + v.graceDays * DAY) status = 'due';
    else status = 'overdue';
    return { vaccine: v, dueOn, doneOn, status };
  });
}

export function nextVaccineGroup(rows: VaccineRow[]): { group: string; who: 'mother' | 'baby'; dueOn: Date; rows: VaccineRow[] } | null {
  const pending = rows
    .filter((r) => r.status === 'due' || r.status === 'overdue' || r.status === 'upcoming' || r.status === 'expected')
    .sort((a, b) => {
      const rank = (s: VaccineStatus) => (s === 'overdue' ? 0 : s === 'due' ? 1 : 2);
      return rank(a.status) - rank(b.status) || (a.dueOn?.getTime() ?? 0) - (b.dueOn?.getTime() ?? 0);
    });
  const first = pending[0];
  if (!first || !first.dueOn) return null;
  const sameGroup = pending.filter((r) => r.vaccine.group === first.vaccine.group && r.vaccine.who === first.vaccine.who);
  return { group: first.vaccine.group, who: first.vaccine.who, dueOn: first.dueOn, rows: sameGroup };
}
