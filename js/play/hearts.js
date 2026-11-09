import { $ } from '../core/dom.js';
import { MiaStore } from '../core/store.js';
import { toast } from '../core/toast.js';
import { Sound } from '../core/sound.js';
export default function init() {
  const cv = $('#game'); if (!cv) return;
  const cx = cv.getContext('2d'); let px = 240, tx = 240, hearts = [], sparks = [], score = 0, best = MiaStore.read('games.heartsBest') || 0, end = 0, run = false, keys = {}, lastF = 0, spawnAcc = 0;
  const sc = $('#gameScore'), upd = () => sc.textContent = `Очки: ${score} · Рекорд: ${best}`; upd();
  const mv = e => { const r = cv.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width * 480; };
  cv.addEventListener('pointermove', mv); cv.addEventListener('pointerdown', mv);
  addEventListener('keydown', e => { if (run && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { keys[e.key] = 1; e.preventDefault(); } }); addEventListener('keyup', e => keys[e.key] = 0);
  const dlg = cv.closest('dialog'); if (dlg) dlg.addEventListener('close', () => { run = false; });
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
    const left = Math.max(0, Math.ceil((end - t) / 1000)); cx.fillStyle = '#7a2e4f'; cx.font = 'bold 18px Nunito, sans-serif'; cx.fillText(left + ' с', 445, 24);
    if (t >= end) { run = false; if (score > best) { best = score; MiaStore.set('games.heartsBest', best); toast('Новый рекорд! ♡'); } upd(); cx.font = 'bold 30px Nunito, sans-serif'; cx.fillText('Уютно! ♡ ' + score, 240, 160); return; }
    requestAnimationFrame(frame); }
  $('#gameStart').addEventListener('click', () => { score = 0; hearts = []; sparks = []; upd(); run = true; lastF = performance.now(); end = lastF + 30000; requestAnimationFrame(frame); });
}
