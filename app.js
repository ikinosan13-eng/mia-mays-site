(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const load = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.src = src; });

// nav
const burger = $('.burger'), menu = $('#menu');
burger.addEventListener('click', () => { const o = menu.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });
$$('#menu a').forEach(a => a.addEventListener('click', () => { menu.classList.remove('open'); burger.setAttribute('aria-expanded', false); }));

// reveal
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
$$('.reveal').forEach(el => io.observe(el));

// petals / hearts
if (!reduce) { const box = $('.petals'); setInterval(() => { if (document.hidden || box.children.length > 18) return;
  const p = document.createElement('span'); p.className = 'petal'; p.textContent = Math.random() < .5 ? '♡' : '❀';
  p.style.left = Math.random() * 100 + 'vw'; p.style.fontSize = 12 + Math.random() * 16 + 'px'; p.style.animationDuration = 7 + Math.random() * 6 + 's';
  box.appendChild(p); p.addEventListener('animationend', () => p.remove()); }, 700); }

// lightbox
const lb = $('#lb'), lbImg = $('img', lb); let lastFocus;
$$('.g').forEach(b => b.addEventListener('click', () => { lastFocus = b; const i = $('img', b); lbImg.src = i.src; lbImg.alt = i.alt; lb.hidden = false; $('.lb-close').focus(); }));
const closeLb = () => { lb.hidden = true; lastFocus && lastFocus.focus(); };
$('.lb-close').addEventListener('click', closeLb); lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

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

// catch the hearts
const cv = $('#game'), cx = cv.getContext('2d'); let px = 240, hearts = [], score = 0, best = +localStorage.getItem('mia-best') || 0, end = 0, run = false, keys = {};
const sc = $('#gameScore'), upd = () => sc.textContent = `Score: ${score} · Best: ${best}`; upd();
const mv = e => { const r = cv.getBoundingClientRect(); px = (e.clientX - r.left) / r.width * 480; };
cv.addEventListener('pointermove', mv); cv.addEventListener('pointerdown', mv);
addEventListener('keydown', e => { if (run && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { keys[e.key] = 1; e.preventDefault(); } }); addEventListener('keyup', e => keys[e.key] = 0);
function frame(t) { if (!run) return; if (keys.ArrowLeft) px -= 7; if (keys.ArrowRight) px += 7; px = Math.max(40, Math.min(440, px));
  if (Math.random() < .04) hearts.push({ x: 20 + Math.random() * 440, y: -20, v: 2 + Math.random() * 2.5 });
  cx.clearRect(0, 0, 480, 320); cx.font = '26px serif'; cx.textAlign = 'center';
  hearts = hearts.filter(h => { h.y += h.v; if (h.y > 285 && h.y < 305 && Math.abs(h.x - px) < 45) { score++; upd(); return false; } cx.fillStyle = '#c8102e'; cx.fillText('♥', h.x, h.y); return h.y < 340; });
  cx.fillStyle = '#ff8fb0'; cx.beginPath(); cx.roundRect ? cx.roundRect(px - 40, 290, 80, 22, 11) : cx.rect(px - 40, 290, 80, 22); cx.fill();
  const left = Math.max(0, Math.ceil((end - t) / 1000)); cx.fillStyle = '#8a2943'; cx.font = 'bold 18px Fredoka, sans-serif'; cx.fillText(left + 's', 450, 24);
  if (t >= end) { run = false; if (score > best) { best = score; localStorage.setItem('mia-best', best); } upd(); cx.font = 'bold 30px Fredoka, sans-serif'; cx.fillText('Cozy! ♡ ' + score, 240, 160); return; }
  requestAnimationFrame(frame); }
$('#gameStart').addEventListener('click', () => { score = 0; hearts = []; upd(); run = true; end = performance.now() + 30000; requestAnimationFrame(frame); });

// countdown to next Friday 20:00 local (mock)
const target = (() => { const d = new Date(); d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7)); d.setHours(20, 0, 0, 0); if (d < new Date()) d.setDate(d.getDate() + 7); return d; })();
const cd = $('#countdown'); const tick = () => { let s = Math.max(0, (target - new Date()) / 1000 | 0); const D = s / 86400 | 0, H = s % 86400 / 3600 | 0, M = s % 3600 / 60 | 0;
  cd.textContent = `${D}d ${H}h ${M}m`; }; tick(); setInterval(tick, 30000);

// fan wall (text only, localStorage)
const KEY = 'mia-wall', wall = $('#wall');
const getW = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
function render() { wall.textContent = ''; const list = getW(); if (!list.length) list.push({ n: 'Mia', m: 'Be the first to leave a cozy note! ♡' });
  list.slice(-30).reverse().forEach((w, i) => { const li = document.createElement('li'); li.style.setProperty('--t', (i % 3 - 1) * 1.5 + 'deg'); const b = document.createElement('b'); b.textContent = w.n + ': '; li.append(b, document.createTextNode(w.m)); wall.append(li); }); }
$('#wallForm').addEventListener('submit', e => { e.preventDefault(); const n = $('#wallName').value.trim(), m = $('#wallMsg').value.trim(); if (!n || !m) return;
  const l = getW(); l.push({ n: n.slice(0, 24), m: m.slice(0, 140) }); localStorage.setItem(KEY, JSON.stringify(l.slice(-100))); $('#wallMsg').value = ''; render(); });
render();
})();
