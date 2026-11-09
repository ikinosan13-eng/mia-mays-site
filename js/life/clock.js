// часы гостя: части суток, даты, недели, особые дни (всё по местному времени)
export { daypart, dayKey } from '../core/dom.js?v=16';
export { nextFriday20 } from '../core/countdown.js?v=16';
export const isoWeek = (d = new Date()) => { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y = t.getUTCFullYear(), w = Math.ceil(((t - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7); return `${y}-W${String(w).padStart(2, '0')}`; };
export const isFridayEvening = (d = new Date()) => d.getDay() === 5 && d.getHours() >= 19;
const md = d => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
// mia.birthday: "MM-DD" (или "YYYY-MM-DD"); null — выключено
export function isSpecial(d = new Date(), mia = {}) {
  const k = md(d), b = mia && typeof mia.birthday === 'string' ? mia.birthday.slice(-5) : null;
  if (b && /^\d\d-\d\d$/.test(b) && b === k) return 'birthday';
  if (k === '12-31' || k === '01-01') return 'newyear';
  if (k === '02-14') return 'valentine';
  return null;
}
export const isCatHour = (d = new Date()) => d.getHours() === 3 && (d.getMinutes() === 33 || d.getMinutes() === 34);
// «2 дня назад» без рода и без прошедшего времени у гостя
export function ago(ts, now = Date.now()) {
  const m = Math.max(0, Math.round((now - ts) / 6e4));
  if (m < 60) return m <= 1 ? 'только что' : `${m} мин назад`;
  const h = Math.round(m / 60); if (h < 24) return `${h} ${pl(h, 'час', 'часа', 'часов')} назад`;
  const dd = Math.round(h / 24); return dd === 1 ? 'вчера' : `${dd} ${pl(dd, 'день', 'дня', 'дней')} назад`;
}
export const pl = (n, a, b, c) => { const t = n % 100, u = n % 10; return t > 10 && t < 20 ? c : u === 1 ? a : u > 1 && u < 5 ? b : c; };
