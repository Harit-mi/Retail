const CACHE_NAME = "dukaanpos-v2";

// Install: Skip waiting immediately
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Activate: Clean all old caches and claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    })
  );
  self.clients.claim();
});

// Fetch: Pass through all localhost / dev requests straight to the network
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  // Never intercept local development or Vite HMR requests
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.port === "5173") {
    return;
  }

  // Production fallback
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
