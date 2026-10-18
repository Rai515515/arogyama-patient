import type { NotificationEvent, NotificationEventType } from '../domain/types';

/**
 * NotificationService
 * ----------------------------------------------------------------------------
 * Abstraction for the reminder / follow-up / escalation messaging pipeline.
 * The MVP has no real push/SMS/email integration — instead it appends
 * structured events to an in-app notification/event log that the UI (Home,
 * Escalation demo) can render as a transparent audit trail of what "would"
 * have been sent. A real backend swap-in would implement the same interface
 * against actual push/SMS/email providers.
 */
export interface NotificationService {
  scheduleReminder(targetLabel: string, forTime: string): NotificationEvent;
  sendFollowUp(targetLabel: string): NotificationEvent;
  triggerEscalation(targetLabel: string, caregiverName?: string): NotificationEvent;
  getLog(): NotificationEvent[];
}

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `notif-${Date.now()}-${idCounter}`;
}

function buildEvent(type: NotificationEventType, targetLabel: string, message: string): NotificationEvent {
  return {
    id: nextId(),
    type,
    targetLabel,
    message,
    at: new Date().toISOString(),
  };
}

/**
 * In-memory + caller-supplied-log implementation. The store (Zustand) owns
 * persistence of the returned events into `notificationLog`; this service is
 * a stateless event factory so it stays swappable.
 */
export class InAppNotificationService implements NotificationService {
  private log: NotificationEvent[] = [];

  scheduleReminder(targetLabel: string, forTime: string): NotificationEvent {
    const event = buildEvent(
      'REMINDER_SCHEDULED',
      targetLabel,
      `Reminder scheduled for "${targetLabel}" at ${new Date(forTime).toLocaleString()}.`,
    );
    this.log.push(event);
    return event;
  }

  sendFollowUp(targetLabel: string): NotificationEvent {
    const event = buildEvent(
      'FOLLOW_UP_SENT',
      targetLabel,
      `No confirmation received for "${targetLabel}" — a gentle follow-up reminder was sent.`,
    );
    this.log.push(event);
    return event;
  }

  triggerEscalation(targetLabel: string, caregiverName?: string): NotificationEvent {
    const who = caregiverName ? `caregiver ${caregiverName}` : 'the registered caregiver';
    const event = buildEvent(
      'ESCALATION_TRIGGERED',
      targetLabel,
      `[Demo] "${targetLabel}" is still unconfirmed. In a live deployment, ${who} would be notified now.`,
    );
    this.log.push(event);
    return event;
  }

  getLog(): NotificationEvent[] {
    return [...this.log];
  }
}

export const notificationService = new InAppNotificationService();
