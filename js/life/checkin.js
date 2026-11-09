// чек-ин «А ты как сегодня?»: раз в день, 4 кнопки (aria-pressed), ответ Мии; журнал — последние 30 дней
import { $$, dayKey } from '../core/dom.js?v=16';
import { MiaStore } from '../core/store.js?v=16';
import { P } from './phrases.js?v=16';
export const MOODS = { sleepy: '😴', good: '☺️', busy: '🧶', sad: '🌧' };
export function record(mood, today = dayKey()) {
  if (!MOODS[mood]) return false;
  MiaStore.update(s => { s.checkin.last = today; s.checkin.log = [...s.checkin.log.filter(x => x.day !== today), { day: today, mood }].slice(-30); });
  return true;
}
export function initCheckin(sec) {
  if (!sec) return;
  const reply = sec.querySelector('[data-ci-reply]');
  const s = MiaStore.get(), today = dayKey();
  if (s.checkin.last === today) { sec.dataset.state = 'done'; const m = (s.checkin.log.find(x => x.day === today) || {}).mood; reply.textContent = `${MOODS[m] || '♡'} ${P['checkin.any'][0]}`; }
  $$('[data-mood]', sec).forEach(b => b.addEventListener('click', () => {
    const m = b.dataset.mood; record(m);
    $$('[data-mood]', sec).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    reply.textContent = `${MOODS[m]} ${P[`checkin.${m}`][0]}`; sec.dataset.state = 'done';
    reply.setAttribute('tabindex', '-1'); reply.focus({ preventScroll: true });
  }));
}
