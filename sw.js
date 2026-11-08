/* Refuge : fonctionnement hors ligne de l’appli.
   La carte (carte.pmtiles) est enregistrée à part, par le bouton « Télécharger la carte ». */
const VERSION = "refuge-app-v2";
const SHELL = [
  "./",
  "assets/fonts/Noto%20Sans%20Italic/0-255.pbf",
  "assets/fonts/Noto%20Sans%20Italic/256-511.pbf",
  "assets/fonts/Noto%20Sans%20Italic/8192-8447.pbf",
  "assets/fonts/Noto%20Sans%20Medium/0-255.pbf",
  "assets/fonts/Noto%20Sans%20Medium/256-511.pbf",
  "assets/fonts/Noto%20Sans%20Medium/8192-8447.pbf",
  "assets/fonts/Noto%20Sans%20Regular/0-255.pbf",
  "assets/fonts/Noto%20Sans%20Regular/256-511.pbf",
  "assets/fonts/Noto%20Sans%20Regular/8192-8447.pbf",
  "assets/sprites/dark@2x.json",
  "assets/sprites/dark@2x.png",
  "assets/sprites/dark.json",
  "assets/sprites/dark.png",
  "assets/sprites/light@2x.json",
  "assets/sprites/light@2x.png",
  "assets/sprites/light.json",
  "assets/sprites/light.png",
  "fonts/atkinson-400.woff2",
  "fonts/atkinson-700.woff2",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "index.html",
  "manifest.webmanifest",
  "vendor/basemaps.js",
  "vendor/maplibre-gl.css",
  "vendor/maplibre-gl.js",
  "vendor/pmtiles.js"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== VERSION && k !== "refuge-carte").map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET") return;
  const url = new URL(req.url);
  if(url.origin !== location.origin) return;
  if(url.pathname.endsWith(".pmtiles")) return; // téléchargement de la carte : toujours depuis le réseau
  if(url.pathname.includes("/assets/fonts/")){
    // Une plage de caractères absente ne doit pas bloquer l’affichage de la carte
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => res.ok ? res : new Response(new ArrayBuffer(0))).catch(() => new Response(new ArrayBuffer(0)))));
    return;
  }
  e.respondWith(
    caches.match(req, {ignoreSearch:true}).then(r => r || fetch(req).catch(() =>
      req.mode === "navigate" ? caches.match("index.html") : Response.error()
    ))
  );
});
