const CACHE_NAME = 'walloon-guide-v1';

// Assets to cache immediately on installation
const PRECACHE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icon.png',
  '/walloon_parchment_bg.png',
  '/tour-guide-english-clean.md',
  '/tour-guide-czech-clean.md'
];

// Install event - precache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - cache-first strategy for static files, network-first for api/admin
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip POST requests and Chrome extensions or external requests
  if (event.request.method !== 'GET' || !url.origin.includes(self.location.origin)) {
    return;
  }

  // Bypass service worker for admin and api routes
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache-first for audio files and static images
  if (url.pathname.endsWith('.mp3') || url.pathname.endsWith('.wav') || url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg') || url.pathname.startsWith('/_next/static')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, cacheCopy);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Network-first falling back to cache for standard pages
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const cacheCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cacheCopy);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Listen for messages from client to trigger custom pre-downloading
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'DOWNLOAD_TOUR') {
    const urlsToDownload = event.data.urls || [];
    
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        let completed = 0;
        const total = urlsToDownload.length;
        
        return Promise.all(
          urlsToDownload.map((url) => {
            return cache.add(url)
              .then(() => {
                completed++;
                // Notify clients about download progress
                self.clients.matchAll().then((clients) => {
                  clients.forEach((client) => {
                    client.postMessage({
                      type: 'DOWNLOAD_PROGRESS',
                      url: url,
                      completed: completed,
                      total: total
                    });
                  });
                });
              })
              .catch((err) => {
                console.error(`Failed to cache asset ${url}:`, err);
              });
          })
        ).then(() => {
          self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({
                type: 'DOWNLOAD_COMPLETE',
                success: true
              });
            });
          });
        });
      })
    );
  }
});
