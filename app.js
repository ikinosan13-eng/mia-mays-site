(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const lite = reduce || matchMedia('(max-width:700px)').matches || !!(navigator.connection && navigator.connection.saveData) || (navigator.deviceMemory && navigator.deviceMemory <= 4);
if (lite) document.documentElement.classList.add('lite');
const store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
const sess = { get: k => { try { return sessionStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch {} } };
const load = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
const dl = (url, name) => { const a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove(); };

// тосты
const toast = (msg, ms = 2400) => { const box = $('#toasts'); if (!box) return; const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; box.append(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, ms); };

// звук: синтез, по умолчанию выключен
const Sound = (() => { let ctx = null, on = store.get('mia-sound') === 'on', last = 0; const btn = $('#soundToggle');
  const ui = () => { if (!btn) return; btn.setAttribute('aria-pressed', on); btn.textContent = on ? '🔊' : '🔇'; btn.setAttribute('aria-label', 'Звуки: ' + (on ? 'включены' : 'выключены')); };
  const ensure = () => { if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); } if (ctx.state === 'suspended') ctx.resume(); return ctx; };
  function tone(f = 880, d = .09, type = 'sine', vol = .03) { if (!on || !ctx) return; const n = ctx.currentTime; if (n - last < .04) return; last = n;
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, n); o.frequency.exponentialRampToValueAtTime(f * 1.5, n + d);
    g.gain.setValueAtTime(0, n); g.gain.linearRampToValueAtTime(vol, n + .01); g.gain.exponentialRampToValueAtTime(.0001, n + d); o.connect(g).connect(ctx.destination); o.start(n); o.stop(n + d + .02); }
  const meow = () => { if (!on || !ctx) return; const n = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle';
    o.frequency.setValueAtTime(600, n); o.frequency.linearRampToValueAtTime(900, n + .12); o.frequency.linearRampToValueAtTime(500, n + .35);
    g.gain.setValueAtTime(0, n); g.gain.linearRampToValueAtTime(.035, n + .04); g.gain.exponentialRampToValueAtTime(.0001, n + .4); o.connect(g).connect(ctx.destination); o.start(n); o.stop(n + .42); };
  if (btn) btn.addEventListener('click', () => { on = !on; store.set('mia-sound', on ? 'on' : 'off'); ui(); if (on) { ensure(); meow(); } toast(on ? 'Звуки включены 🔊' : 'Звуки выключены 🔇'); });
  const unlock = () => { if (on) ensure(); removeEventListener('pointerdown', unlock); removeEventListener('keydown', unlock); };
  addEventListener('pointerdown', unlock); addEventListener('keydown', unlock); ui(); return { tone, meow }; })();
document.addEventListener('pointerover', e => { const t = e.target.closest && e.target.closest('.btn,.chip,.inline-nav a,.room-door,.g,.sticker'); if (t && !t.contains(e.relatedTarget)) Sound.tone(1100 + Math.random() * 200, .06); });
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('.btn,.chip,.icon-btn'); if (!t) return; Sound.tone(700, .1, 'triangle');
  if (!reduce) { t.classList.remove('pop'); void t.offsetWidth; t.classList.add('pop'); } });
document.addEventListener('animationend', e => e.target.classList && e.target.classList.remove('pop'));

// лампа — ночной режим
const lamp = $('#lampToggle');
const setNight = n => { document.body.classList.toggle('night', n); if (lamp) { lamp.setAttribute('aria-pressed', n); lamp.setAttribute('aria-label', n ? 'Лампа: включить дневной свет' : 'Лампа: включить ночной режим'); } };
setNight(store.get('mia-night') === '1');
if (lamp) lamp.addEventListener('click', () => { const n = !document.body.classList.contains('night'); setNight(n); store.set('mia-night', n ? '1' : '0'); Sound.tone(n ? 440 : 880, .2); toast(n ? 'Лампа погашена — спокойной ночи 🌙' : 'Доброе утро ☀️'); });

// полноэкранное меню (<dialog>, раскрытие кругом)
const menuDlg = $('#menuDialog'), menuBtn = $('#menuBtn');
if (menuDlg && menuBtn && menuDlg.showModal) {
  const close = () => { if (!menuDlg.open) return; if (reduce) return menuDlg.close(); menuDlg.classList.add('closing'); setTimeout(() => { menuDlg.classList.remove('closing'); menuDlg.close(); }, 600); };
  menuBtn.addEventListener('click', () => { menuDlg.showModal(); menuBtn.setAttribute('aria-expanded', 'true'); });
  menuDlg.addEventListener('close', () => { menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.focus(); });
  menuDlg.addEventListener('cancel', e => { e.preventDefault(); close(); });
  const mc = $('#menuClose'); if (mc) mc.addEventListener('click', close);
  $$('.big-nav a', menuDlg).forEach(a => a.addEventListener('click', () => menuDlg.close()));
} else if (menuBtn) menuBtn.addEventListener('click', () => { location.href = 'home.html'; });

// разбивка заголовков по буквам
$$('.split').forEach(el => { const txt = el.textContent.trim(); el.setAttribute('aria-label', txt); el.textContent = ''; let i = 0;
  txt.split(' ').forEach((w, wi, arr) => { const ws = document.createElement('span'); ws.className = 'w'; ws.setAttribute('aria-hidden', 'true');
    [...w].forEach(c => { const s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', i++); s.textContent = c; ws.append(s); }); el.append(ws); if (wi < arr.length - 1) el.append(' '); });
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('go'))); });

// появление при прокрутке
$$('.rooms,.stickers,.comic,.gallery,.shop,.wallpapers,.about-grid,.diary,.mood-cards').forEach(g => [...g.children].forEach((c, i) => { c.style.setProperty('--d', (i % 6) * .08 + 's'); c.classList.add('reveal'); }));
$$('.sec>h2').forEach(h => h.classList.add('reveal'));
const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -30px' }) : null;
$$('.reveal').forEach(el => reduce || !io ? el.classList.add('in') : io.observe(el));
$$('.gallery>*').forEach(el => el.classList.add('zoom-in'));
$$('.timeline li,.tl li').forEach((el, i) => { el.classList.add('reveal', 'tl-reveal', i % 2 ? 'from-right' : 'from-left'); reduce || !io ? el.classList.add('in') : io.observe(el); });
// страховка: через 3 с всё, что ещё скрыто, показываем
setTimeout(() => $$('.reveal:not(.in)').forEach(el => { const r = el.getBoundingClientRect(); if (r.top < innerHeight * 1.5) el.classList.add('in'); }), 3000);
setTimeout(() => document.documentElement.classList.add('reveal-done'), 8000);
// мягкий параллакс фона
const drift = $('.drift');
if (drift && !reduce && !lite) { const ls = $$('i', drift); let ticking = false;
  addEventListener('scroll', () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { const y = scrollY; ls.forEach((l, i) => l.style.transform = `translate3d(0,${-y * (.04 + i * .05)}px,0)`); ticking = false; }); }, { passive: true }); }
// переходы между страницами: Cross-doc View Transitions (CSS) или лёгкий curtain
const canVT = !reduce && !lite && typeof document.startViewTransition === 'function';
const crossDocVT = canVT && CSS.supports('view-transition-name', 'none');
document.addEventListener('click', e => { const a = e.target.closest('a[href]'); if (!a || e.defaultPrevented || reduce) return;
  if (e.button || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || a.target || a.hasAttribute('download')) return;
  const u = new URL(a.href, location.href); if (u.origin !== location.origin || !/\.html$|\/$/.test(u.pathname)) return;
  if (u.pathname === location.pathname && u.hash) return;
  if (a.id === 'enterHouse') return; // свой houses-переход
  // если браузер сам анимирует MPA — не мешаем
  if (crossDocVT) return;
  e.preventDefault();
  document.body.classList.add('leaving');
  setTimeout(() => { location.href = u.href; }, 280); });
addEventListener('pageshow', e => { if (e.persisted) document.body.classList.remove('leaving'); });

// счётчики
const counters = $$('[data-count]');
if (counters.length) { const run = el => { const to = +el.dataset.count; if (reduce) { el.textContent = to; return; } const t0 = performance.now(), d = 1600;
    (function f(t) { const k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(to * e); if (k < 1) requestAnimationFrame(f); })(t0); };
  if (io) { const co = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { run(e.target); co.unobserve(e.target); } }), { threshold: .5 }); counters.forEach(c => co.observe(c)); } else counters.forEach(run); }

// наклон карточек за курсором
if (fine && !reduce) $$('.tilt').forEach(el => {
  el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    el.style.setProperty('--ty', (x * 14).toFixed(2) + 'deg'); el.style.setProperty('--tx', (-y * 14).toFixed(2) + 'deg'); });
  el.addEventListener('pointerleave', () => { el.style.setProperty('--tx', '0deg'); el.style.setProperty('--ty', '0deg'); }); });

// курсор-лапка (только мышь)
const paw = $('.paw-cursor');
if (paw && fine && !reduce) { document.body.classList.add('paw'); paw.style.opacity = 0; let x = -100, y = -100, cx = x, cy = y, raf = 0;
  addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; if (paw.style.opacity === '0') { paw.style.opacity = 1; cx = e.clientX; cy = e.clientY; } x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(step); }, { passive: true });
  addEventListener('pointerdown', () => paw.classList.add('down')); addEventListener('pointerup', () => paw.classList.remove('down'));
  document.addEventListener('mouseleave', () => { paw.style.opacity = 0; }); document.addEventListener('mouseenter', () => { paw.style.opacity = 1; });
  function step() { raf = 0; if (document.hidden) return; cx += (x - cx) * .35; cy += (y - cy) * .35; paw.style.transform = `translate3d(${cx - 15}px,${cy - 15}px,0) rotate(${(x - cx) * .5}deg)`; if (Math.abs(x - cx) + Math.abs(y - cy) > .5) raf = requestAnimationFrame(step); } }

// сердечки-взрыв (физика)
const fx = []; let fxRaf = 0, fxLast = 0;
function burst(x, y, n = 9) { if (reduce) return; for (let i = 0; i < n; i++) { const el = document.createElement('span'); el.className = 'pop-heart'; el.textContent = '♥'; el.setAttribute('aria-hidden', 'true'); document.body.append(el);
    const a = -Math.PI / 2 + (Math.random() - .5) * 1.8, v = 220 + Math.random() * 200; fx.push({ el, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1.2, r: 0, vr: (Math.random() - .5) * 400 }); }
  if (!fxRaf) { fxLast = performance.now(); fxRaf = requestAnimationFrame(fxStep); } }
function fxStep(t) { const dt = Math.min(.05, (t - fxLast) / 1000); fxLast = t;
  for (let i = fx.length - 1; i >= 0; i--) { const p = fx[i]; p.vy += 600 * dt; p.vx *= .99; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; p.life -= dt;
    p.el.style.transform = `translate3d(${p.x}px,${p.y}px,0) rotate(${p.r}deg)`; p.el.style.opacity = Math.max(0, p.life); if (p.life <= 0) { p.el.remove(); fx.splice(i, 1); } }
  fxRaf = fx.length ? requestAnimationFrame(fxStep) : 0; }

// фоновые сердечки
const petals = $('.petals');
if (petals && !reduce && !lite) { const ps = []; let lastT = performance.now(), acc = 0;
  const spawn = () => { const el = document.createElement('span'); el.className = 'petal'; el.textContent = Math.random() < .5 ? '♡' : '❀'; el.style.fontSize = 12 + Math.random() * 14 + 'px'; petals.append(el);
    ps.push({ el, x: Math.random() * innerWidth, y: -30, vy: 10 + Math.random() * 20, ph: Math.random() * 6.28, sw: 15 + Math.random() * 25, rot: 0, vr: (Math.random() - .5) * 90 }); };
  (function step(t) { const dt = Math.min(.05, (t - lastT) / 1000); lastT = t;
    if (!document.hidden) { acc += dt; if (acc > 1.1 && ps.length < 12) { acc = 0; spawn(); } const wind = Math.sin(t / 4000) * 12;
      for (let i = ps.length - 1; i >= 0; i--) { const p = ps[i]; p.vy = Math.min(p.vy + 18 * dt, 70); p.y += p.vy * dt; p.ph += dt * 1.6; p.x += wind * dt; p.rot += p.vr * dt;
        p.el.style.transform = `translate3d(${Math.min(innerWidth - 30, Math.max(0, p.x + Math.sin(p.ph) * p.sw))}px,${p.y}px,0) rotate(${p.rot}deg)`; if (p.y > innerHeight + 40) { p.el.remove(); ps.splice(i, 1); } } }
    requestAnimationFrame(step); })(lastT); }

// модалки
const Modal = (() => { let cur = null, back = null;
  const focusables = m => $$('button,[href],input,select,[tabindex]:not([tabindex="-1"])', m).filter(x => !x.disabled && x.offsetParent !== null);
  function open(m, from) { if (!m) return; if (cur) close(true); cur = m; back = from || document.activeElement; m.hidden = false; void m.offsetWidth; m.classList.add('open'); document.body.style.overflow = 'hidden'; (focusables(m)[0] || m).focus(); Sound.tone(520, .15); }
  function close(instant) { const m = cur; if (!m) return; cur = null; m.classList.remove('open'); document.body.style.overflow = '';
    const done = () => { if (!m.classList.contains('open')) m.hidden = true; }; instant === true || reduce ? done() : setTimeout(done, 280); back && back.focus && back.focus(); }
  addEventListener('keydown', e => { if (!cur) return; if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'Tab') { const f = focusables(cur); if (!f.length) return; const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } } });
  $$('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) close(); }));
  return { open, close, get cur() { return cur; } }; })();
$$('.shop-soon').forEach(b => b.addEventListener('click', () => Modal.open($('#shopModal'), b)));
$$('a[download]').forEach(a => a.addEventListener('click', () => toast('Скачиваю… спасибо! ♡')));

// отсчёт до пятницы 20:00
const cd = $('#countdown');
if (cd) { const cdSr = $('#countdownSr');
  const target = (() => { const d = new Date(); d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7)); d.setHours(20, 0, 0, 0); if (d < new Date()) d.setDate(d.getDate() + 7); return d; })();
  const units = [['d', 'дн'], ['h', 'ч'], ['m', 'мин'], ['s', 'сек']], cells = {};
  units.forEach(([u, lab]) => { const w = document.createElement('span'); w.className = 'cd-unit'; cells[u] = [];
    for (let i = 0; i < 2; i++) { const d = document.createElement('span'); d.className = 'digit'; d.innerHTML = '<span>0</span>'; w.append(d); cells[u].push(d); }
    const l = document.createElement('small'); l.textContent = lab; w.append(l); cd.append(w); });
  const setDigit = (el, ch) => { if (el.dataset.v === ch) return; el.dataset.v = ch; if (reduce) { el.innerHTML = `<span>${ch}</span>`; return; }
    const old = el.lastElementChild; old.className = 'old'; const n = document.createElement('span'); n.className = 'new'; n.textContent = ch; el.append(n); setTimeout(() => old.remove(), 460); };
  let lastMin = -1; const tick = () => { const s = Math.max(0, (target - new Date()) / 1000 | 0); const v = { d: s / 86400 | 0, h: s % 86400 / 3600 | 0, m: s % 3600 / 60 | 0, s: s % 60 };
    units.forEach(([u]) => String(Math.min(99, v[u])).padStart(2, '0').split('').forEach((c, i) => setDigit(cells[u][i], c)));
    if (cdSr && v.m !== lastMin) { lastMin = v.m; cdSr.textContent = `До Уютной ночи: ${v.d} дн. ${v.h} ч. ${v.m} мин.`; } }; tick(); setInterval(tick, 1000); }

// ===== вступление =====
const speechText = $('#speechText');
if (speechText) {
  const lines = ['Ой… привет! Ты меня нашёл(ла). Я MIA.', 'Я кошкодевочка-домоседка. Ушки настоящие — ну, почти. ♡', 'Мой дом маленький: окно на звёзды, гирлянда и гора подушек.', 'Я люблю чай с мёдом, дождь за окном и форты из одеял.', 'Каждую пятницу у нас Уютная ночь. Приходи!', 'Ну что… заходи в дом? Я поставлю чайник.'];
  const pic = $('#introPortrait'), dots = $('#speechDots'), log = $('#speechLog'), next = $('#speechNext'), all = $('#speechAll'); let li = 0, timer = 0, typing = false;
  lines.forEach(() => dots.append(document.createElement('i')));
  const react = cls => { if (!pic || reduce) return; pic.classList.remove(cls); void pic.offsetWidth; pic.classList.add(cls); setTimeout(() => pic.classList.remove(cls), 900); };
  function say(i) { clearTimeout(timer); li = i; const txt = lines[i]; [...dots.children].forEach((d, k) => d.classList.toggle('on', k === i));
    const it = document.createElement('li'); it.textContent = txt; log.append(it);
    react(i % 2 ? 'spark' : 'bounce'); if (reduce) { speechText.textContent = txt; schedule(); return; }
    typing = true; let c = 0; speechText.textContent = '';
    (function type() { speechText.textContent = txt.slice(0, ++c); if (c % 3 === 0) Sound.tone(900 + Math.random() * 300, .03, 'sine', .015); if (c % 14 === 0) react('talk');
      if (c < txt.length) timer = setTimeout(type, 38); else { typing = false; schedule(); } })(); }
  function schedule() { if (li < lines.length - 1) timer = setTimeout(() => say(li + 1), 2200); else next.textContent = 'Сначала'; }
  next.addEventListener('click', () => { if (typing) { clearTimeout(timer); typing = false; speechText.textContent = lines[li]; schedule(); return; } say(li < lines.length - 1 ? li + 1 : 0); if (li === 0) next.textContent = 'Дальше'; });
  all.addEventListener('click', () => { clearTimeout(timer); typing = false; speechText.textContent = lines.join(' '); li = lines.length - 1; [...dots.children].forEach(d => d.classList.add('on')); next.textContent = 'Сначала'; });
  if (pic) pic.addEventListener('click', e => { react('spark'); burst(e.clientX, e.clientY); Sound.meow(); });
  if (!reduce) (function blinkLoop() { setTimeout(() => { react('blinking'); if (Math.random() < .22) setTimeout(() => react('blinking'), 260); blinkLoop(); }, 2200 + Math.random() * 4300); })();
  setTimeout(() => say(0), reduce ? 0 : 900);
  const mark = () => sess.set('mia-intro', '1');
  $$('#skipIntro,#skipIntro2').forEach(a => a.addEventListener('click', mark));
  const enter = $('#enterHouse'), houses = $('#houses');
  if (enter) enter.addEventListener('click', e => { if (e.button || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return; e.preventDefault(); mark(); clearTimeout(timer);
    const go = () => location.href = enter.href;
    if (!houses) return go();
    houses.classList.remove('open', 'zoom', 'flash'); void houses.offsetWidth; houses.classList.add('show');
    if (reduce) return setTimeout(go, 700);
    Sound.meow();
    setTimeout(() => { houses.classList.add('open'); Sound.tone(660, .3, 'triangle'); }, 650);
    setTimeout(() => houses.classList.add('zoom'), 1500);
    setTimeout(() => houses.classList.add('flash'), 2450);
    setTimeout(go, 2900); });
  addEventListener('pageshow', ev => { if (ev.persisted && houses) houses.classList.remove('show', 'open', 'zoom', 'flash'); });
}

// ===== главная: сцена-порог =====
const stars = $('.stars'); if (stars) for (let i = 0; i < (lite ? 8 : 18); i++) { const s = document.createElement('i'); s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;--tw:${2 + Math.random() * 3}s;--dl:${-Math.random() * 3}s`; stars.append(s); }
const bulbs = $('.bulbs'); if (bulbs) for (let i = 0; i < (lite ? 6 : 10); i++) { const b = document.createElement('i'), x = i / 13; b.style.cssText = `left:${x * 100}%;top:${20 + Math.sin(x * Math.PI * 1.6) * 40 + 20}%;--dl:${-i * .3}s`; bulbs.append(b); }
const th = $('#threshold'), scene = $('#scene'), card = $('#doorCard');
if (th && scene) { const layers = $$('.layer', scene); let mx = 0, my = 0, cx = 0, cy = 0, visible = true, raf = 0;
  const setPtr = (x, y) => { const r = th.getBoundingClientRect(); mx = (x - r.left) / r.width - .5; my = (y - r.top) / r.height - .5; kick(); };
  th.addEventListener('pointermove', e => setPtr(e.clientX, e.clientY), { passive: true }); th.addEventListener('pointerdown', e => setPtr(e.clientX, e.clientY), { passive: true });
  th.addEventListener('pointerleave', () => { mx = my = 0; kick(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }).observe(th);
  addEventListener('scroll', kick, { passive: true }); addEventListener('resize', kick);
  function kick() { if (!raf && visible) raf = requestAnimationFrame(step); }
  function step() { raf = 0; const k = reduce ? 1 : .12; cx += (mx - cx) * k; cy += (my - cy) * k;
    const prog = Math.min(1, Math.max(0, scrollY / (th.offsetHeight * .8))); th.style.setProperty('--p', prog.toFixed(3));
    if (!reduce) layers.forEach(l => { const d = +l.dataset.depth; l.style.transform = `translate3d(${(-cx * 40 * d).toFixed(1)}px,${(-cy * 30 * d + scrollY * d * .25).toFixed(1)}px,0) scale(${1 + prog * d * .25})`; });
    if (card && !reduce) { card.style.setProperty('--rx', (cy * -12).toFixed(2) + 'deg'); card.style.setProperty('--ry', (cx * 16).toFixed(2) + 'deg'); }
    if (card) { card.style.setProperty('--gx', (50 + cx * 60) + '%'); card.style.setProperty('--gy', (38 + cy * 40) + '%'); }
    if (Math.abs(mx - cx) + Math.abs(my - cy) > .002 && !reduce) kick(); }
  step();
  if (card) card.addEventListener('click', e => { card.classList.remove('perk'); void card.offsetWidth; card.classList.add('perk'); Sound.meow(); burst(e.clientX, e.clientY); }); }
const stack = $('.stack');
if (stack) { const flip = () => { const top = stack.lastElementChild; stack.prepend(top); Sound.tone(800, .08); }; stack.addEventListener('click', flip);
  stack.setAttribute('tabindex', '0'); stack.setAttribute('role', 'button'); stack.setAttribute('aria-label', 'Перелистнуть фото');
  stack.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } }); }
const moods = $$('[data-mood]');
if (moods.length) { const set = b => { moods.forEach(m => m.setAttribute('aria-pressed', m === b)); store.set('mia-mood', b.dataset.mood); };
  const saved = moods.find(m => m.dataset.mood === store.get('mia-mood')); if (saved) set(saved);
  moods.forEach(b => b.addEventListener('click', () => { set(b); toast('Сегодня MIA ' + b.dataset.mood.toLowerCase()); })); }

// ===== галерея =====
const lb = $('#lb');
if (lb) { const lbImg = $('img', lb), cap = $('#lbCap'), items = $$('.g'); let list = items, gi = 0;
  const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  const show = i => { gi = (i + list.length) % list.length; const im = $('img', list[gi]); lbImg.removeAttribute('width'); lbImg.removeAttribute('height'); lbImg.src = im.src; lbImg.alt = im.alt || ''; if (cap) cap.textContent = ($('.g-cap', list[gi]) || {}).textContent || ''; };
  const clearLb = () => { if (!lbImg) return; lbImg.src = BLANK; lbImg.alt = ''; lbImg.width = 1; lbImg.height = 1; if (cap) cap.textContent = ''; };
  const openLb = (b) => { list = items.filter(x => !x.classList.contains('hide')); show(list.indexOf(b));
    const run = () => Modal.open(lb, b);
    if (canVT) { try { document.startViewTransition(run); return; } catch {} }
    run(); };
  items.forEach(b => b.addEventListener('click', () => openLb(b)));
  $('.lb-nav.prev', lb).addEventListener('click', () => show(gi - 1)); $('.lb-nav.next', lb).addEventListener('click', () => show(gi + 1));
  addEventListener('keydown', e => { if (Modal.cur === lb && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) show(gi + (e.key === 'ArrowLeft' ? -1 : 1)); });
  let sx = null; lb.addEventListener('pointerdown', e => sx = e.clientX); lb.addEventListener('pointerup', e => { if (sx !== null && Math.abs(e.clientX - sx) > 50) show(gi + (e.clientX < sx ? 1 : -1)); sx = null; });
  // очищаем src после закрытия, чтобы не висел broken img
  const mo = new MutationObserver(() => { if (lb.hidden) clearLb(); });
  mo.observe(lb, { attributes: true, attributeFilter: ['hidden'] }); }
const filters = $$('[data-filter]');
filters.forEach(f => f.addEventListener('click', () => { filters.forEach(x => x.setAttribute('aria-pressed', x === f)); const c = f.dataset.filter;
  $$('.g').forEach(g => g.classList.toggle('hide', c !== 'all' && g.dataset.cat !== c)); }));

// ===== уютная ночь: запись =====
const rsvp = $('#rsvpForm');
if (rsvp) { const st = $('#rsvpStatus'); const showSaved = () => { try { const r = JSON.parse(store.get('mia-rsvp-v2')); if (r) st.textContent = `Ты в списке, ${r.n}! Принесёшь: ${r.b}. ♡`; } catch {} }; showSaved();
  rsvp.addEventListener('submit', e => { e.preventDefault(); const n = $('#rsvpName').value.trim().slice(0, 24); if (!n) return; store.set('mia-rsvp-v2', JSON.stringify({ n, b: $('#rsvpBring').value })); showSaved(); toast('Записала тебя на Уютную ночь ♡'); Sound.meow();
    const r = rsvp.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + 40); }); }

// ===== фан-зона: вкладки =====
const tabs = $$('[role=tab]');
if (tabs.length) { const activate = (t, focus) => { tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; $('#' + x.getAttribute('aria-controls')).hidden = !on; }); if (focus) t.focus(); store.set('mia-tab', t.id); dispatchEvent(new Event('tabchange')); };
  tabs.forEach((t, i) => { t.addEventListener('click', () => activate(t)); t.addEventListener('keydown', e => { const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (d) { e.preventDefault(); activate(tabs[(i + d + tabs.length) % tabs.length], true); } }); });
  const h = location.hash.slice(1), byHash = tabs.find(t => t.getAttribute('aria-controls') === 't-' + h), saved = tabs.find(t => t.id === store.get('mia-tab')); activate(byHash || saved || tabs[0]); }

// генератор аватарки
const ac = $('#avaCanvas');
if (ac) { const ax = ac.getContext('2d'), S = 512; let img = null, ox = 0, oy = 0, drag = null; const opt = { ears: true, bow: true, blush: false, frame: true };
  load('img/face-pajama2.png').then(i => { img = i; draw(); });
  const zoom = $('#avaZoom'), col = $('#avaColor'), earS = $('#avaEar');
  function ear(x, y, s, flip) { ax.save(); ax.translate(x, y); ax.scale(flip ? -s : s, s); ax.fillStyle = col.value; ax.strokeStyle = '#2A2230'; ax.lineWidth = 6;
    ax.beginPath(); ax.moveTo(-50, 40); ax.quadraticCurveTo(-40, -70, 10, -95); ax.quadraticCurveTo(40, -30, 50, 40); ax.closePath(); ax.fill(); ax.stroke();
    ax.fillStyle = '#fff'; ax.beginPath(); ax.moveTo(-26, 30); ax.quadraticCurveTo(-18, -40, 8, -60); ax.quadraticCurveTo(26, -10, 28, 30); ax.closePath(); ax.fill(); ax.restore(); }
  function draw() { ax.clearRect(0, 0, S, S); ax.save(); ax.beginPath(); ax.arc(S / 2, S / 2, S / 2, 0, 7); ax.clip(); ax.fillStyle = '#fbd9e7'; ax.fillRect(0, 0, S, S);
    if (img) { const z = +zoom.value, s = Math.max(S / img.width, S / img.height) * z, w = img.width * s, h = img.height * s; ax.drawImage(img, (S - w) / 2 + ox, (S - h) / 2 + oy, w, h); }
    if (opt.blush) { ax.fillStyle = '#ff8fb066'; [[170, 330], [342, 330]].forEach(([x, y]) => { ax.beginPath(); ax.ellipse(x, y, 40, 22, 0, 0, 7); ax.fill(); }); }
    ax.restore(); const es = +earS.value;
    if (opt.ears) { ear(140, 120, es, false); ear(372, 120, es, true); }
    if (opt.bow) { ax.save(); ax.translate(390, 210); ax.rotate(.3); ax.fillStyle = '#e0607e'; ax.strokeStyle = '#2A2230'; ax.lineWidth = 5;
      ax.beginPath(); ax.moveTo(0, 0); ax.lineTo(-55, -32); ax.lineTo(-55, 32); ax.closePath(); ax.fill(); ax.stroke(); ax.beginPath(); ax.moveTo(0, 0); ax.lineTo(55, -32); ax.lineTo(55, 32); ax.closePath(); ax.fill(); ax.stroke();
      ax.fillStyle = '#F5B8D4'; ax.beginPath(); ax.arc(0, 0, 14, 0, 7); ax.fill(); ax.stroke(); ax.restore(); }
    if (opt.frame) { ax.lineWidth = 16; ax.strokeStyle = '#F5B8D4'; ax.beginPath(); ax.arc(S / 2, S / 2, S / 2 - 8, 0, 7); ax.stroke(); } }
  $('#avaFile').addEventListener('change', e => { const f = e.target.files[0]; if (!f) return; const u = URL.createObjectURL(f); load(u).then(i => { if (!i) { toast('Не получилось открыть фото'); return; } img = i; ox = oy = 0; zoom.value = 1; draw(); URL.revokeObjectURL(u); toast('Фото загружено — только у тебя в браузере'); }); });
  [zoom, col, earS].forEach(i => i.addEventListener('input', draw));
  $$('[data-ava]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.ava; opt[k] = !opt[k]; b.setAttribute('aria-pressed', opt[k]); draw(); }));
  ac.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, ox, oy }; ac.setPointerCapture(e.pointerId); });
  ac.addEventListener('pointermove', e => { if (!drag) return; const k = S / ac.getBoundingClientRect().width; ox = drag.ox + (e.clientX - drag.x) * k; oy = drag.oy + (e.clientY - drag.y) * k; draw(); });
  ac.addEventListener('pointerup', () => drag = null); ac.addEventListener('pointercancel', () => drag = null);
  $('#avaDl').addEventListener('click', () => { dl(ac.toDataURL('image/png'), 'mia-avatarka.png'); toast('Аватарка сохранена ♡'); }); }

// гиф-фабрика
const gc = $('#gifCanvas');
if (gc) { const gx = gc.getContext('2d'); let gImg, t0 = performance.now(); const gSet = async () => { gImg = await load($('#gifImg').value); }; $('#gifImg').addEventListener('change', gSet); gSet();
  function gDraw(t) { const k = (t - t0) / 1000, a = $('#gifAnim').value; gx.fillStyle = '#fbd9e7'; gx.fillRect(0, 0, 320, 320);
    let dx = 0, dy = 0, r = 0; if (a === 'bounce') dy = -Math.abs(Math.sin(k * 5)) * 24; else if (a === 'shake') dx = Math.sin(k * 40) * 6; else r = Math.sin(k * 6) * .12;
    if (gImg) { gx.save(); gx.translate(160 + dx, 165 + dy); gx.rotate(r); gx.beginPath(); gx.arc(0, 0, 115, 0, 7); gx.clip(); gx.drawImage(gImg, -120, -120, 240, 240); gx.restore(); }
    const s = $('#gifStk').value; if (s) { gx.font = '48px serif'; gx.textAlign = 'start'; gx.fillText(s, 250, 70 + Math.sin(k * 4) * 6); }
    gx.font = 'bold 32px Fredoka, Nunito, sans-serif'; gx.textAlign = 'center'; gx.lineWidth = 6; gx.strokeStyle = '#fff'; gx.fillStyle = '#e0607e';
    const txt = $('#gifText').value; gx.strokeText(txt, 160, 305, 300); gx.fillText(txt, 160, 305, 300); }
  let gifOn = false;
  const gifPanel = gc.closest('.panel,.tab-panel,section') || gc.parentElement;
  const ioG = 'IntersectionObserver' in window ? new IntersectionObserver(([e]) => { gifOn = e.isIntersecting && !document.hidden; }, { threshold: .05 }) : null;
  if (ioG) ioG.observe(gifPanel); else gifOn = true;
  addEventListener('visibilitychange', () => {});
  (function loop(t) { if (gifOn && !document.hidden && !gc.closest('[hidden]')) gDraw(reduce || lite ? t0 : t); requestAnimationFrame(loop); })(t0);
  $('#gifPng').addEventListener('click', () => { dl(gc.toDataURL('image/png'), 'mia-kadr.png'); toast('Кадр сохранён'); });
  $('#gifRec').addEventListener('click', () => { const st = $('#gifStatus');
    if (!window.MediaRecorder || !gc.captureStream) { st.textContent = 'Запись не поддерживается — сохранила кадр.'; return dl(gc.toDataURL(), 'mia-kadr.png'); }
    const rec = new MediaRecorder(gc.captureStream(30), MediaRecorder.isTypeSupported('video/webm') ? { mimeType: 'video/webm' } : {}), chunks = [];
    rec.ondataavailable = e => chunks.push(e.data); rec.onstop = () => { dl(URL.createObjectURL(new Blob(chunks, { type: 'video/webm' })), 'mia-gifka.webm'); st.textContent = 'Готово!'; toast('Видео-гифка готова ♡'); };
    st.textContent = 'Записываю 3 секунды…'; rec.start(); setTimeout(() => rec.stop(), 3000); }); }

// мем-мейкер
const mc = $('#memeCanvas');
if (mc) { const mx = mc.getContext('2d');
  async function meme() { const i = await load($('#memeImg').value); if (!i) return; const s = Math.max(600 / i.width, 600 / i.height);
    mx.drawImage(i, (600 - i.width * s) / 2, (600 - i.height * s) / 2, i.width * s, i.height * s);
    mx.font = 'bold 44px Fredoka, Nunito, Impact, sans-serif'; mx.textAlign = 'center'; mx.lineWidth = 8; mx.strokeStyle = '#2A2230'; mx.fillStyle = '#fff';
    [[$('#memeTop').value, 60], [$('#memeBot').value, 575]].forEach(([t, y]) => { t = t.toUpperCase(); mx.strokeText(t, 300, y, 570); mx.fillText(t, 300, y, 570); }); }
  ['#memeImg', '#memeTop', '#memeBot'].forEach(s => $(s).addEventListener('input', meme)); meme(); document.fonts && document.fonts.ready.then(meme);
  $('#memeDl').addEventListener('click', () => { dl(mc.toDataURL('image/png'), 'mia-mem.png'); toast('Мем сохранён 😸'); }); }

// примерка
const tryFace = $('#tryFace');
if (tryFace) { tryFace.addEventListener('change', e => $('#tryImg').src = e.target.value);
  $$('[data-acc]').forEach(c => c.addEventListener('click', () => { const on = c.getAttribute('aria-pressed') !== 'true'; c.setAttribute('aria-pressed', on); $('.acc-' + c.dataset.acc).classList.toggle('on', on); })); }

// погладь котика
const pet = $('#petZone');
if (pet) { const cnt = $('#petCount'); let n = +store.get('mia-purr') || 0, acc = 0, lastP = null; cnt.textContent = n;
  const purr = () => { n++; cnt.textContent = n; store.set('mia-purr', n); pet.classList.remove('petting'); void pet.offsetWidth; pet.classList.add('petting'); Sound.tone(180 + Math.random() * 40, .2, 'sawtooth', .015);
    if (n % 25 === 0) { toast(`Мрр! Уже ${n} мурлыканий ♡`); const r = pet.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + 20); } };
  pet.addEventListener('pointermove', e => { if (lastP) { acc += Math.hypot(e.clientX - lastP.x, e.clientY - lastP.y); if (acc > 120) { acc = 0; purr(); } } lastP = { x: e.clientX, y: e.clientY }; });
  pet.addEventListener('pointerleave', () => lastP = null); pet.addEventListener('click', purr); }

// куча клубков: собственная простая физика
const yc = $('#yarn');
if (yc) { const yx = yc.getContext('2d'), W = 480, H = 320, cols = ['#F5B8D4', '#e0607e', '#b99cff', '#F2766B', '#ffd98a', '#9fd8c8']; let balls = [], grab = null, last = performance.now(), running = false;
  const add = () => { if (balls.length > 40) balls.shift(); balls.push({ x: 40 + Math.random() * 400, y: -20, vx: (Math.random() - .5) * 100, vy: 0, r: 16 + Math.random() * 12, c: cols[balls.length % cols.length], a: 0 }); };
  for (let i = 0; i < 14; i++) add();
  const pos = e => { const r = yc.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };
  yc.addEventListener('pointerdown', e => { const p = pos(e); grab = balls.find(b => Math.hypot(b.x - p.x, b.y - p.y) < b.r + 6) || null; if (grab) { yc.setPointerCapture(e.pointerId); grab.px = p.x; grab.py = p.y; yc.style.cursor = 'grabbing'; } });
  yc.addEventListener('pointermove', e => { if (!grab) return; const p = pos(e); grab.vx = (p.x - grab.x) * 30; grab.vy = (p.y - grab.y) * 30; grab.x = p.x; grab.y = p.y; });
  const rel = () => { grab = null; yc.style.cursor = ''; }; yc.addEventListener('pointerup', rel); yc.addEventListener('pointercancel', rel);
  $('#yarnAdd').addEventListener('click', add); $('#yarnShake').addEventListener('click', () => balls.forEach(b => { b.vy -= 300 + Math.random() * 300; b.vx += (Math.random() - .5) * 400; }));
  let yarnOn = false, yarnRaf = 0;
  const yarnKick = () => { if (!yarnRaf && yarnOn && !document.hidden) yarnRaf = requestAnimationFrame(step); };
  const ioY = 'IntersectionObserver' in window ? new IntersectionObserver(([e]) => { yarnOn = e.isIntersecting; if (yarnOn) yarnKick(); }, { threshold: .05 }) : null;
  if (ioY) ioY.observe(yc); else { yarnOn = true; yarnKick(); }
  addEventListener('visibilitychange', () => { if (!document.hidden) yarnKick(); });
  function step(t) { yarnRaf = 0; if (!yarnOn || document.hidden) return; const dt = Math.min(.033, (t - last) / 1000); last = t;
    if (!yc.closest('[hidden]')) { for (let it = 0; it < 2; it++) { const h = dt / 2;
        balls.forEach(b => { if (b === grab) return; b.vy += 900 * h; b.x += b.vx * h; b.y += b.vy * h; b.a += b.vx * h / b.r;
          if (b.y > H - b.r) { b.y = H - b.r; b.vy *= -.45; b.vx *= .96; } if (b.x < b.r) { b.x = b.r; b.vx *= -.6; } if (b.x > W - b.r) { b.x = W - b.r; b.vx *= -.6; } });
        for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) { const a = balls[i], b = balls[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, o = a.r + b.r - d;
          if (o > 0) { const nx = dx / d, ny = dy / d, ma = a === grab ? 0 : 1, mb = b === grab ? 0 : 1, s = ma + mb || 1; a.x -= nx * o * ma / s; a.y -= ny * o * ma / s; b.x += nx * o * mb / s; b.y += ny * o * mb / s;
            const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny; if (rv < 0) { const imp = -1.3 * rv / s; a.vx -= imp * nx * ma; a.vy -= imp * ny * ma; b.vx += imp * nx * mb; b.vy += imp * ny * mb; } } } }
      yx.clearRect(0, 0, W, H); balls.forEach(b => { yx.save(); yx.translate(b.x, b.y); yx.rotate(b.a); yx.fillStyle = b.c; yx.beginPath(); yx.arc(0, 0, b.r, 0, 7); yx.fill();
        yx.strokeStyle = '#ffffff99'; yx.lineWidth = 2; for (let k = -2; k <= 2; k++) { yx.beginPath(); yx.ellipse(0, 0, b.r * .9, Math.abs(k) * b.r * .25 + 2, k * .5, 0, 7); yx.stroke(); } yx.restore(); }); }
    yarnKick(); }
}

// лазерная указка
const area = $('.toy-area');
if (area) { const laser = $('.laser', area), [el, er] = $$('.ear', area); let lp = { x: .5, y: .3 };
  const setLaser = (x, y) => { lp = { x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) }; laser.style.left = lp.x * 100 + '%'; laser.style.top = lp.y * 100 + '%';
    const tilt = (lp.x - .5) * 50, perk = 1 + (1 - lp.y) * .3; el.style.transform = `rotate(${tilt - 10}deg) scaleY(${perk})`; er.style.transform = `rotate(${tilt + 10}deg) scaleY(${perk})`; };
  area.addEventListener('pointermove', e => { const r = area.getBoundingClientRect(); setLaser((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height); });
  area.addEventListener('keydown', e => { const d = { ArrowLeft: [-.05, 0], ArrowRight: [.05, 0], ArrowUp: [0, -.05], ArrowDown: [0, .05] }[e.key]; if (d) { e.preventDefault(); setLaser(lp.x + d[0], lp.y + d[1]); } });
  setLaser(.5, .3); }

// лови сердечки
const cv = $('#game');
if (cv) { const cx = cv.getContext('2d'); let px = 240, tx = 240, hearts = [], sparks = [], score = 0, best = +store.get('mia-best') || 0, end = 0, run = false, keys = {}, lastF = 0, spawnAcc = 0;
  const sc = $('#gameScore'), upd = () => sc.textContent = `Очки: ${score} · Рекорд: ${best}`; upd();
  const mv = e => { const r = cv.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width * 480; };
  cv.addEventListener('pointermove', mv); cv.addEventListener('pointerdown', mv);
  addEventListener('keydown', e => { if (run && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { keys[e.key] = 1; e.preventDefault(); } }); addEventListener('keyup', e => keys[e.key] = 0);
  function frame(t) { if (!run) return; const dt = Math.min(.05, (t - lastF) / 1000); lastF = t;
    if (keys.ArrowLeft) tx -= 420 * dt; if (keys.ArrowRight) tx += 420 * dt; tx = Math.max(40, Math.min(440, tx)); px += (tx - px) * (1 - Math.exp(-dt * 18));
    spawnAcc += dt; const rate = .55 - Math.min(.3, (30 - (end - t) / 1000) * .01);
    if (spawnAcc > rate) { spawnAcc = 0; hearts.push({ x: 20 + Math.random() * 440, y: -20, vy: 40 + Math.random() * 50, g: 120 + Math.random() * 80, ph: Math.random() * 6.28, sw: 10 + Math.random() * 20, s: 22 + Math.random() * 10 }); }
    cx.clearRect(0, 0, 480, 320); cx.textAlign = 'center';
    hearts = hearts.filter(h => { h.vy = Math.min(h.vy + h.g * dt, 320); h.y += h.vy * dt; h.ph += dt * 3; const hx = h.x + Math.sin(h.ph) * h.sw;
      if (h.y > 285 && h.y < 310 && Math.abs(hx - px) < 45) { score++; upd(); Sound.tone(990 + score * 8, .08); for (let k = 0; k < 6; k++) sparks.push({ x: hx, y: 288, vx: (Math.random() - .5) * 160, vy: -60 - Math.random() * 120, life: .6 }); return false; }
      cx.font = h.s + 'px serif'; cx.fillStyle = '#e0607e'; cx.fillText('♥', hx, h.y); return h.y < 340; });
    sparks = sparks.filter(p => { p.vy += 300 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; cx.globalAlpha = Math.max(0, p.life / .6); cx.fillStyle = '#F5B8D4'; cx.font = '12px serif'; cx.fillText('✦', p.x, p.y); cx.globalAlpha = 1; return p.life > 0; });
    cx.fillStyle = '#fff'; cx.strokeStyle = '#e0607e'; cx.lineWidth = 3; cx.beginPath(); cx.roundRect ? cx.roundRect(px - 40, 290, 80, 22, 11) : cx.rect(px - 40, 290, 80, 22); cx.fill(); cx.stroke();
    const left = Math.max(0, Math.ceil((end - t) / 1000)); cx.fillStyle = '#7a2e4f'; cx.font = 'bold 18px Fredoka, Nunito, sans-serif'; cx.fillText(left + ' с', 445, 24);
    if (t >= end) { run = false; if (score > best) { best = score; store.set('mia-best', best); toast('Новый рекорд! ♡'); } upd(); cx.font = 'bold 30px Fredoka, Nunito, sans-serif'; cx.fillText('Уютно! ♡ ' + score, 240, 160); return; }
    requestAnimationFrame(frame); }
  $('#gameStart').addEventListener('click', () => { score = 0; hearts = []; sparks = []; upd(); run = true; lastF = performance.now(); end = lastF + 30000; requestAnimationFrame(frame); }); }

// стена фанатов
const wall = $('#wall');
if (wall) { const KEY = 'mia-wall'; const getW = () => { try { return JSON.parse(store.get(KEY)) || []; } catch { return []; } };
  const liFor = (w, i) => { const li = document.createElement('li'); li.style.setProperty('--t', (i % 3 - 1) * 1.5 + 'deg'); const b = document.createElement('b'); b.textContent = w.n + ': '; li.append(b, document.createTextNode(w.m)); return li; };
  let placeholder = false;
  const render = () => { wall.textContent = ''; const list = getW(); placeholder = !list.length; if (placeholder) list.push({ n: 'MIA', m: 'Оставь первую тёплую записку! ♡' }); list.slice(-30).reverse().forEach((w, i) => wall.append(liFor(w, i))); };
  $('#wallForm').addEventListener('submit', e => { e.preventDefault(); const n = $('#wallName').value.trim(), m = $('#wallMsg').value.trim(); if (!n || !m) return;
    const l = getW(), w = { n: n.slice(0, 24), m: m.slice(0, 140) }; l.push(w); store.set(KEY, JSON.stringify(l.slice(-100))); $('#wallMsg').value = '';
    if (placeholder) { wall.textContent = ''; placeholder = false; } const li = liFor(w, l.length); li.classList.add('new'); wall.prepend(li); while (wall.children.length > 30) wall.lastElementChild.remove(); Sound.tone(880, .14, 'triangle'); toast('Записка приколота ♡'); });
  render(); }

// ===== LUXE: бархатный блик подвала за курсором =====
(() => { const f = document.querySelector('footer'); if (!f || reduce) return;
  f.addEventListener('pointermove', e => { const r = f.getBoundingClientRect(); f.style.setProperty('--mx', (e.clientX - r.left) + 'px'); f.style.setProperty('--my', (e.clientY - r.top) + 'px'); }, { passive: true }); })();

// люстра: без курсорного push (дорого)
// котёнок в коробке: выглядывает в своём ритме, моргает нерегулярно, 3 клика — выпрыгивает
(() => { const k = $('#kitBox'); if (!k) return; let clicks = 0;
  const blink = () => { k.classList.remove('blink'); void k.offsetWidth; k.classList.add('blink'); };
  if (reduce) { k.classList.add('peek'); } else {
    const peek = () => { k.classList.add('peek'); setTimeout(blink, 900 + Math.random() * 900); setTimeout(() => { if (!k.matches(':hover')) k.classList.remove('peek'); setTimeout(peek, 3000 + Math.random() * 6000); }, 2600 + Math.random() * 2600); };
    setTimeout(peek, 1500 + Math.random() * 2000);
    (function bl() { setTimeout(() => { if (k.classList.contains('peek')) blink(); bl(); }, 1800 + Math.random() * 3500); })(); }
  k.addEventListener('click', e => { clicks++; blink(); Sound.meow();
    if (clicks % 3 === 0) { k.classList.add('out'); const r = k.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + 20, 14); toast('Мяу! Ты нашёл(ла) котёнка в коробке ♡'); setTimeout(() => k.classList.remove('out'), 1200); } }); })();
// нажатие: волна; магнитные крупные кнопки; свет за курсором на карточках
document.addEventListener('pointerdown', e => { const b = e.target.closest('.btn,.chip'); if (!b || reduce) return; const r = b.getBoundingClientRect(), s = document.createElement('span');
  s.className = 'ripple'; s.setAttribute('aria-hidden', 'true'); s.style.setProperty('--rx', (e.clientX - r.left) + 'px'); s.style.setProperty('--ry', (e.clientY - r.top) + 'px'); b.append(s); setTimeout(() => s.remove(), 650); });
/* магнит и spotlight убраны ради FPS; остался CSS :hover */
// пылинки в окне
(() => { const w = $('.window'); if (!w || true) return; // пылинки отключены ради FPS const m = document.createElement('span'); m.className = 'motes'; m.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 14; i++) { const d = document.createElement('i'); d.style.cssText = `left:${10 + Math.random() * 70}%;top:${30 + Math.random() * 60}%;--t:${6 + Math.random() * 7}s;--dl:${-Math.random() * 10}s;--dx:${(Math.random() * 40 - 20).toFixed(0)}px`; m.append(d); } w.append(m); })();
// пасхалка: набери «мяу» (или meow) — дождь из лапок
(() => { let buf = ''; addEventListener('keydown', e => { if (e.target.closest('input,textarea,select,[contenteditable]') || e.key.length !== 1) return; buf = (buf + e.key.toLowerCase()).slice(-4);
  if (/мяу$|meow$/.test(buf)) { buf = ''; Sound.meow(); toast('Мяу-мяу! Лапки сыплются с неба ♡'); if (reduce) return;
    for (let i = 0; i < 26; i++) setTimeout(() => { const p = document.createElement('span'); p.className = 'paw-rain'; p.textContent = '🐾'; p.setAttribute('aria-hidden', 'true');
      p.style.cssText = `left:${Math.random() * 100}vw;--t:${2.4 + Math.random() * 2}s;--dx:${(Math.random() * 120 - 60).toFixed(0)}px;--r:${(Math.random() * 360).toFixed(0)}deg`; document.body.append(p); setTimeout(() => p.remove(), 4600); }, i * 70); } }); })();
// поздним вечером лампа сама приглушается, если гость ещё не выбирал
(() => { const h = new Date().getHours(); if ((h >= 22 || h < 6) && store.get('mia-night') == null && typeof setNight === 'function') { setNight(true); } })();
// @@LUXE-END
})();
