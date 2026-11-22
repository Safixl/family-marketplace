/* Service Worker приложения «Дейлики».
 * Стратегии:
 *  - навигация: network-first с фолбэком на закэшированную оболочку;
 *  - статика: stale-while-revalidate;
 *  - /api: всегда сеть, без кэша (данные пользователя не должны устаревать).
 */
const VERSION = 'v1';
const SHELL_CACHE = `fm-shell-${VERSION}`;
const ASSET_CACHE = `fm-assets-${VERSION}`;

const SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await Promise.allSettled(
        SHELL_URLS.map((url) => cache.add(new Request(url, { cache: 'reload' }))),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith('fm-') && key !== SHELL_CACHE && key !== ASSET_CACHE)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    void self.skipWaiting();
  }
});

function isStaticAsset(url, request) {
  if (url.pathname.startsWith('/assets/')) return true;
  if (url.pathname.startsWith('/icons/')) return true;
  if (url.pathname.startsWith('/splash/')) return true;
  return ['script', 'style', 'image', 'font', 'manifest'].includes(request.destination);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          const cache = await caches.open(SHELL_CACHE);
          await cache.put('/index.html', response.clone());
          return response;
        } catch {
          const cache = await caches.open(SHELL_CACHE);
          return (
            (await cache.match('/index.html')) ||
            (await cache.match('/')) ||
            new Response('Приложение недоступно офлайн', {
              status: 503,
              headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            })
          );
        }
      })(),
    );
    return;
  }

  if (isStaticAsset(url, request)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(ASSET_CACHE);
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((response) => {
            if (response && response.ok) {
              void cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => null);
        return cached || (await network) || Response.error();
      })(),
    );
  }
});
