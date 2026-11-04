(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };

// навигация
const burger = $('.burger'), menu = $('#menu');
if (burger && menu) { burger.addEventListener('click', () => { const o = menu.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });
  $$('a', menu).forEach(a => a.addEventListener('click', () => { menu.classList.remove('open'); burger.setAttribute('aria-expanded', false); })); }

// звук (синтез WebAudio, выключен по умолчанию)
const Sound = (() => { let ctx = null, on = store.get('mia-sound') === 'on', last = 0; const btn = $('#soundToggle');
  const ui = () => { if (!btn) return; btn.setAttribute('aria-pressed', on); btn.textContent = on ? '🔊' : '🔇'; btn.setAttribute('aria-label', 'Звуки: ' + (on ? 'включены' : 'выключены')); };
  const ensure = () => { if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); } if (ctx.state === 'suspended') ctx.resume(); return ctx; };
  function tone(f = 880, d = .09, type = 'sine', vol = .03) { if (!on || !ctx) return; const n = ctx.currentTime; if (n - last < .05) return; last = n;
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, n); o.frequency.exponentialRampToValueAtTime(f * 1.5, n + d);
    g.gain.setValueAtTime(0, n); g.gain.linearRampToValueAtTime(vol, n + .01); g.gain.exponentialRampToValueAtTime(.0001, n + d); o.connect(g).connect(ctx.destination); o.start(n); o.stop(n + d + .02); }
  if (btn) btn.addEventListener('click', () => { on = !on; store.set('mia-sound', on ? 'on' : 'off'); ui(); if (on) { ensure(); tone(660, .12); } });
  const unlock = () => { if (on) ensure(); removeEventListener('pointerdown', unlock); removeEventListener('keydown', unlock); };
  addEventListener('pointerdown', unlock); addEventListener('keydown', unlock); ui(); return { tone }; })();
document.addEventListener('pointerover', e => { const t = e.target.closest && e.target.closest('.btn,.chip,nav a,.room-door'); if (t && !t.contains(e.relatedTarget)) Sound.tone(1100 + Math.random() * 200, .07); });
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('.btn,.chip,.lamp-toggle'); if (!t) return; Sound.tone(700, .1, 'triangle');
  if (!reduce) { t.classList.remove('pop'); void t.offsetWidth; t.classList.add('pop'); } });
document.addEventListener('animationend', e => e.target.classList && e.target.classList.remove('pop'));

// лампа: ночной режим
const lamp = $('#lampToggle');
const setNight = n => { document.body.classList.toggle('night', n); if (lamp) { lamp.setAttribute('aria-pressed', n); lamp.setAttribute('aria-label', n ? 'Лампа: включить дневной свет' : 'Лампа: включить ночной режим'); } };
setNight(store.get('mia-night') === '1');
if (lamp) lamp.addEventListener('click', () => { const n = !document.body.classList.contains('night'); setNight(n); store.set('mia-night', n ? '1' : '0'); Sound.tone(n ? 440 : 880, .2); });

// появление со ступенькой
$$('.rooms,.stickers,.comic,.gallery').forEach(g => [...g.children].forEach((c, i) => { c.style.setProperty('--d', i * .09 + 's'); c.classList.add('reveal'); }));
$$('.sec>h2').forEach(h => h.classList.add('reveal'));
const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -40px' }) : null;
$$('.reveal').forEach(el => reduce || !io ? el.classList.add('in') : io.observe(el));

// сцена «порог»: звёзды и лампочки
const stars = $('.stars'); if (stars) for (let i = 0; i < 40; i++) { const s = document.createElement('i'); s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;--tw:${2 + Math.random() * 3}s;--dl:${-Math.random() * 3}s`; stars.append(s); }
const bulbs = $('.bulbs'); if (bulbs) for (let i = 0; i < 14; i++) { const b = document.createElement('i'); const x = i / 13; b.style.cssText = `left:${x * 100}%;top:${(20 + Math.sin(x * Math.PI * 1.6) * 40 + 20)}%;--dl:${-i * .3}s`; bulbs.append(b); }

// сцена: курсор/палец + скролл
const th = $('#threshold'), scene = $('#scene'), card = $('#doorCard');
if (th && scene) { const layers = $$('.layer', scene); let mx = 0, my = 0, cx = 0, cy = 0, prog = 0, visible = true, raf = 0;
  const setPtr = (x, y) => { const r = th.getBoundingClientRect(); mx = (x - r.left) / r.width - .5; my = (y - r.top) / r.height - .5; kick(); };
  th.addEventListener('pointermove', e => setPtr(e.clientX, e.clientY), { passive: true });
  th.addEventListener('pointerdown', e => setPtr(e.clientX, e.clientY), { passive: true });
  th.addEventListener('pointerleave', () => { mx = my = 0; kick(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }).observe(th);
  addEventListener('scroll', kick, { passive: true }); addEventListener('resize', kick);
  function kick() { if (!raf && visible) raf = requestAnimationFrame(step); }
  function step() { raf = 0; const k = reduce ? 1 : .12; cx += (mx - cx) * k; cy += (my - cy) * k;
    prog = Math.min(1, Math.max(0, scrollY / (th.offsetHeight * .8)));
    th.style.setProperty('--p', prog.toFixed(3));
    if (!reduce) layers.forEach(l => { const d = +l.dataset.depth; l.style.transform = `translate3d(${(-cx * 40 * d).toFixed(1)}px,${(-cy * 30 * d + scrollY * d * .25).toFixed(1)}px,0) scale(${1 + prog * d * .25})`; });
    if (card && !reduce) card.style.setProperty('--rx', (cy * -12).toFixed(2) + 'deg'), card.style.setProperty('--ry', (cx * 16).toFixed(2) + 'deg');
    if (card) { card.style.setProperty('--gx', (50 + cx * 60) + '%'); card.style.setProperty('--gy', (38 + cy * 40) + '%'); }
    if (Math.abs(mx - cx) + Math.abs(my - cy) > .002 && !reduce) kick(); }
  step();
  if (card) card.addEventListener('click', e => { card.classList.remove('perk'); void card.offsetWidth; card.classList.add('perk'); Sound.tone(1200, .12, 'triangle'); burst(e.clientX, e.clientY); }); }

// сердечки по клику: физика с гравитацией
const fx = []; let fxRaf = 0, fxLast = 0;
function burst(x, y) { if (reduce) return; for (let i = 0; i < 9; i++) { const el = document.createElement('span'); el.className = 'pop-heart'; el.textContent = '♥'; el.setAttribute('aria-hidden', 'true'); document.body.append(el);
    const a = -Math.PI / 2 + (Math.random() - .5) * 1.8, v = 220 + Math.random() * 200; fx.push({ el, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1.2, r: 0, vr: (Math.random() - .5) * 400 }); }
  if (!fxRaf) { fxLast = performance.now(); fxRaf = requestAnimationFrame(fxStep); } }
function fxStep(t) { const dt = Math.min(.05, (t - fxLast) / 1000); fxLast = t;
  for (let i = fx.length - 1; i >= 0; i--) { const p = fx[i]; p.vy += 600 * dt; p.vx *= .99; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; p.life -= dt;
    p.el.style.transform = `translate3d(${p.x}px,${p.y}px,0) rotate(${p.r}deg)`; p.el.style.opacity = Math.max(0, p.life); if (p.life <= 0) { p.el.remove(); fx.splice(i, 1); } }
  fxRaf = fx.length ? requestAnimationFrame(fxStep) : 0; }

// фоновые сердечки
const box = $('.petals');
if (box && !reduce) { const ps = []; let lastT = performance.now(), acc = 0;
  function spawn() { const el = document.createElement('span'); el.className = 'petal'; el.textContent = Math.random() < .5 ? '♡' : '❀'; el.style.fontSize = 12 + Math.random() * 16 + 'px'; box.appendChild(el);
    ps.push({ el, x: Math.random() * innerWidth, y: -30, vy: 10 + Math.random() * 20, ph: Math.random() * 6.28, sw: 15 + Math.random() * 25, rot: 0, vr: (Math.random() - .5) * 90 }); }
  (function step(t) { const dt = Math.min(.05, (t - lastT) / 1000); lastT = t;
    if (!document.hidden) { acc += dt; if (acc > .9 && ps.length < 14) { acc = 0; spawn(); } const wind = Math.sin(t / 4000) * 12;
      for (let i = ps.length - 1; i >= 0; i--) { const p = ps[i]; p.vy = Math.min(p.vy + 18 * dt, 70); p.y += p.vy * dt; p.ph += dt * 1.6; p.x += wind * dt; p.rot += p.vr * dt;
        p.el.style.transform = `translate3d(${p.x + Math.sin(p.ph) * p.sw}px,${p.y}px,0) rotate(${p.rot}deg)`; if (p.y > innerHeight + 40) { p.el.remove(); ps.splice(i, 1); } } }
    requestAnimationFrame(step); })(lastT); }

// модалки
const Modal = (() => { let cur = null, back = null;
  const focusables = m => $$('button,[href],input,select,[tabindex]:not([tabindex="-1"])', m).filter(x => !x.disabled && x.offsetParent !== null);
  function open(m, from) { if (!m) return; if (cur) close(true); cur = m; back = from || document.activeElement; m.hidden = false; void m.offsetWidth; m.classList.add('open'); document.body.style.overflow = 'hidden'; (focusables(m)[0] || m).focus(); Sound.tone(520, .15); }
  function close(instant) { const m = cur; if (!m) return; cur = null; m.classList.remove('open'); document.body.style.overflow = '';
    const done = () => { if (!m.classList.contains('open')) m.hidden = true; }; instant || reduce ? done() : setTimeout(done, 280); back && back.focus && back.focus(); }
  addEventListener('keydown', e => { if (!cur) return; if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'Tab') { const f = focusables(cur); if (!f.length) return; const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } } });
  $$('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) close(); }));
  return { open, close, get cur() { return cur; } }; })();
const rsvp = $('#rsvpBtn');
if (rsvp) { const mark = () => { if (store.get('mia-rsvp') === '1') rsvp.textContent = 'Ты в списке ♡'; }; mark();
  rsvp.addEventListener('click', () => { store.set('mia-rsvp', '1'); mark(); Modal.open($('#rsvpModal'), rsvp); }); }

// обратный отсчёт до пятницы 20:00 с катящимися цифрами
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
})();
