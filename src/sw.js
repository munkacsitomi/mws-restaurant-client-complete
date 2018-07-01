const currentCache = 'restaurant-cache';
const currentCacheVersion = `${currentCache}-v7`;

const urlsToCache = [
  '/',
  './index.html',
  './restaurant.html',
  './manifest.json',
  './css/styles.min.css',
  './js/idb.js',
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
  event.waitUntil(caches.open(currentCacheVersion).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(
            cacheName => cacheName.startsWith(currentCache) && currentCacheVersion != cacheName
          )
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(currentCacheVersion).then(cache => {
      return cache.match(event.request).then(response => {
        if (response) return response;

        return fetch(event.request).then(res => {
          if (res.url.includes('.jpg')) {
            if (res.url.includes(window.location.origin)) {
              cache.put(event.request.url, res.clone());
              return res;
            }
            return;
          }
          cache.put(event.request.url, res.clone());
          return res;
        });
      });
    })
  );
});
