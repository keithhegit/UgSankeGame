const CACHE_NAME = 'snake-game-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/snake-logo.png',
  '/snake.svg',
  '/assets/index.css',
  '/assets/index.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // 对导航请求使用 network-first 策略
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 对其他资源使用 network-first 策略
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 如果获取到响应，则缓存副本
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // 如果网络请求失败，则尝试从缓存获取
        return caches.match(event.request);
      })
  );
}); 