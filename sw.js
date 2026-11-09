// Дом Мии — service worker (ручной). VERSION = ?v=N в HTML; оба ставит tools/shell.mjs из tools/version.txt.
// Аварийно: залить tools/sw-kill.js вместо этого файла (снимет SW и кэши у всех гостей).
const VERSION = 'mia-v14';
const SHELL = `${VERSION}-shell`, PAGES = `${VERSION}-pages`, IMG = 'mia-img-v1';
const PRECACHE = [/*@precache*/
  './',
  './index.html',
  './home.html',
  './diary.html',
  './album.html',
  './play.html',
  './living.html',
  './box.html',
  './offline.html',
  './404.html',
  './manifest.webmanifest',
  './css/core.css?v=14',
  './css/rooms/album.css?v=14',
  './css/rooms/box.css?v=14',
  './css/rooms/diary.css?v=14',
  './css/rooms/home.css?v=14',
  './css/rooms/intro.css?v=14',
  './css/rooms/living.css?v=14',
  './css/rooms/play.css?v=14',
  './js/app.js?v=14',
  './js/core/box.js',
  './js/core/countdown.js',
  './js/core/dom.js',
  './js/core/eggs.js',
  './js/core/fx.js',
  './js/core/migrate.js',
  './js/core/modal.js',
  './js/core/nav.js',
  './js/core/prefs.js',
  './js/core/pwa.js',
  './js/core/shell.js',
  './js/core/sound.js',
  './js/core/store.js',
  './js/core/switch.js',
  './js/core/toast.js',
  './js/life/visits.js',
  './js/play/avatar.js',
  './js/play/gif.js',
  './js/play/hearts.js',
  './js/play/laser.js',
  './js/play/meme.js',
  './js/play/pet.js',
  './js/play/tryon.js',
  './js/play/yarn.js',
  './js/rooms/album.js',
  './js/rooms/box.js',
  './js/rooms/diary.js',
  './js/rooms/home.js',
  './js/rooms/intro.js',
  './js/rooms/living.js',
  './js/rooms/play.js',
  './fonts/caveat.woff2',
  './fonts/nunito.woff2',
  './icons/icon-192.png',
  './icons/favicon.svg',
  './img/avatar-64.webp'
];
const IMG_MAX = 80;
let off = false; // ?nosw=1: гость попросил выключить офлайн — больше ничего не перехватываем и не кэшируем

self.addEventListener('install', e => e.waitUntil(
  caches.open(SHELL).then(c => c.addAll(PRECACHE.map(u => new Request(u, { cache: 'reload' }))))
)); // без skipWaiting: новая версия ждёт согласия гостя (тост «Обновить дом?»)

self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k.startsWith('mia-') && k !== SHELL && k !== PAGES && k !== IMG) await caches.delete(k);
  if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
  await self.clients.claim();
})()));

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
  if (e.data === 'OFF') off = true;
  if (e.data === 'VERSION' && e.ports[0]) e.ports[0].postMessage(VERSION);
});

const wait = ms => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));
const cachedPage = async req => (await (await caches.open(PAGES)).match(req, { ignoreSearch: true }))
  || (await (await caches.open(SHELL)).match(req, { ignoreSearch: true }));
const put = (name, req, res) => caches.open(name).then(c => c.put(req, res)).catch(() => {});
async function trimImg() {
  const c = await caches.open(IMG), ks = await c.keys();
  for (let i = 0; i < ks.length - IMG_MAX; i++) await c.delete(ks[i]); // самые старые первыми
}

self.addEventListener('fetch', e => {
  if (off) return;
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || req.headers.has('range')) return; // чужие домены не трогаем
  if (url.pathname.endsWith('/sw.js') || url.search.includes('nosw=1')) return;

  if (req.mode === 'navigate') { // страницы: сеть первой (3 с) → кэш → offline.html
    const net = Promise.resolve(e.preloadResponse).then(r => r || fetch(req)).then(res => {
      if (res.ok && res.type === 'basic' && !res.redirected) e.waitUntil(put(PAGES, url.origin + url.pathname, res.clone())); // без ?query
      return res;
    });
    e.waitUntil(net.catch(() => {}));
    e.respondWith((async () => {
      try { return await Promise.race([net, wait(3000)]); }
      catch {
        const hit = await cachedPage(req); if (hit) return hit;
        try { return await net; } // кэша нет — ждём медленную сеть дальше
        catch { return (await caches.match('./offline.html', { ignoreSearch: true })) || Response.error(); }
      }
    })());
    return;
  }

  if (/\.(?:webp|avif|png|jpe?g|gif|svg|ico)$/i.test(url.pathname)) { // картинки: кэш первым, лимит 80
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok && res.type === 'basic') e.waitUntil(put(IMG, req, res.clone()).then(trimImg));
      return res;
    })));
    return;
  }

  // css/js/шрифты/json/manifest: stale-while-revalidate
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(res => {
      if (res.ok && res.type === 'basic') e.waitUntil(put(SHELL, req, res.clone()));
      return res;
    }).catch(() => hit || Response.error());
    if (hit) e.waitUntil(net.catch(() => {}));
    return hit || net;
  }));
});
