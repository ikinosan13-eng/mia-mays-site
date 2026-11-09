// Мия в Комнате: позы (data/mia.json → poses), погладить, моргнуть, уснуть от тишины. Только события, без интервалов.
import { $, reduced, whenActive } from '../core/dom.js';
import { MiaStore } from '../core/store.js';
import { Sound } from '../core/sound.js';
import { toast } from '../core/toast.js';
import { Box } from '../core/box.js';
import { data } from './data.js';
import { P, fill } from './phrases.js';
let cfg = null, fig = null, cur = '', base = '', revert = 0;
// встроенная карта (совпадает с инлайн-скриптом home.html); data/mia.json может её переопределить
const DEF = { poseBase: { src: 'img/mia/mia-{name}.a1-512.webp', srcset: 'img/mia/mia-{name}.a1-256.webp 256w, img/mia/mia-{name}.a1-512.webp 512w', w: 512, h: 683 },
  poses: { wave: 'Мия машет рукой', blink: 'Мия моргает', 'ear-twitch': 'Мия шевелит ушком', tea: 'Мия пьёт чай', sleepy: 'Мия потягивается и зевает', sleep: 'Мия спит в обнимку с подушкой', shy: 'Мия смущается', happy: 'Мия радуется' },
  daypart: { morning: 'sleepy', day: 'wave', evening: 'tea', night: 'sleep', lampOn: 'shy' }, events: { gift: 'happy', box: 'happy', idle: 'sleep' }, frames: { wave: { blink: 'blink', pet: 'ear-twitch' } } };
const C = () => cfg || DEF;
// поза: строка (alt, файлы по шаблону poseBase) или объект {src, srcset, w, h, alt}
export function resolvePose(name, c = C()) {
  const p = c.poses && c.poses[name]; if (!p) return null;
  const b = c.poseBase || DEF.poseBase, t = x => String(x || '').replace(/\{name\}/g, name);
  return typeof p === 'string' ? { src: t(b.src), srcset: t(b.srcset), w: b.w, h: b.h, alt: p } : { w: b.w, h: b.h, ...p, src: t(p.src), srcset: t(p.srcset || '') };
}
export const hasPose = name => !!resolvePose(name);
export const poseFor = key => { const c = C(); return (c.daypart && c.daypart[key]) || (c.events && c.events[key]) || null; };
// базовая поза по времени суток и лампе: ночь (свет выключен) → sleep, ночь по часам, но свет включён → shy
export const basePose = (d = document.documentElement) => { const dp = d.dataset.daypart || 'day', n = d.classList.contains('night'); return poseFor(n ? 'night' : dp === 'night' ? 'lampOn' : dp); };
// смена позы: две <img>, кроссфейд opacity 220 мс; ms — временная поза/кадр, потом назад к базовой. Нет позы → false, ничего не меняем
export function setPose(name, ms = 0) {
  if (!fig || !name) return false;
  const p = resolvePose(name); if (!p) return false;
  clearTimeout(revert); if (ms) revert = setTimeout(() => setPose(base), ms); else base = name;
  if (name === cur) return true;
  cur = name;
  const old = fig.querySelector('.room__mia:not(.out)'), im = new Image();
  im.className = 'room__mia next'; im.dataset.pose = name; im.alt = p.alt || ''; im.width = p.w || 512; im.height = p.h || 683; im.decoding = 'async';
  if (p.srcset) { im.srcset = p.srcset; im.sizes = '(max-width:1100px) 35vw, 382px'; }
  im.src = p.src;
  const show = () => { if (im.dataset.pose !== cur || im.classList.contains('out')) { im.remove(); return; } im.classList.add('on');
    const fin = () => { if (!im.isConnected || im.classList.contains('out')) return; im.classList.remove('next', 'on'); fig.querySelectorAll('.room__mia.out').forEach(x => x.remove()); };
    if (reduced()) fin(); else setTimeout(fin, 240); };
  if (old) old.classList.add('out');
  fig.append(im);
  (im.decode ? im.decode() : Promise.resolve()).then(() => requestAnimationFrame(show), () => { im.remove(); old && old.classList.remove('out'); if (cur === name) cur = old ? old.dataset.pose : ''; });
  return true;
}
export const clearPose = () => setPose(base);
const frame = kind => { const c = C(); return c.frames && c.frames[cur] && c.frames[cur][kind]; };
const chipTwitch = cls => { const c = $('.mia-chip'); if (!c || reduced()) return; c.classList.remove(cls); void c.offsetWidth; c.classList.add(cls); setTimeout(() => c.classList.remove(cls), 460); };
// --- погладить: лимит 30 за 20 с → «растаяла» и 10 с пауза; сердечко не чаще 1/с; ушко дёргается один раз за серию
const WIN = 20e3, MAX = 30, PAUSE = 10e3;
let strokes = [], pausedUntil = 0, lastHeart = 0, lastStroke = 0, lastVib = 0;
export function pet(now = performance.now()) {
  if (now < pausedUntil) return 'paused';
  strokes = strokes.filter(t => now - t < WIN); strokes.push(now);
  if (strokes.length > MAX) { strokes = []; pausedUntil = now + PAUSE; toast(P['pet.enough'][0]); return 'enough'; }
  const series = now - lastStroke > 3000; lastStroke = now;
  let n = 0; MiaStore.update(s => { n = s.games.purrs = (s.games.purrs || 0) + 1; });
  Sound.purr();
  if (Sound.on && navigator.vibrate && /Android/i.test(navigator.userAgent) && now - lastVib > 1000) { lastVib = now; try { navigator.vibrate([8, 30, 8, 30, 8]); } catch {} }
  if (series) { const f = frame('pet'); if (!(f && setPose(f, 260))) chipTwitch('ear'); }
  if (now - lastHeart >= 1000) { lastHeart = now; heart(); }
  if (n % 100 === 0) toast(fill(P['pet.milestone'][0], { n }));
  else if (series) toast(P.pet[n % P.pet.length], { ms: 1800 });
  return 'ok';
}
function heart() {
  if (!fig || reduced()) return;
  const h = document.createElement('span'); h.className = 'pet-heart'; h.setAttribute('aria-hidden', 'true'); h.innerHTML = '<svg class="i"><use href="#i-heart"/></svg>';
  fig.append(h);
  if (!h.animate) return setTimeout(() => h.remove(), 600);
  h.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-24px)', opacity: 0 }], { duration: 600, easing: 'ease-out' }).onfinish = () => h.remove();
}
// --- моргнуть: games.blinks += 1, первое моргание — сувенир «Доверие» (единожды)
export function blink() {
  let n = 0; MiaStore.update(s => { n = s.games.blinks = (s.games.blinks || 0) + 1; });
  const bf = frame('blink'); if (!(bf && setPose(bf, 820)) && fig && !reduced()) { fig.classList.remove('blinking'); void fig.offsetWidth; fig.classList.add('blinking'); setTimeout(() => fig.classList.remove('blinking'), 820); }
  chipTwitch('blink');
  if (!(MiaStore.read('gifts.got') || []).includes('g-trust')) {
    MiaStore.update(s => { if (!s.gifts.got.includes('g-trust')) s.gifts.got.push('g-trust'); });
    if (!Box.has('g-trust')) Box.add({ id: 'g-trust', kind: 'souvenir', title: 'Доверие', icon: 'cat', silent: true });
    toast(`${P.blink[0]} В Коробке — сувенир «Доверие»`, { ms: 4200 });
  } else toast(P.blink[n % P.blink.length]);
  return n;
}
// --- уснуть от тишины: один setTimeout(60 с), сброс на pointerdown/keydown, снят при скрытой вкладке; один раз за страницу
function idleSleep() {
  let t = 0, asleep = false, done = false;
  const arm = () => { clearTimeout(t); if (done || document.hidden) return; t = setTimeout(sleep, 60e3); };
  const sleep = () => { asleep = true; done = true; if (!setPose(poseFor('idle'), 36e5)) fig && fig.classList.add('sleepy'); };
  const wake = () => { if (asleep) { asleep = false; clearPose(); fig && fig.classList.remove('sleepy'); toast(P.idleSleep[0]); } arm(); };
  addEventListener('pointerdown', wake, { passive: true }); addEventListener('keydown', wake);
  document.addEventListener('visibilitychange', () => document.hidden ? clearTimeout(t) : arm());
  arm();
}
// жесты на портрете: тап или каждые 120 px движения с нажатием = погладить; удержание ≥ 500 мс без сдвига > 10 px = моргнуть
export function initMia(figure) {
  fig = figure; if (!fig) return;
  const first = fig.querySelector('.room__mia'); cur = base = first ? first.dataset.pose || '' : '';
  data('mia').then(m => { if (m && m.poses) cfg = { ...DEF, ...m }; setPose(basePose()); });
  // лампа/свет: поза следует за классом .night
  let wasNight = document.documentElement.classList.contains('night');
  new MutationObserver(() => { const n = document.documentElement.classList.contains('night'); if (n !== wasNight) { wasNight = n; setPose(basePose()); } }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  let down = null, lp = 0;
  fig.addEventListener('contextmenu', e => e.preventDefault());
  fig.addEventListener('pointerdown', e => {
    if (!e.target.closest('.room__mia')) return;
    if (e.button > 0 || e.target.closest('button,a')) return; down = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, acc: 0, far: false, long: false };
    try { fig.setPointerCapture(e.pointerId); } catch {}
    clearTimeout(lp); lp = setTimeout(() => { if (down && !down.far) { down.long = true; blink(); } }, 500);
  });
  fig.addEventListener('pointermove', e => {
    if (!down) return; const dx = e.clientX - down.lx, dy = e.clientY - down.ly; down.lx = e.clientX; down.ly = e.clientY;
    if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 10) { down.far = true; clearTimeout(lp); }
    down.acc += Math.hypot(dx, dy); while (down.acc >= 120) { down.acc -= 120; pet(); }
  });
  const up = e => { clearTimeout(lp); if (down && e.type === 'pointerup' && !down.long && !down.far) pet(); down = null; };
  fig.addEventListener('pointerup', up); fig.addEventListener('pointercancel', up);
  whenActive(idleSleep);
}
