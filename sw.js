// ============================================================
//  RELEASING AN UPDATE: change VERSION below (v4 -> v5, etc.)
//  every time you upload changed files. That's what tells
//  installed copies there's a new version to offer.
// ============================================================
const VERSION = 'v4';
const CACHE = 'pfs-tracker-' + VERSION;
const FILES = [
  './', './index.html', './manifest.json', './catalog.js',
  './lib/qrcode.js', './lib/jsQR.js',
  './icon.svg', './icon-192.png', './icon-512.png'
];

// Download the new version in the background. It waits until the
// person taps "Update" in the app (or on first install, starts right away).
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('pfs-tracker') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
  if (e.data === 'VERSION' && e.ports[0]) e.ports[0].postMessage(VERSION);
});

// Serve the installed version's files first so the app stays consistent
// until the person chooses to update. Anything not cached goes to the network.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(c => c.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).catch(() => c.match('./index.html'))))
  );
});
