// оболочка: активная комната, бейдж Коробки, статус Мии в чипе
import { MiaStore } from './store.js';
import { $, $$, daypart } from './dom.js';
const STATUS = { morning: 'просыпается', day: 'читает', evening: 'пьёт чай с мёдом', night: 'спит 💤' };
export const miaStatus = (d = new Date()) => (d.getDay() === 5 && d.getHours() >= 20) ? 'на Уютной ночи' : STATUS[daypart(d)];
export function initShell() {
  const room = document.body.dataset.room;
  $$('.rooms a[data-room-link]').forEach(a => { if (a.dataset.roomLink === room) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  const bl = $('[data-box-link]'); if (bl && room === 'box') bl.setAttribute('aria-current', 'page');
  const badge = () => {
    const n = (MiaStore.read('box') || []).length, b = $('[data-box-badge]');
    if (b) { b.textContent = n > 99 ? '99+' : String(n); b.hidden = !n; }
    if (bl) bl.setAttribute('aria-label', n ? `Коробка: ${n}` : 'Коробка');
  };
  badge(); MiaStore.on('box', badge);
  const st = $('[data-mia-status]'), chip = $('.mia-chip');
  const status = () => { const s = miaStatus(); if (st) st.textContent = s; if (chip) chip.setAttribute('aria-label', `Мия: ${s}. В Комнату`); };
  status();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) status(); });
  // «К содержимому» переводит фокус в main
  const skip = $('.skip'), main = $('#main');
  if (skip && main) skip.addEventListener('click', e => { e.preventDefault(); main.focus(); main.scrollIntoView(); });
}
