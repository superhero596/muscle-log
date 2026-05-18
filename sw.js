// ── ServiceWorker for 筋トレ帳 ──
const CACHE_NAME = 'muscle-log-v1';
const ASSETS = [
  './',
  './index.html',
  './icon.png',
];

// インストール：キャッシュに保存
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// アクティベート：古いキャッシュを削除
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// フェッチ：ネットワーク優先、失敗時はキャッシュ
self.addEventListener('fetch', e => {
  // GASへのリクエストはキャッシュしない
  if (e.request.url.includes('script.google.com')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // 最新をキャッシュに保存
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, resClone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// skipWaiting：新バージョンを即時適用
self.addEventListener('message', e => {
  if (e.data?.action === 'skipWaiting') self.skipWaiting();
});
