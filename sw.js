/* A카페 QR — 아이폰(웹) 버전 오프라인 대비
 * 인터넷이 되면 늘 새 파일을 받고(받은 건 저장), 안 되면 저장해 둔 파일로 연다 → 카페에서 신호가 약해도 QR은 열린다.
 * 중계 서버(ntfy.sh) 요청은 건드리지 않는다. */
var CACHE = 'acafe-qr-1';
var FILES = ['./', 'index.html', 'config.js', 'qrcode.js', 'jsqr.js', 'game.html', 'logo.png', 'splash.png', 'manifest.webmanifest', 'icon-192.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== self.location.origin) return;
  e.respondWith(fetch(e.request).then(function (r) {
    if (r.ok) { var cp = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, cp); }); }
    return r;
  }).catch(function () {
    return caches.match(e.request, { ignoreSearch: true }).then(function (r) { return r || caches.match('index.html'); });
  }));
});
