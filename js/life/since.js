// «Пока тебя не было»: обновления новее прошлого визита (максимум 3, свежие сверху) или одна строка-заполнитель
import { MiaStore } from '../core/store.js?v=16';
import { esc, icon, hash, dayKey } from '../core/dom.js?v=16';
import { ago } from './clock.js?v=16';
import { P } from './phrases.js?v=16';
const ROOM_IC = { diary: 'diary', album: 'album', play: 'play', living: 'living', home: 'home', box: 'box' };
export function sinceItems(ups, prev) {
  if (!prev) return [];
  return ups.filter(u => u && u.date && Date.parse(u.date) > prev).sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 3);
}
export function renderSince(sec, ups, s, now = Date.now()) {
  if (!sec) return;
  const prev = s.visits.prev, list = sinceItems(ups, prev), ul = sec.querySelector('ul');
  if (list.length) ul.innerHTML = list.map(u => `<li><a href="${esc(u.href || 'home.html')}">${icon(ROOM_IC[u.room] || 'sparkle')}<span><b>${esc(u.title)}</b><small>${ago(Date.parse(u.date), now)}</small></span></a></li>`).join('');
  else if (prev && now - prev > 864e5) { const f = P['since.filler']; ul.innerHTML = `<li class="say">${esc(f[hash(dayKey() + (s.guest.seed || '')) % f.length])}</li>`; }
  else return;
  sec.hidden = false;
  const max = Math.max(0, ...ups.map(u => Date.parse(u.date) || 0));
  if (max > (s.seen.updates || 0)) MiaStore.set('seen.updates', max);
}
