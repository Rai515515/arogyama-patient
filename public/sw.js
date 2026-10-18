/* Arogyama service worker
 * - keeps the app shell available offline
 * - opens the right screen when a notification is tapped
 * - shows one daily fact/motivation via Periodic Background Sync (installed Android Chrome)
 */
const SHELL = 'arogyama-shell-v2';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((c) => c.addAll(['./', './index.html', './manifest.webmanifest']))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('arogyama-shell-') && k !== SHELL).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Network first for the page (so updates land), cache as fallback offline.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put('./index.html', copy)).catch(() => undefined);
          return res;
        })
        .catch(() => caches.match('./index.html')),
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.link) || '#/home';
  const target = new URL('./' + (link.startsWith('#') ? link : '#' + link), self.registration.scope).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) {
          c.navigate ? c.navigate(target) : undefined;
          return c.focus();
        }
      }
      return self.clients.openWindow(target);
    }),
  );
});

async function dailyNudge() {
  try {
    const cache = await caches.open('arogyama-data');
    const res = await cache.match('./__nudges');
    if (!res) return;
    const list = await res.json();
    if (!Array.isArray(list) || list.length === 0) return;
    const day = Math.floor(Date.now() / 86400000);
    const pick = list[day % list.length];
    await self.registration.showNotification(pick.title, {
      body: pick.body,
      tag: 'arogyama-daily',
      icon: './icon-192.png',
      badge: './icon-badge.png',
      data: { link: pick.link || '#/home' },
    });
  } catch (e) {
    /* nothing to show */
  }
}

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'arogyama-daily') event.waitUntil(dailyNudge());
});
