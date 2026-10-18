import type { VerificationMethod } from '../domain/types';

/**
 * CareExecutionVerificationProvider
 * ----------------------------------------------------------------------------
 * Abstraction over "how do we know a prescribed care action actually
 * happened?" The MVP ships exactly one provider: the patient tapping a
 * button in the app. This is explicitly labeled "Patient confirmed" in the
 * UI everywhere — we never claim to have verified physical ingestion,
 * attendance, or completion beyond the patient's self-report.
 *
 * Extension points (NOT implemented in the MVP — types/comments only):
 *
 *   - SmartPackagingProvider: would verify via smart blister-pack / pill
 *     dispenser sensor events (e.g. RFID cap-open detection). Would report
 *     verificationMethod: 'SMART_PACKAGING' and could carry a device id.
 *
 *   - WearableProvider: would corroborate scan/appointment attendance via
 *     geofence or wearable check-in data. Would report
 *     verificationMethod: 'WEARABLE_CHECKIN'.
 *
 *   - ComputerVisionProvider: would use on-device image recognition (e.g.
 *     photographing a pill in hand) as a soft confirmation signal, never a
 *     substitute for clinical verification. Would report
 *     verificationMethod: 'COMPUTER_VISION'.
 *
 * Any future provider must still surface clearly to the patient/clinician
 * what was actually confirmed and by what mechanism — never silently
 * upgrade a self-report into a stronger claim.
 */
export interface CareExecutionVerificationProvider {
  readonly id: VerificationMethod;
  /** Human label shown in the UI, e.g. "Patient confirmed" */
  readonly label: string;
  confirm(targetId: string, at: string): Promise<{ verificationMethod: VerificationMethod; confirmedAt: string }>;
}

/**
 * The only provider implemented for MVP. Records that the patient, and only
 * the patient, tapped "Taken" / "Attended" / "Done" in the app. No sensor,
 * camera, or third-party data is involved.
 */
export class PatientConfirmationProvider implements CareExecutionVerificationProvider {
  readonly id: VerificationMethod = 'PATIENT_CONFIRMATION';
  readonly label = 'Patient confirmed';

  async confirm(_targetId: string, at: string): Promise<{ verificationMethod: VerificationMethod; confirmedAt: string }> {
    return { verificationMethod: this.id, confirmedAt: at };
  }
}

export const patientConfirmationProvider = new PatientConfirmationProvider();
