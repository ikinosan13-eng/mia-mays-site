// Дом Мии — service worker (ручной). VERSION = ?v=N в HTML; оба ставит tools/shell.mjs из tools/version.txt.
// Аварийно: залить tools/sw-kill.js вместо этого файла (снимет SW и кэши у всех гостей).
const VERSION = 'mia-v16';
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
  './css/core.css?v=16',
  './css/rooms/album.css?v=16',
  './css/rooms/box.css?v=16',
  './css/rooms/diary.css?v=16',
  './css/rooms/home.css?v=16',
  './css/rooms/intro.css?v=16',
  './css/rooms/living.css?v=16',
  './css/rooms/play.css?v=16',
  './js/app.js?v=16',
  './js/core/box.js?v=16',
  './js/core/countdown.js?v=16',
  './js/core/dom.js?v=16',
  './js/core/eggs.js?v=16',
  './js/core/fx.js?v=16',
  './js/core/knead.js?v=16',
  './js/core/migrate.js?v=16',
  './js/core/modal.js?v=16',
  './js/core/nav.js?v=16',
  './js/core/prefs.js?v=16',
  './js/core/pwa.js?v=16',
  './js/core/shell.js?v=16',
  './js/core/sound.js?v=16',
  './js/core/store.js?v=16',
  './js/core/switch.js?v=16',
  './js/core/toast.js?v=16',
  './js/life/checkin.js?v=16',
  './js/life/clock.js?v=16',
  './js/life/data.js?v=16',
  './js/life/gift.js?v=16',
  './js/life/greet.js?v=16',
  './js/life/mia.js?v=16',
  './js/life/phrases.js?v=16',
  './js/life/since.js?v=16',
  './js/life/visits.js?v=16',
  './js/play/avatar.js?v=16',
  './js/play/gif.js?v=16',
  './js/play/hearts.js?v=16',
  './js/play/laser.js?v=16',
  './js/play/meme.js?v=16',
  './js/play/pet.js?v=16',
  './js/play/tryon.js?v=16',
  './js/play/yarn.js?v=16',
  './js/rooms/album.js?v=16',
  './js/rooms/box.js?v=16',
  './js/rooms/diary.js?v=16',
  './js/rooms/home.js?v=16',
  './js/rooms/intro.js?v=16',
  './js/rooms/living.js?v=16',
  './js/rooms/lost.js?v=16',
  './js/rooms/play.js?v=16',
  './fonts/caveat.woff2',
  './fonts/nunito.woff2',
  './data/gifts.json?v=16',
  './data/mia.json?v=16',
  './data/notes.json?v=16',
  './data/updates.json?v=16',
  './img/icons/icon-192.a1.png',
  './img/icons/favicon.a1.svg',
  './img/icons/avatar.a1-64.webp',
  './img/icons/avatar.a1-128.webp'
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

  // js и data/*.json: сеть первой (2 с) → кэш. Страховка к ?v=N: новый HTML никогда не исполняет старые модули
  if (/\.(?:m?js|json)$/i.test(url.pathname)) {
    const net = fetch(req).then(res => {
      if (res.ok && res.type === 'basic') e.waitUntil(put(SHELL, req, res.clone()));
      return res;
    });
    e.waitUntil(net.catch(() => {}));
    e.respondWith((async () => {
      try { return await Promise.race([net, wait(2000)]); }
      catch {
        const hit = await caches.match(req); if (hit) return hit;
        try { return await net; } catch { return Response.error(); }
      }
    })());
    return;
  }

  // css/шрифты/manifest: stale-while-revalidate
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(res => {
      if (res.ok && res.type === 'basic') e.waitUntil(put(SHELL, req, res.clone()));
      return res;
    }).catch(() => hit || Response.error());
    if (hit) e.waitUntil(net.catch(() => {}));
    return hit || net;
  }));
});
