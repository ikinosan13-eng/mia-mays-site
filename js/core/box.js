// Коробка: всё, что гость «утащил» (обои, стикеры, сувениры, интерес к Лавке). ≤ 60, уникально по id.
import { MiaStore } from './store.js';
import { $, reduced, icon } from './dom.js';
import { toast } from './toast.js';
import { Sound } from './sound.js';
const KINDS = ['wallpaper', 'sticker', 'souvenir', 'note', 'wish', 'lavka', 'avatar'];
export const Box = {
  list: () => MiaStore.read('box') || [],
  has: id => Box.list().some(x => x.id === id),
  add(item, from) {
    if (!item || !item.id) return false;
    if (Box.has(item.id)) { toast('Уже в коробке ♡'); return false; }
    const it = { id: String(item.id), kind: KINDS.includes(item.kind) ? item.kind : 'souvenir', title: String(item.title || 'Без названия').slice(0, 80), href: item.href || '', thumb: item.thumb || '', icon: /^[a-z-]{2,16}$/.test(item.icon || '') ? item.icon : '', at: Date.now() };
    MiaStore.update(s => { s.box = [it, ...s.box.filter(x => x.id !== it.id)].slice(0, 60); });
    fly(from); Sound.meow();
    if (!item.silent) toast(it.kind === 'lavka' ? 'Записала! Скажу, когда дошью ♡' : 'Утащила в коробку ♡');
    return true;
  },
  remove(id) { MiaStore.update(s => { s.box = s.box.filter(x => x.id !== id); }); },
  clear() { MiaStore.update(s => { s.box = []; }); }
};
function fly(from) {
  const target = $('[data-box-link]'); if (!target) return;
  const badge = () => { const b = $('[data-box-badge]', target); if (b && !reduced() && b.animate) b.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }, { transform: 'scale(1)' }], { duration: 220, easing: 'ease-out' }); };
  const img = from && (from.querySelector('img') || (from.closest('[data-box-item]') || from).querySelector('img'));
  if (!img || reduced() || !img.animate) return setTimeout(badge, 20);
  const a = img.getBoundingClientRect(), b = target.getBoundingClientRect(); if (!a.width) return badge();
  const c = document.createElement('img'); c.src = img.currentSrc || img.src; c.alt = ''; c.className = 'box-fly';
  const w = Math.min(96, a.width), h = w * (a.height / a.width || 1);
  Object.assign(c.style, { left: a.left + (a.width - w) / 2 + 'px', top: a.top + (a.height - h) / 2 + 'px', width: w + 'px', height: h + 'px' });
  document.body.append(c);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
  c.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${dx}px,${dy}px) scale(.18)`, opacity: .4 }], { duration: 450, easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = () => { c.remove(); badge(); };
}
// кнопки «В коробку»: <… data-box-item data-id data-title data-kind data-href data-thumb> … <button data-box-add>
document.addEventListener('click', e => {
  const btn = e.target.closest && e.target.closest('[data-box-add]'); if (!btn) return;
  const w = btn.closest('[data-box-item]'); if (!w) return;
  const d = w.dataset;
  if (Box.add({ id: d.id, title: d.title, kind: d.kind, href: d.href, thumb: d.thumb }, w)) btn.setAttribute('aria-pressed', 'true');
});
// состояние видно и словами: «В коробку» → «В коробке ✓» (для иконок — галочка и aria-label)
export const syncBoxButtons = () => document.querySelectorAll('[data-box-item]').forEach(w => {
  const b = w.querySelector('[data-box-add]'); if (!b) return;
  const on = Box.has(w.dataset.id); if (b.getAttribute('aria-pressed') === String(on) && b.dataset.synced) return;
  b.setAttribute('aria-pressed', String(on)); b.dataset.synced = '1';
  if (b.classList.contains('icon-btn')) {
    b.dataset.label ||= b.getAttribute('aria-label') || '';
    b.setAttribute('aria-label', on ? b.dataset.label.replace(/в коробку$/, 'уже в коробке') : b.dataset.label);
    const u = b.querySelector('use'); if (u) u.setAttribute('href', on ? '#i-check' : '#i-box');
  } else {
    b.dataset.off ||= b.textContent.trim();
    b.innerHTML = on ? `${icon('check')}${w.dataset.kind === 'lavka' ? 'Запомнила' : 'В коробке'}` : (b.dataset.off === 'В коробку' ? icon('box') : '') + b.dataset.off;
  }
});
MiaStore.on('box', syncBoxButtons);
