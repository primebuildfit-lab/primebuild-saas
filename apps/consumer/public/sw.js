/*
 * Eventra Calendar (Consumer) — service worker.
 *
 * A client-only SPA served from static hosting. This worker gives the installed
 * app an offline shell and fast repeat loads, without ever caching mutations or
 * cross-origin requests.
 *
 * Cache policy:
 *   - navigations (GET, mode=navigate) → network-first, fall back to cached shell
 *     ("/") and finally to /offline.html
 *   - same-origin static assets         → stale-while-revalidate
 *   - non-GET / cross-origin            → passthrough (never touched)
 */
const VERSION = "eventra-calendar-v1";
const STATIC_CACHE = `${VERSION}-static`;
const OFFLINE_URL = "/offline.html";
const APP_SHELL = "/";
const PRECACHE = [APP_SHELL, OFFLINE_URL, "/manifest.webmanifest", "/favicon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:css|js|svg|png|ico|woff2?)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // SPA navigations: network-first, fall back to the cached app shell, then offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches
          .match(APP_SHELL)
          .then((r) => r || caches.match(OFFLINE_URL))
          .then((r) => r || Response.error()),
      ),
    );
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res && res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
  }
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
