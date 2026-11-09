// мягкое появление при прокрутке (один раз), без бесконечных анимаций
import { $$, reduced } from './dom.js';
export function initReveal() {
  const els = $$('[data-reveal]>*,.reveal');
  els.forEach((c, i) => { if (!c.classList.contains('reveal')) { c.style.setProperty('--d', (i % 6) * .06 + 's'); c.classList.add('reveal'); } });
  if (reduced() || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .1, rootMargin: '0px 0px -20px' });
  els.forEach(e => io.observe(e));
  setTimeout(() => document.documentElement.classList.add('reveal-done'), 6000);
}
