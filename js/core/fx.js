// событийные эффекты: сердечки (только запись на Уютную ночь) и «поп». Ничего не крутится само.
import { reduced } from './dom.js?v=16';
const fx = []; let raf = 0, lastT = 0;
export function burst(x, y, n = 5) {
  if (reduced()) return;
  for (let i = 0; i < n; i++) { const el = document.createElement('span'); el.className = 'pop-heart'; el.textContent = '♥'; el.setAttribute('aria-hidden', 'true'); document.body.append(el);
    const a = -Math.PI / 2 + (Math.random() - .5) * 1.8, v = 220 + Math.random() * 200; fx.push({ el, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1.2, r: 0, vr: (Math.random() - .5) * 400 }); }
  if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(step); }
}
function step(t) { const dt = Math.min(.05, (t - lastT) / 1000); lastT = t;
  for (let i = fx.length - 1; i >= 0; i--) { const p = fx[i]; p.vy += 600 * dt; p.vx *= .99; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; p.life -= dt;
    p.el.style.transform = `translate3d(${p.x}px,${p.y}px,0) rotate(${p.r}deg)`; p.el.style.opacity = Math.max(0, p.life); if (p.life <= 0) { p.el.remove(); fx.splice(i, 1); } }
  raf = fx.length ? requestAnimationFrame(step) : 0; }
export function pop(el) { if (!el || reduced()) return; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
document.addEventListener('animationend', e => e.target.classList && e.target.classList.remove('pop'));
