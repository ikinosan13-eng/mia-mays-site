// оболочка: активная комната, бейдж Коробки, статус Мии в чипе, «есть новое» (колокольчик в чипе + точка на табе)
import { MiaStore } from './store.js?v=16';
import { $, $$, daypart, idle, whenActive } from './dom.js?v=16';
import { P } from '../life/phrases.js?v=16';
import { data } from '../life/data.js?v=16';
let MIA = null, fridayHour = 20;
// статус в чипе = статус текущей базовой позы (data/mia.json → daypart + status): один источник правды с картинкой в Комнате
const POSE = { morning: 'sleepy', day: 'wave', evening: 'tea', night: 'sleep', lampOn: 'shy' };
const PST = { sleepy: 'просыпается', wave: 'дома, машет тебе', tea: 'пьёт чай', read: 'читает', blanket: 'в пледе', sleep: 'спит 💤', shy: 'не спит из-за лампы', happy: 'радуется', box: 'сидит в коробке' };
export const poseKey = (dp, lightsOff) => lightsOff ? 'night' : dp === 'night' ? 'lampOn' : dp;
export const miaStatus = (d = new Date(), lightsOff = document.documentElement.classList.contains('night')) => {
  if (d.getDay() === 5 && d.getHours() >= fridayHour) return P['status.friday'][0];
  const dp = daypart(d), pose = ((MIA && MIA.daypart) || POSE)[poseKey(dp, lightsOff)];
  return ((MIA && MIA.status) || PST)[pose] || PST[POSE[dp]];
};
// непросмотренные обновления: date > seen.updates; при первом визите старые новости не показываем
export const unseen = (ups, s) => ups.filter(u => Date.parse(u.date) > ((s.seen && s.seen.updates) || 0));
export function setNews(on) {
  const d = $('[data-news-dot]'), b = $('[data-news-bell]'), sr = $('[data-news-sr]');
  [d, b, sr].forEach(x => { if (x) x.toggleAttribute('hidden', !on); });
}
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
  const st = $('[data-mia-status]');
  const status = () => { if (st) st.textContent = miaStatus(); };
  status();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) status(); });
  new MutationObserver(status).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] }); // лампа/свет → другая поза → другой статус
  data('mia').then(m => { if (m && m.daypart && m.status && !Array.isArray(m.status)) MIA = m; if (m && m.fridayHour) fridayHour = m.fridayHour; status(); });
  // новое с прошлого раза: на Комнате блок «Пока тебя не было» сам снимает отметку
  whenActive(() => idle(() => data('updates').then(ups => {
    const s = MiaStore.get();
    if (!Array.isArray(ups)) return;
    if ((s.visits.count || 0) <= 1 && !s.seen.updates) { MiaStore.set('seen.updates', Date.now()); return; }
    if (room !== 'home') setNews(unseen(ups, s).length > 0);
  })));
  MiaStore.on('seen', v => { if (v.updates) data('updates').then(ups => setNews(room !== 'home' && unseen(ups, MiaStore.get()).length > 0)); });
  // «К содержимому» переводит фокус в main
  const skip = $('.skip'), main = $('#main');
  if (skip && main) skip.addEventListener('click', e => { e.preventDefault(); main.focus(); main.scrollIntoView(); });
}
