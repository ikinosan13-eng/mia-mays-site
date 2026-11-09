// отсчёт до пятницы 20:00 (местное время): дни/часы/минуты, обновление раз в минуту, только когда виден и вкладка открыта
import { reduced } from './dom.js?v=16';
export const nextFriday20 = (now = new Date()) => { const d = new Date(now); d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7)); d.setHours(20, 0, 0, 0); if (d <= now && now - d > 4 * 3600e3) d.setDate(d.getDate() + 7); return d; };
export function countdown(el, srEl) {
  if (!el) return;
  const units = [['d', 'дн'], ['h', 'ч'], ['m', 'мин']], cells = {};
  units.forEach(([u, lab]) => { const w = document.createElement('span'); w.className = 'cd-unit'; cells[u] = [];
    for (let i = 0; i < 2; i++) { const d = document.createElement('span'); d.className = 'digit'; d.innerHTML = '<span>0</span>'; w.append(d); cells[u].push(d); }
    const l = document.createElement('small'); l.textContent = lab; w.append(l); el.append(w); });
  const setDigit = (c, ch) => { if (c.dataset.v === ch) return; const first = !c.dataset.v; c.dataset.v = ch; if (first || reduced()) { c.innerHTML = `<span>${ch}</span>`; return; }
    const old = c.lastElementChild; old.className = 'old'; const n = document.createElement('span'); n.className = 'new'; n.textContent = ch; c.append(n); setTimeout(() => old.remove(), 460); };
  let visible = true, timer = 0;
  const tick = () => {
    clearTimeout(timer); if (document.hidden || !visible) return;
    const now = new Date(), t = nextFriday20(now), live = now >= t;
    const s = Math.max(0, (t - now) / 1000 | 0), v = { d: s / 86400 | 0, h: s % 86400 / 3600 | 0, m: s % 3600 / 60 | 0 };
    units.forEach(([u]) => String(Math.min(99, v[u])).padStart(2, '0').split('').forEach((c, i) => setDigit(cells[u][i], c)));
    el.closest('[data-friday]')?.toggleAttribute('data-live', live);
    if (srEl) srEl.textContent = live ? 'Уютная ночь уже идёт!' : `До Уютной ночи: ${v.d} дн. ${v.h} ч. ${v.m} мин.`;
    timer = setTimeout(tick, 60000 - (Date.now() % 60000) + 50);
  };
  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) tick(); }).observe(el);
  document.addEventListener('visibilitychange', tick);
  tick();
}
