// TNTET 2026 Personal Coach - Service Worker
// Version: 1.2.0 (Offline-First SCERT Preparation Engine)

const CACHE_NAME = 'tntet-coach-cache-v1.2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

// Install Event: Pre-cache core application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching TNTET Coach application shell');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Non-critical cache add warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean up legacy caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing legacy cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Offline-first with Stale-While-Revalidate and Network Fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests (e.g. POST, PUT, DELETE)
  if (request.method !== 'GET') {
    return;
  }

  // Handle Chrome extension schemes or non-HTTP(S)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 1. Navigation Requests (Page loads / refreshes) -> Network First with App Shell Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback: serve cached index.html
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match('/index.html') || await cache.match('/');
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response(
            `<!DOCTYPE html>
            <html lang="ta">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>TNTET Coach (Offline)</title>
              <style>
                body { background: #0a0a0a; color: #fff; font-family: sans-serif; text-align: center; padding: 40px 20px; }
                .card { max-width: 480px; margin: 0 auto; background: #141414; padding: 30px; border-radius: 16px; border: 1px solid #c5a059; }
                h1 { color: #c5a059; font-size: 20px; margin-bottom: 12px; }
                p { color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.6; }
                button { background: #c5a059; color: #000; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 15px; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>TNTET 2026 Coach (Offline Mode)</h1>
                <p>இணைய இணைப்பு இல்லை. ஆனால் உங்கள் உள்ளூர் தரவுகள் (Local Storage) பாதுகாப்பாக உள்ளன.</p>
                <p>You are currently offline. Your diagnostic history, daily plans, and local questions remain intact.</p>
                <button onclick="window.location.reload()">மீண்டும் முயற்சிக்கவும் (Retry)</button>
              </div>
            </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // 2. Static Assets (Scripts, CSS, Fonts, Images, SVGs) -> Cache First / Stale-While-Revalidate
  const isStaticAsset = 
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|woff2|woff|ttf|json|webmanifest)$/i) ||
    url.origin.includes('fonts.googleapis.com') ||
    url.origin.includes('fonts.gstatic.com');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Default Handler: Network with Cache Fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Background Sync Event for offline data sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'tntet-sync-simulations') {
    console.log('[SW] Background sync triggered for TNTET offline simulation records');
  }
});
