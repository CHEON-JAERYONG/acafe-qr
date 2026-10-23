/* A카페 QR — 아이폰(웹) 버전 빨리 열기 · 오프라인 대비
 * 저장해 둔 파일로 바로 열고(커피 게임 그림도 매번 다시 받지 않는다), 뒤에서 새 파일을 받아 다음에 열 때 쓴다.
 * 인터넷이 안 되면 저장해 둔 파일로 연다 → 카페에서 신호가 약해도 QR은 열린다.
 * 중계 서버(ntfy.sh) 요청은 건드리지 않는다. */
var CACHE = 'acafe-qr-2';
var FILES = ['./', 'index.html', 'config.js', 'qrcode.js', 'jsqr.js', 'game.html', 'logo.webp', 'splash.webp', 'manifest.webmanifest', 'icon-192.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k.indexOf('acafe-qr-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(e.request, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(e.request).then(function (r) { if (r.ok) c.put(e.request, r.clone()); return r; });
      if (hit) { e.waitUntil(net.catch(function () {})); return hit; }   // 저장본으로 바로, 새 파일은 뒤에서
      return net.catch(function () { return c.match('index.html'); });
    });
  }));
});
