// 여의도 점심먹기 서비스워커: 앱 껍데기는 캐시, 데이터는 네트워크 우선(실패 시 캐시), 구글 시트 API 는 캐시 안 함
const VERSION = 'v1';
const CACHE = 'ydlunch-' + VERSION;
const SHELL = ['./', './index.html', './app.js', './app.css', './config.js', './data.js', './reviews.js',
  './cafe/', './cafe/index.html', './cafe/data.js', './ranking.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(SHELL.map(u => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('ydlunch-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;            // 시트 API·폰트 등 외부는 그대로
  e.respondWith(
    fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })
      .catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
  );
});
