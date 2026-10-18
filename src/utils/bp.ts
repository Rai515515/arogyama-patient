import type { BpLevel, BpReading, BpSymptom } from '../domain/types';

/**
 * BP bands used by Arogyama. These decide only what we SAY (call today / go now),
 * never any medicine change.
 *  - High:   ≥140 systolic or ≥90 diastolic (WHO pre-eclampsia fact sheet; NICE NG133 postnatal target <140/90)
 *  - Severe: ≥160 systolic or ≥110 diastolic (ACOG severe range), OR any red-flag symptom
 */
export const URGENT_SYMPTOMS: BpSymptom[] = ['HEADACHE', 'VISION', 'RIB_PAIN', 'BREATHLESS', 'FITS'];

export function bpLevel(r: Pick<BpReading, 'systolic' | 'diastolic' | 'symptoms'>): BpLevel {
  if (r.systolic >= 160 || r.diastolic >= 110 || r.symptoms.some((s) => URGENT_SYMPTOMS.includes(s))) return 'SEVERE';
  if (r.systolic >= 140 || r.diastolic >= 90 || r.symptoms.includes('SWELLING')) return 'HIGH';
  return 'NORMAL';
}

export function isPlausibleBp(sys: number, dia: number): boolean {
  return sys >= 70 && sys <= 250 && dia >= 40 && dia <= 150 && sys > dia;
}

export function latestReading(readings: BpReading[]): BpReading | undefined {
  return [...readings].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())[0];
}
