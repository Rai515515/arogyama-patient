/**
 * Real phone/desktop notifications.
 *
 * What works without a server (this file):
 *  - Shown through the service worker (required on Android Chrome and on iPhone,
 *    where the app must be added to the Home Screen first).
 *  - Fired on time while the app is open or recently in the background.
 *  - A daily fact/motivation via Periodic Background Sync on installed Android
 *    Chrome apps (the browser decides the exact time, roughly once a day).
 *  - Calendar export (.ics) for alarms that ring even when the app is closed.
 *
 * What needs a push server (not in this demo): guaranteed delivery at an exact
 * time when the app has been closed for days.
 */

export type PermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export function notificationSupport(): { supported: boolean; needsInstall: boolean } {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    const ios = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);
    return { supported: false, needsInstall: ios };
  }
  return { supported: true, needsInstall: false };
}

export function permissionState(): PermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission as PermissionState;
}

export async function requestPermission(): Promise<PermissionState> {
  if (!('Notification' in window)) return 'unsupported';
  try {
    const result = await Notification.requestPermission();
    if (result === 'granted') void registerPeriodicSync();
    return result as PermissionState;
  } catch {
    return permissionState();
  }
}

let swReg: ServiceWorkerRegistration | null = null;

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  // Skip on the Vite dev server and inside sandboxed previews.
  if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return null;
  try {
    swReg = await navigator.serviceWorker.register('./sw.js', { scope: './' });
    return swReg;
  } catch {
    return null;
  }
}

async function registration(): Promise<ServiceWorkerRegistration | null> {
  if (swReg) return swReg;
  if (!('serviceWorker' in navigator)) return null;
  try {
    swReg = (await navigator.serviceWorker.getRegistration()) ?? null;
  } catch {
    swReg = null;
  }
  return swReg;
}

export interface NotifyOptions {
  tag?: string;
  /** app route to open when tapped, e.g. "#/bp" */
  link?: string;
  requireInteraction?: boolean;
}

/** Show a system notification. Returns false when the OS did not get it (permission, support). */
export async function showSystemNotification(title: string, body: string, opts: NotifyOptions = {}): Promise<boolean> {
  if (permissionState() !== 'granted') return false;
  const options: NotificationOptions & { renotify?: boolean } = {
    body,
    tag: opts.tag,
    icon: './icon-192.png',
    badge: './icon-badge.png',
    data: { link: opts.link ?? '#/home' },
    requireInteraction: opts.requireInteraction,
  };
  const reg = await registration();
  try {
    if (reg) {
      await reg.showNotification(title, options);
      return true;
    }
    // Desktop browsers without a service worker can still use the constructor.
    const n = new Notification(title, options);
    n.onclick = () => {
      window.focus();
      if (opts.link) location.hash = opts.link.replace(/^#/, '');
    };
    return true;
  } catch {
    return false;
  }
}

/** Store the daily nudge pool where the service worker can read it while the app is closed. */
export async function syncNudgesToWorker(nudges: { title: string; body: string; link?: string }[]): Promise<void> {
  if (!('caches' in window)) return;
  try {
    const cache = await caches.open('arogyama-data');
    await cache.put('./__nudges', new Response(JSON.stringify(nudges), { headers: { 'content-type': 'application/json' } }));
  } catch {
    /* storage unavailable — the in-app scheduler still covers open sessions */
  }
}

async function registerPeriodicSync(): Promise<void> {
  const reg = await registration();
  const periodic = (reg as unknown as { periodicSync?: { register: (tag: string, o: { minInterval: number }) => Promise<void> } })?.periodicSync;
  if (!periodic) return;
  try {
    await periodic.register('arogyama-daily', { minInterval: 20 * 60 * 60 * 1000 });
  } catch {
    /* only installed Chrome apps get this; silently fall back */
  }
}

export function periodicSyncLikely(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PeriodicSyncManager' in window;
}
