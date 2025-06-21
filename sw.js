const CACHE_NAME = 'sbb-clock-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/sbbUhr-1.3.js',
  '/favicon.png',
  '/manifest.json'
];

// Installazione: cache iniziale
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// Attivazione: pulizia vecchie cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

// Fetch: serve dalla cache se offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
