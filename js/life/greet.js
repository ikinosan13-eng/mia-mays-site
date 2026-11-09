// приветствие: выбор группы по приоритету (спека 3.2), подстановка имени, вывод в пузырь Мии
import { daypart, dayKey } from '../core/dom.js?v=16';
import { isSpecial, isFridayEvening, isoWeek, isCatHour } from './clock.js?v=16';
import { P, pick, fill } from './phrases.js?v=16';
const H = 3600e3, D = 24 * H;
// s — состояние MiaStore после recordVisit(); mia — data/mia.json (может быть ещё не загружен)
export function greetGroup({ now = new Date(), first = false, s = {}, mia = {} } = {}) {
  const v = s.visits || {}, prev = v.prev, t = +now;
  if (first) return 'first';
  const sp = isSpecial(now, mia); if (sp) return `special.${sp}`;
  if (isFridayEvening(now)) return 'friday.live';
  if (now.getDay() === 6 && now.getHours() < 12 && s.rsvp && s.rsvp.week && s.rsvp.week === isoWeek(new Date(t - D))) return 'friday.thanks';
  if (prev && t - prev > 7 * D) return 'return.long';
  if (prev && t - prev < 3 * H && t >= prev && dayKey(new Date(prev)) === dayKey(now)) return 'return.same';
  if (isCatHour(now)) return 'egg.catHour';
  return `greet.${daypart(now)}`;
}
export function greeting(ctx = {}) {
  const now = ctx.now || new Date(), s = ctx.s || {}, group = greetGroup({ ...ctx, now });
  const recent = (s.seen && s.seen.recent) || [];
  const r = group === 'first' ? { line: P.first[0], key: 'first#0' } : pick(group, { seed: (s.guest || {}).seed, day: dayKey(now), recent, salt: (s.visits || {}).count || '' });
  return { group, key: r.key, text: fill(r.line, { name: (s.guest || {}).name }) };
}
