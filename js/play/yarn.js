import { $ } from '../core/dom.js';
export default function init() {
  const yc = $('#yarn'); if (!yc) return;
  const yx = yc.getContext('2d'), W = 480, H = 320, cols = ['#F5B8D4', '#e0607e', '#b99cff', '#F2766B', '#ffd98a', '#9fd8c8']; let balls = [], grab = null, last = performance.now(), raf = 0, on = false, calm = 0;
  const add = () => { if (balls.length > 40) balls.shift(); balls.push({ x: 40 + Math.random() * 400, y: -20, vx: (Math.random() - .5) * 100, vy: 0, r: 16 + Math.random() * 12, c: cols[balls.length % cols.length], a: 0 }); calm = 0; kick(); };
  for (let i = 0; i < 14; i++) add();
  const pos = e => { const r = yc.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };
  yc.addEventListener('pointerdown', e => { const p = pos(e); grab = balls.find(b => Math.hypot(b.x - p.x, b.y - p.y) < b.r + 6) || null; if (grab) { yc.setPointerCapture(e.pointerId); yc.style.cursor = 'grabbing'; calm = 0; kick(); } });
  yc.addEventListener('pointermove', e => { if (!grab) return; const p = pos(e); grab.vx = (p.x - grab.x) * 30; grab.vy = (p.y - grab.y) * 30; grab.x = p.x; grab.y = p.y; calm = 0; kick(); });
  const rel = () => { grab = null; yc.style.cursor = ''; }; yc.addEventListener('pointerup', rel); yc.addEventListener('pointercancel', rel);
  $('#yarnAdd').addEventListener('click', add); $('#yarnShake').addEventListener('click', () => { balls.forEach(b => { b.vy -= 300 + Math.random() * 300; b.vx += (Math.random() - .5) * 400; }); calm = 0; kick(); });
  function kick() { if (!raf && on && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(step); } }
  const dlg = yc.closest('dialog'); const sync = () => { on = dlg ? dlg.open : true; kick(); };
  if (dlg) new MutationObserver(sync).observe(dlg, { attributes: true, attributeFilter: ['open'] });
  document.addEventListener('visibilitychange', kick);
  // физика засыпает, когда всё легло: никакой анимации «в простое»
  function step(t) { raf = 0; if (!on || document.hidden) return; const dt = Math.min(.033, (t - last) / 1000); last = t; let energy = 0;
    for (let it = 0; it < 2; it++) { const h = dt / 2;
      balls.forEach(b => { if (b === grab) return; b.vy += 900 * h; b.x += b.vx * h; b.y += b.vy * h; b.a += b.vx * h / b.r;
        if (b.y > H - b.r) { b.y = H - b.r; b.vy *= -.45; b.vx *= .96; } if (b.x < b.r) { b.x = b.r; b.vx *= -.6; } if (b.x > W - b.r) { b.x = W - b.r; b.vx *= -.6; } });
      for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) { const a = balls[i], b = balls[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, o = a.r + b.r - d;
        if (o > 0) { const nx = dx / d, ny = dy / d, ma = a === grab ? 0 : 1, mb = b === grab ? 0 : 1, s = ma + mb || 1; a.x -= nx * o * ma / s; a.y -= ny * o * ma / s; b.x += nx * o * mb / s; b.y += ny * o * mb / s;
          const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny; if (rv < 0) { const imp = -1.3 * rv / s; a.vx -= imp * nx * ma; a.vy -= imp * ny * ma; b.vx += imp * nx * mb; b.vy += imp * ny * mb; } } } }
    yx.clearRect(0, 0, W, H); balls.forEach(b => { energy += Math.abs(b.vx) + Math.abs(b.vy); yx.save(); yx.translate(b.x, b.y); yx.rotate(b.a); yx.fillStyle = b.c; yx.beginPath(); yx.arc(0, 0, b.r, 0, 7); yx.fill();
      yx.strokeStyle = '#ffffff99'; yx.lineWidth = 2; for (let k = -2; k <= 2; k++) { yx.beginPath(); yx.ellipse(0, 0, b.r * .9, Math.abs(k) * b.r * .25 + 2, k * .5, 0, 7); yx.stroke(); } yx.restore(); });
    calm = energy / balls.length < 4 && !grab ? calm + 1 : 0;
    if (calm < 90) kick(); }
  sync();
}
