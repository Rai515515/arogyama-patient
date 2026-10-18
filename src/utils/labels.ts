/** English labels for enums; wrap the result in t() at the call site. */
export function categoryLabel(cat: string): string {
  switch (cat) {
    case 'MEDICINE':
      return 'Medicine';
    case 'SUPPLEMENT':
      return 'Supplement';
    case 'SCAN':
      return 'Scan';
    case 'TEST':
      return 'Test';
    case 'APPOINTMENT':
      return 'Visit';
    case 'CARE_TASK':
      return 'Care task';
    default:
      return cat;
  }
}

export function medStatusLabel(status: string): string {
  switch (status) {
    case 'TAKEN':
      return 'Taken';
    case 'DELAYED':
      return 'Taken late';
    case 'SKIPPED':
      return 'Skipped';
    case 'MISSED':
      return 'Missed';
    case 'DUE':
      return 'Due now';
    case 'ATTENDED':
      return 'Attended';
    case 'COMPLETED':
      return 'Completed';
    case 'DONE':
      return 'Done';
    default:
      return 'Upcoming';
  }
}

export function frequencyLabel(freq: string): string {
  switch (freq) {
    case 'ONCE_DAILY':
      return 'Once a day';
    case 'TWICE_DAILY':
      return 'Twice a day';
    case 'THRICE_DAILY':
      return 'Three times a day';
    case 'WEEKLY':
      return 'Once a week';
    default:
      return freq;
  }
}

export function stripDosage(title: string): string {
  return title.replace(/\s*\([^)]*\)\s*$/, '');
}
