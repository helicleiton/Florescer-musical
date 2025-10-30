
const CACHE_NAME = 'florescer-musical-v2'; // Versão do cache incrementada
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/manifest.json',
  '/logo.svg',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto e urls iniciais cacheadas.');
        const promises = urlsToCache.map(url => {
            const request = new Request(url, {cache: 'reload'});
            return cache.add(request).catch(err => console.warn(`Falha ao cachear ${url}:`, err));
        });
        return Promise.all(promises);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    // Estratégia: Network First (Tenta a rede primeiro)
    fetch(event.request)
      .then((networkResponse) => {
        // Se a resposta da rede for bem-sucedida,
        // clona a resposta, armazena em cache e a retorna.
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });
        return networkResponse;
      })
      .catch(() => {
        // Se a rede falhar (ex: offline),
        // tenta servir a resposta do cache.
        return caches.match(event.request)
          .then((cachedResponse) => {
            // Retorna a resposta do cache, se existir.
            return cachedResponse;
          });
      })
  );
});


self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Deleta caches antigos
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
