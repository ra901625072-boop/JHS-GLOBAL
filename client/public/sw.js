/**
 * Service Worker: Offline Resiliency & Static Asset Caching
 * 
 * Rules:
 * 1. Cache-First for versioned/hashed static assets, fonts, and images.
 * 2. Stale-While-Revalidate for public GET catalogue requests (/api/v1/products, /api/v1/categories, /api/v1/certificates).
 * 3. Network-First for HTML navigation requests with offline fallback.
 * 4. NEVER cache quotes, inquiries, orders, auth, or admin endpoints.
 */

const CACHE_NAME = 'export-b2b-static-v1';
const DATA_CACHE_NAME = 'export-b2b-data-v1';

const STATIC_PRECACHE = [
  '/',
  '/favicon.svg',
  '/fonts/plus-jakarta-sans-latin-400-normal.woff2',
  '/fonts/playfair-display-latin-600-normal.woff2',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_PRECACHE).catch(() => {});
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Strictly NEVER cache sensitive or administrative endpoints
  if (
    url.pathname.startsWith('/api/v1/auth') ||
    url.pathname.startsWith('/api/v1/admin') ||
    url.pathname.startsWith('/api/v1/inquiries') ||
    url.pathname.startsWith('/api/v1/quotations') ||
    url.pathname.startsWith('/api/v1/orders') ||
    url.pathname.startsWith('/api/v1/tasks') ||
    url.pathname.startsWith('/api/v1/customers')
  ) {
    return;
  }

  // 1. Static Assets (JS Chunks, CSS, Fonts, Images) -> Cache-First
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/fonts/') ||
    url.pathname.startsWith('/images/') ||
    request.destination === 'font' ||
    request.destination === 'image'
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 2. Public Catalogue GET Endpoints -> Stale-While-Revalidate
  if (
    url.pathname.startsWith('/api/v1/products') ||
    url.pathname.startsWith('/api/v1/categories') ||
    url.pathname.startsWith('/api/v1/certificates') ||
    url.pathname.startsWith('/api/v1/faqs') ||
    url.pathname.startsWith('/api/v1/company-facts')
  ) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 3. HTML Navigation requests -> Network-First
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/');
      })
    );
  }
});
