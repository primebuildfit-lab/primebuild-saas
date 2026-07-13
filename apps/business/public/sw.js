/*
 * Eventra Business — service worker (Bloque 10/11).
 *
 * Deliberately conservative for an authenticated, multi-tenant, Shopify-embeddable
 * app. It NEVER caches authenticated data, auth flows, or cross-origin requests.
 * It provides an app-shell offline fallback for navigations and cache-first static
 * assets only. Registered by `PwaRuntime` ONLY in a top-level (non-embedded) window
 * — it must not interfere with the Shopify Admin iframe.
 *
 * Cache policy summary:
 *   - navigations (GET, mode=navigate)  → network-first, fall back to /offline.html
 *   - same-origin static assets          → stale-while-revalidate
 *   - /app/data, /auth, /webhooks, POST  → never touched (pass through to network)
 *   - cross-origin                        → never touched
 */
const VERSION = "eventra-business-v1";
const STATIC_CACHE = `${VERSION}-static`;
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/manifest.webmanifest", "/favicon.svg"];

// Never cache or intercept these path prefixes — they are private/auth/mutation surfaces.
const BYPASS_PREFIXES = ["/app/data", "/auth", "/webhooks", "/api"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
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
  if (request.method !== "GET") return; // never cache mutations

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // never touch cross-origin
  if (BYPASS_PREFIXES.some((p) => url.pathname.startsWith(p))) return; // private surfaces

  // App navigations: network-first with an offline app-shell fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL).then((r) => r || Response.error())),
    );
    return;
  }

  // Static assets: stale-while-revalidate.
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

// Allow the page to trigger an immediate activation after an update.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
