(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const load = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.src = src; });

// nav
const burger = $('.burger'), menu = $('#menu');
burger.addEventListener('click', () => { const o = menu.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });
$$('#menu a').forEach(a => a.addEventListener('click', () => { menu.classList.remove('open'); burger.setAttribute('aria-expanded', false); }));

// sound (WebAudio synth, off by default, only after a user gesture)
const Sound = (() => { let ctx = null, on = localStorage.getItem('mia-sound') === 'on', last = 0;
  const btn = $('#soundToggle'), ui = () => { btn.setAttribute('aria-pressed', on); btn.textContent = on ? '🔊' : '🔇'; btn.setAttribute('aria-label', 'Hover sounds: ' + (on ? 'on' : 'off')); };
  const ensure = () => { if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); } if (ctx.state === 'suspended') ctx.resume(); return ctx; };
  function tone(f = 880, d = .09, type = 'sine', vol = .03) { if (!on || !ctx) return; const n = ctx.currentTime; if (n - last < .05) return; last = n;
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, n); o.frequency.exponentialRampToValueAtTime(f * 1.5, n + d);
    g.gain.setValueAtTime(0, n); g.gain.linearRampToValueAtTime(vol, n + .01); g.gain.exponentialRampToValueAtTime(.0001, n + d); o.connect(g).connect(ctx.destination); o.start(n); o.stop(n + d + .02); }
  btn.addEventListener('click', () => { on = !on; localStorage.setItem('mia-sound', on ? 'on' : 'off'); ui(); if (on) { ensure(); tone(660, .12); } });
  // context is only created after a real gesture; a remembered "on" waits for the first click/key
  const unlock = () => { if (on) ensure(); removeEventListener('pointerdown', unlock); removeEventListener('keydown', unlock); };
  addEventListener('pointerdown', unlock); addEventListener('keydown', unlock); ui();
  return { tone }; })();
document.addEventListener('pointerover', e => { const t = e.target.closest('.btn,.chip,nav a,.g,.sticker,.lb-nav'); if (t && !t.contains(e.relatedTarget)) Sound.tone(1100 + Math.random() * 200, .07); });
document.addEventListener('click', e => { const t = e.target.closest('.btn,.chip'); if (!t) return; Sound.tone(700, .1, 'triangle');
  if (!reduce) { t.classList.remove('pop'); void t.offsetWidth; t.classList.add('pop'); } });
document.addEventListener('animationend', e => e.target.classList && e.target.classList.remove('pop'));

// reveal with stagger
$$('.story-grid,.shop,.tool-grid,.events,.gallery,.stickers,.comic').forEach(g => [...g.children].forEach((c, i) => { c.style.setProperty('--d', i * .09 + 's'); if (!c.classList.contains('reveal') && !g.classList.contains('reveal')) c.classList.add('reveal'); }));
$$('.gallery,.comic').forEach(g => g.classList.add('zoom'));
$$('.sec>h2').forEach(h => h.classList.add('reveal'));
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -40px' });
$$('.reveal').forEach(el => reduce ? el.classList.add('in') : io.observe(el));

// hero parallax
if (!reduce) { const layers = $$('.hero .parallax'), hero = $('.hero'); let ticking = false, visible = true;
  new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(hero);
  const apply = () => { ticking = false; const y = scrollY; layers.forEach(l => l.style.setProperty('--py', (y * +l.dataset.depth).toFixed(1) + 'px')); };
  addEventListener('scroll', () => { if (visible && !ticking) { ticking = true; requestAnimationFrame(apply); } }, { passive: true }); }

// background hearts: rAF physics with delta time
if (!reduce) { const box = $('.petals'), ps = []; let lastT = performance.now(), acc = 0;
  function spawn() { const el = document.createElement('span'); el.className = 'petal'; el.textContent = Math.random() < .5 ? '♡' : '❀'; el.style.fontSize = 12 + Math.random() * 16 + 'px'; box.appendChild(el);
    ps.push({ el, x: Math.random() * innerWidth, y: -30, vy: 10 + Math.random() * 20, ph: Math.random() * 6.28, sw: 15 + Math.random() * 25, rot: 0, vr: (Math.random() - .5) * 90 }); }
  (function step(t) { const dt = Math.min(.05, (t - lastT) / 1000); lastT = t;
    if (!document.hidden) { acc += dt; if (acc > .7 && ps.length < 18) { acc = 0; spawn(); }
      const wind = Math.sin(t / 4000) * 12;
      for (let i = ps.length - 1; i >= 0; i--) { const p = ps[i]; p.vy = Math.min(p.vy + 18 * dt, 70); p.y += p.vy * dt; p.ph += dt * 1.6; p.x += wind * dt; p.rot += p.vr * dt;
        p.el.style.transform = `translate3d(${p.x + Math.sin(p.ph) * p.sw}px,${p.y}px,0) rotate(${p.rot}deg)`;
        if (p.y > innerHeight + 40) { p.el.remove(); ps.splice(i, 1); } } }
    requestAnimationFrame(step); })(lastT); }

// modals: animated open/close, focus trap, Esc
const Modal = (() => { let cur = null, back = null;
  const focusables = m => $$('button,[href],input,select,[tabindex]:not([tabindex="-1"])', m).filter(x => !x.disabled && x.offsetParent !== null);
  function open(m, from) { if (cur) close(true); cur = m; back = from || document.activeElement; m.hidden = false; void m.offsetWidth; m.classList.add('open'); document.body.style.overflow = 'hidden'; (focusables(m)[0] || m).focus(); Sound.tone(520, .15); }
  function close(instant) { const m = cur; if (!m) return; cur = null; m.classList.remove('open'); document.body.style.overflow = '';
    const done = () => { if (!m.classList.contains('open')) m.hidden = true; }; instant || reduce ? done() : setTimeout(done, 280); back && back.focus && back.focus(); }
  addEventListener('keydown', e => { if (!cur) return; if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'Tab') { const f = focusables(cur); if (!f.length) return; const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } } });
  $$('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) close(); }));
  return { open, close, get cur() { return cur; } }; })();

// lightbox
const lb = $('#lb'), lbImg = $('img', lb), gItems = $$('.g'); let gi = 0;
const showG = i => { gi = (i + gItems.length) % gItems.length; const im = $('img', gItems[gi]); lbImg.src = im.src; lbImg.alt = im.alt; };
gItems.forEach((b, i) => b.addEventListener('click', () => { showG(i); Modal.open(lb, b); }));
$('.lb-nav.prev').addEventListener('click', () => showG(gi - 1)); $('.lb-nav.next').addEventListener('click', () => showG(gi + 1));
addEventListener('keydown', e => { if (Modal.cur === lb && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) showG(gi + (e.key === 'ArrowLeft' ? -1 : 1)); });
$$('.shop-soon').forEach(b => b.addEventListener('click', () => Modal.open($('#shopModal'), b)));

// GIF factory (animated canvas -> WebM via MediaRecorder, PNG fallback)
const gc = $('#gifCanvas'), gx = gc.getContext('2d'); let gImg, t0 = performance.now();
const gSet = async () => { gImg = await load($('#gifImg').value); }; $('#gifImg').addEventListener('change', gSet); gSet();
function gDraw(t) { const k = (t - t0) / 1000, a = $('#gifAnim').value; gx.fillStyle = '#ffd1dc'; gx.fillRect(0, 0, 320, 320);
  let dx = 0, dy = 0, r = 0; if (a === 'bounce') dy = -Math.abs(Math.sin(k * 5)) * 24; else if (a === 'shake') dx = Math.sin(k * 40) * 6; else r = Math.sin(k * 6) * .12;
  if (gImg) { gx.save(); gx.translate(160 + dx, 175 + dy); gx.rotate(r); gx.drawImage(gImg, -120, -120, 240, 240); gx.restore(); }
  const s = $('#gifStk').value; if (s) { gx.font = '48px serif'; gx.fillText(s, 250, 70 + Math.sin(k * 4) * 6); }
  gx.font = 'bold 34px Fredoka, sans-serif'; gx.textAlign = 'center'; gx.lineWidth = 6; gx.strokeStyle = '#fff'; gx.fillStyle = '#c8102e';
  const txt = $('#gifText').value; gx.strokeText(txt, 160, 305); gx.fillText(txt, 160, 305); gx.textAlign = 'start'; }
(function loop(t) { gDraw(reduce ? t0 : t); requestAnimationFrame(loop); })(t0);
const dl = (url, name) => { const a = document.createElement('a'); a.href = url; a.download = name; a.click(); };
$('#gifPng').addEventListener('click', () => dl(gc.toDataURL('image/png'), 'mia-frame.png'));
$('#gifRec').addEventListener('click', () => { const st = $('#gifStatus');
  if (!window.MediaRecorder || !gc.captureStream) { st.textContent = 'Recording not supported — saved PNG instead.'; return dl(gc.toDataURL(), 'mia-frame.png'); }
  const rec = new MediaRecorder(gc.captureStream(30), { mimeType: MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : '' }), chunks = [];
  rec.ondataavailable = e => chunks.push(e.data); rec.onstop = () => { dl(URL.createObjectURL(new Blob(chunks, { type: 'video/webm' })), 'mia-loop.webm'); st.textContent = 'Done!'; };
  st.textContent = 'Recording 3s…'; rec.start(); setTimeout(() => rec.stop(), 3000); });

// try-on
$('#tryFace').addEventListener('change', e => $('#tryImg').src = e.target.value);
$$('.chip').forEach(c => c.addEventListener('click', () => { const on = c.getAttribute('aria-pressed') !== 'true'; c.setAttribute('aria-pressed', on); $('.acc-' + c.dataset.acc).classList.toggle('on', on); }));

// meme maker
const mc = $('#memeCanvas'), mx = mc.getContext('2d');
async function meme() { const i = await load($('#memeImg').value); const s = Math.max(600 / i.width, 600 / i.height);
  mx.drawImage(i, (600 - i.width * s) / 2, (600 - i.height * s) / 2, i.width * s, i.height * s);
  mx.font = 'bold 44px Fredoka, Impact, sans-serif'; mx.textAlign = 'center'; mx.lineWidth = 8; mx.strokeStyle = '#3b1d27'; mx.fillStyle = '#fff';
  [[$('#memeTop').value, 60], [$('#memeBot').value, 575]].forEach(([t, y]) => { t = t.toUpperCase(); mx.strokeText(t, 300, y, 570); mx.fillText(t, 300, y, 570); }); }
['#memeImg', '#memeTop', '#memeBot'].forEach(s => $(s).addEventListener('input', meme)); meme();
document.fonts && document.fonts.ready.then(meme);
$('#memeDl').addEventListener('click', () => dl(mc.toDataURL('image/png'), 'mia-meme.png'));

// laser toy
const area = $('.toy-area'), laser = $('.laser'), [el, er] = $$('.ear', area); let lp = { x: .5, y: .3 };
function setLaser(x, y) { lp = { x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) }; laser.style.left = lp.x * 100 + '%'; laser.style.top = lp.y * 100 + '%';
  const tilt = (lp.x - .5) * 50, perk = 1 + (1 - lp.y) * .3; el.style.transform = `rotate(${tilt - 10}deg) scaleY(${perk})`; er.style.transform = `rotate(${tilt + 10}deg) scaleY(${perk})`; }
area.addEventListener('pointermove', e => { const r = area.getBoundingClientRect(); setLaser((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height); });
area.addEventListener('keydown', e => { const d = { ArrowLeft: [-.05, 0], ArrowRight: [.05, 0], ArrowUp: [0, -.05], ArrowDown: [0, .05] }[e.key]; if (d) { e.preventDefault(); setLaser(lp.x + d[0], lp.y + d[1]); } });
setLaser(.5, .3);

// catch the hearts (gravity + sway, delta time)
const cv = $('#game'), cx = cv.getContext('2d'); let px = 240, tx = 240, hearts = [], sparks = [], score = 0, best = +localStorage.getItem('mia-best') || 0, end = 0, run = false, keys = {}, lastF = 0, spawnAcc = 0;
const sc = $('#gameScore'), upd = () => sc.textContent = `Score: ${score} · Best: ${best}`; upd();
const mv = e => { const r = cv.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width * 480; };
cv.addEventListener('pointermove', mv); cv.addEventListener('pointerdown', mv);
addEventListener('keydown', e => { if (run && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { keys[e.key] = 1; e.preventDefault(); } }); addEventListener('keyup', e => keys[e.key] = 0);
function frame(t) { if (!run) return; const dt = Math.min(.05, (t - lastF) / 1000); lastF = t;
  if (keys.ArrowLeft) tx -= 420 * dt; if (keys.ArrowRight) tx += 420 * dt; tx = Math.max(40, Math.min(440, tx));
  px += (tx - px) * (1 - Math.exp(-dt * 18)); // smooth follow
  spawnAcc += dt; const rate = .55 - Math.min(.3, (30 - (end - t) / 1000) * .01);
  if (spawnAcc > rate) { spawnAcc = 0; hearts.push({ x: 20 + Math.random() * 440, y: -20, vy: 40 + Math.random() * 50, g: 120 + Math.random() * 80, ph: Math.random() * 6.28, sw: 10 + Math.random() * 20, s: 22 + Math.random() * 10 }); }
  cx.clearRect(0, 0, 480, 320); cx.textAlign = 'center';
  hearts = hearts.filter(h => { h.vy = Math.min(h.vy + h.g * dt, 320); h.y += h.vy * dt; h.ph += dt * 3; const hx = h.x + Math.sin(h.ph) * h.sw;
    if (h.y > 285 && h.y < 310 && Math.abs(hx - px) < 45) { score++; upd(); Sound.tone(990 + score * 8, .08); for (let k = 0; k < 6; k++) sparks.push({ x: hx, y: 288, vx: (Math.random() - .5) * 160, vy: -60 - Math.random() * 120, life: .6 }); return false; }
    cx.font = h.s + 'px serif'; cx.fillStyle = '#c8102e'; cx.fillText('♥', hx, h.y); return h.y < 340; });
  sparks = sparks.filter(p => { p.vy += 300 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; cx.globalAlpha = Math.max(0, p.life / .6); cx.fillStyle = '#ff8fb0'; cx.font = '12px serif'; cx.fillText('✦', p.x, p.y); cx.globalAlpha = 1; return p.life > 0; });
  cx.fillStyle = '#ff8fb0'; cx.beginPath(); cx.roundRect ? cx.roundRect(px - 40, 290, 80, 22, 11) : cx.rect(px - 40, 290, 80, 22); cx.fill();
  const left = Math.max(0, Math.ceil((end - t) / 1000)); cx.fillStyle = '#8a2943'; cx.font = 'bold 18px Fredoka, sans-serif'; cx.fillText(left + 's', 450, 24);
  if (t >= end) { run = false; if (score > best) { best = score; localStorage.setItem('mia-best', best); } upd(); cx.font = 'bold 30px Fredoka, sans-serif'; cx.fillText('Cozy! ♡ ' + score, 240, 160); return; }
  requestAnimationFrame(frame); }
$('#gameStart').addEventListener('click', () => { score = 0; hearts = []; sparks = []; upd(); run = true; lastF = performance.now(); end = lastF + 30000; requestAnimationFrame(frame); });

// countdown to next Friday 20:00 local (mock) with rolling digits
const target = (() => { const d = new Date(); d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7)); d.setHours(20, 0, 0, 0); if (d < new Date()) d.setDate(d.getDate() + 7); return d; })();
const cd = $('#countdown'), cdSr = $('#countdownSr'), units = [['d', 2], ['h', 2], ['m', 2], ['s', 2]], cells = {};
units.forEach(([u, n]) => { const w = document.createElement('span'); w.className = 'cd-unit'; cells[u] = [];
  for (let i = 0; i < n; i++) { const d = document.createElement('span'); d.className = 'digit'; d.innerHTML = '<span>0</span>'; w.append(d); cells[u].push(d); }
  const l = document.createElement('small'); l.textContent = u; w.append(l); cd.append(w); });
function setDigit(el, ch) { if (el.dataset.v === ch) return; el.dataset.v = ch; if (reduce) { el.innerHTML = `<span>${ch}</span>`; return; }
  const old = el.lastElementChild; old.className = 'old'; const n = document.createElement('span'); n.className = 'new'; n.textContent = ch; el.append(n); setTimeout(() => old.remove(), 460); }
let lastMin = -1; const tick = () => { const s = Math.max(0, (target - new Date()) / 1000 | 0); const v = { d: s / 86400 | 0, h: s % 86400 / 3600 | 0, m: s % 3600 / 60 | 0, s: s % 60 };
  units.forEach(([u]) => String(Math.min(99, v[u])).padStart(2, '0').split('').forEach((c, i) => setDigit(cells[u][i], c)));
  if (v.m !== lastMin) { lastMin = v.m; cdSr.textContent = `Cozy Night starts in ${v.d} days ${v.h} hours ${v.m} minutes`; } }; tick(); setInterval(tick, 1000);

// fan wall (text only, localStorage)
const KEY = 'mia-wall', wall = $('#wall');
const getW = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
function liFor(w, i) { const li = document.createElement('li'); li.style.setProperty('--t', (i % 3 - 1) * 1.5 + 'deg'); const b = document.createElement('b'); b.textContent = w.n + ': '; li.append(b, document.createTextNode(w.m)); return li; }
let placeholder = false;
function render() { wall.textContent = ''; const list = getW(); placeholder = !list.length; if (placeholder) list.push({ n: 'Mia', m: 'Be the first to leave a cozy note! ♡' });
  list.slice(-30).reverse().forEach((w, i) => wall.append(liFor(w, i))); }
$('#wallForm').addEventListener('submit', e => { e.preventDefault(); const n = $('#wallName').value.trim(), m = $('#wallMsg').value.trim(); if (!n || !m) return;
  const l = getW(), w = { n: n.slice(0, 24), m: m.slice(0, 140) }; l.push(w); localStorage.setItem(KEY, JSON.stringify(l.slice(-100))); $('#wallMsg').value = '';
  if (placeholder) { wall.textContent = ''; placeholder = false; }
  const li = liFor(w, l.length); li.classList.add('new'); wall.prepend(li); while (wall.children.length > 30) wall.lastElementChild.remove(); Sound.tone(880, .14, 'triangle'); });
render();
})();
