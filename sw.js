// PlatePlan service worker: keeps the app working offline.
const CACHE = "plateplan-v6";
const FILES = [
  "./", "./index.html", "./app.html", "./manifest.webmanifest",
  "./css/app.css", "./js/config.js", "./js/app.js", "./js/backend.js", "./js/illustrations.js",
  "./data/items.js", "./data/recipes.js", "./data/sample-offers.js",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Network first so updates show up straight away; the cache is the offline fallback.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const ours = url.origin === self.location.origin || url.hostname.endsWith("fonts.googleapis.com") || url.hostname.endsWith("fonts.gstatic.com") || url.hostname === "www.gstatic.com";
  if (!ours) return; // server calls and analytics are never cached
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("./app.html")))
  );
});
