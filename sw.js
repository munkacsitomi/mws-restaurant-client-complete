const cacheName = 'restaurant-cache-v1';
const runtime = 'runtime';

const urlsToCache = [
  '/',
  './index.html',
  './restaurant.html',
  './css/styles.css',
  './js/dbhelper.js',
  './js/main.js',
  './js/restaurant_info.js',
  './data/restaurants.json',
  './img_srcset/1-500_small_1x.jpg',
  './img_srcset/2-500_small_1x.jpg',
  './img_srcset/3-500_small_1x.jpg',
  './img_srcset/4-500_small_1x.jpg',
  './img_srcset/5-500_small_1x.jpg',
  './img_srcset/6-500_small_1x.jpg',
  './img_srcset/7-500_small_1x.jpg',
  './img_srcset/8-500_small_1x.jpg',
  './img_srcset/9-500_small_1x.jpg',
  './img_srcset/10-500_small_1x.jpg',
  './img_srcset/1-800_large_1x.jpg',
  './img_srcset/2-800_large_1x.jpg',
  './img_srcset/3-800_large_1x.jpg',
  './img_srcset/4-800_large_1x.jpg',
  './img_srcset/5-800_large_1x.jpg',
  './img_srcset/6-800_large_1x.jpg',
  './img_srcset/7-800_large_1x.jpg',
  './img_srcset/8-800_large_1x.jpg',
  './img_srcset/9-800_large_1x.jpg',
  './img_srcset/10-800_large_1x.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(cacheName)
      .then(cache => cache.addAll(urlsToCache))
      .then(self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  const currentCaches = [cacheName, runtime];
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
      })
      .then(cachesToDelete => {
        return Promise.all(
          cachesToDelete.map(cacheToDelete => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(runtime).then(cache => {
          return fetch(event.request).then(response => {
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});
