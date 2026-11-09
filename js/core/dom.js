export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const on = (el, ev, fn, opt) => { if (el) el.addEventListener(ev, fn, opt); };
// побочные эффекты (тосты, звук, приветствие) — только когда страница реально показана, а не в prerender
export const whenActive = fn => { if (document.prerendering) document.addEventListener('prerenderingchange', () => fn(), { once: true }); else fn(); };
export const idle = fn => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 300));
export const reduced = () => document.documentElement.dataset.motion === 'reduce';
export const lite = () => document.documentElement.classList.contains('lite');
export const load = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
export const dl = (url, name) => { const a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove(); };
export const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const icon = (id, cls = 'i') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
export const daypart = (d = new Date()) => { const h = d.getHours(); return h >= 6 && h < 11 ? 'morning' : h >= 11 && h < 18 ? 'day' : h >= 18 && h < 22 ? 'evening' : 'night'; };
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
