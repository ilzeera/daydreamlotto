// DayDream Lotto Service Worker
const CACHE_NAME = 'daydream-lotto-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/privacy.html'
];

// Install — cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — serve from cache when offline, network first for API calls
self.addEventListener('fetch', event => {
  // Always go to network for Anthropic API calls
  if (event.request.url.includes('anthropic.com') || event.request.url.includes('fonts.googleapis.com')) {
    event.respondWith(fetch(event.request));
    return;
  }
  // Cache first for everything else
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    }).catch(() => caches.match('/index.html'))
  );
});
