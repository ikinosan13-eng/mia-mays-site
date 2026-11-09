// Дневник: относительные даты записей, полоски характера при раскрытии
import { $$ } from '../core/dom.js';
export default function init() {
  const rtf = 'Intl' in window && Intl.RelativeTimeFormat ? new Intl.RelativeTimeFormat('ru', { numeric: 'auto' }) : null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  $$('.entry[data-date] time').forEach(t => {
    const d = new Date(t.getAttribute('datetime') + 'T00:00:00'); if (isNaN(d)) return;
    const days = Math.round((d - today) / 864e5);
    let rel = '';
    if (rtf) rel = Math.abs(days) < 7 ? rtf.format(days, 'day') : Math.abs(days) < 35 ? rtf.format(Math.round(days / 7), 'week') : rtf.format(Math.round(days / 30), 'month');
    if (rel) { t.title = t.textContent; t.textContent = `${t.textContent} · ${rel}`; }
  });
  $$('details.fold').forEach(d => d.addEventListener('toggle', () => d.classList.toggle('in', d.open)));
}
