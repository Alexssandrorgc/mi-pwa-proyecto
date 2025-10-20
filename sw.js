const STATIC_CACHE_NAME = 'app-shell-v2';
const DYNAMIC_CACHE_NAME = 'dynamic-cache-v1';

const APP_SHELL_ASSETS = [
    '.',
    'index.html',
    'about.html',
    'style.css',
    'register.js'
];

const DYNAMIC_ASSET_URLS = [
    "https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js",
    "https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/main.min.css",
    "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/css/select2.min.css",
];

self.addEventListener('install', event => {
    console.log('SW: Instalando...');
    const cacheAppShell = caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('SW: Cacheando el App Shell esencial');
        return cache.addAll(APP_SHELL_ASSETS);
    });
    event.waitUntil(cacheAppShell);
});


self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    if (APP_SHELL_ASSETS.includes(url.pathname)) {
        event.respondWith(caches.match(request));
    } 

    else if (DYNAMIC_ASSET_URLS.includes(request.url)) {
        event.respondWith(
            caches.match(request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                return fetch(request).then(networkResponse => {
                    return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
    }
});