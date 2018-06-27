const cacheName = 'restaurant-cache';
const cacheVersion = 'v2';
const cache = `${cacheName}-${cacheVersion}`;

const urlsToCache = [
  '/',
  './index.html',
  './restaurant.html',
  './css/styles.css',
  './js/dbhelper.js',
  './js/main.js',
  './js/restaurant_info.js',
  './img_srcset/1-540_small_1x.jpg',
  './img_srcset/2-540_small_1x.jpg',
  './img_srcset/3-540_small_1x.jpg',
  './img_srcset/4-540_small_1x.jpg',
  './img_srcset/5-540_small_1x.jpg',
  './img_srcset/6-540_small_1x.jpg',
  './img_srcset/7-540_small_1x.jpg',
  './img_srcset/8-540_small_1x.jpg',
  './img_srcset/9-540_small_1x.jpg',
  './img_srcset/10-540_small_1x.jpg',
  './img_srcset/default-540_small_1x.jpg',
  './img_srcset/1-800_large_1x.jpg',
  './img_srcset/2-800_large_1x.jpg',
  './img_srcset/3-800_large_1x.jpg',
  './img_srcset/4-800_large_1x.jpg',
  './img_srcset/5-800_large_1x.jpg',
  './img_srcset/6-800_large_1x.jpg',
  './img_srcset/7-800_large_1x.jpg',
  './img_srcset/8-800_large_1x.jpg',
  './img_srcset/9-800_large_1x.jpg',
  './img_srcset/10-800_large_1x.jpg',
  './img_srcset/default-800_large_1x.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(cache)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
