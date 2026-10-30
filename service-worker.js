/* App CFCX · service worker
   Guarda la "cáscara" de la app para abrir rápido e instalarla.
   Nunca guarda la señal en vivo (HLS) ni YouTube. */
const CACHE = 'cfcx-v3';
const SHELL = [
  './',
  './index.html',
  './css/app.css',
  './js/config.js',
  './js/store.js',
  './js/canales.js',
  './js/monitor.js',
  './js/app.js',
  './manifest.webmanifest',
  './assets/icon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return; // externos: directo a red

  // Red primero (contenido siempre al día); caché solo si no hay conexión.
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copia = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copia)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html')))
  );
});
