import type { ComponentType, SVGProps } from 'react';
import { CheckIcon, ClockIcon, CircleIcon, AlertIcon, XIcon } from './icons';

export type CareVisualState = 'done' | 'due' | 'upcoming' | 'missed' | 'skipped';

/** Maps every status enum used across the domain model to one shared visual language. */
export function visualStateFor(status: string): CareVisualState {
  switch (status) {
    case 'TAKEN':
    case 'DELAYED':
    case 'ATTENDED':
    case 'COMPLETED':
    case 'DONE':
      return 'done';
    case 'DUE':
      return 'due';
    case 'MISSED':
      return 'missed';
    case 'SKIPPED':
      return 'skipped';
    default:
      return 'upcoming';
  }
}

export const STATE_ICON: Record<CareVisualState, ComponentType<SVGProps<SVGSVGElement>>> = {
  done: CheckIcon,
  due: ClockIcon,
  upcoming: CircleIcon,
  missed: AlertIcon,
  skipped: XIcon,
};

export const STATE_LABEL_CLASS: Record<CareVisualState, string> = {
  done: 'state-done',
  due: 'state-due',
  upcoming: 'state-upcoming',
  missed: 'state-missed',
  skipped: 'state-skipped',
};
