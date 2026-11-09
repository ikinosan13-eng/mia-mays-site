// подарок дня у порога: раз в календарный день; пропуски не сгорают и не копятся; без таймеров
import { hash, dayKey } from '../core/dom.js?v=16';
import { MiaStore } from '../core/store.js?v=16';
import { Box } from '../core/box.js?v=16';
import { P } from './phrases.js?v=16';
export const daily = pool => pool.filter(g => g && g.id && g.daily !== false);
// детерминированно: hash(today + seed) по ещё не собранным; всё собрано → null (фраза gift.allCollected)
export function pickGift(pool, got = [], today = dayKey(), seed = '') {
  const left = daily(pool).filter(g => !got.includes(g.id));
  return left.length ? left[hash(today + seed) % left.length] : null;
}
export const giftWaiting = (s, today = dayKey()) => (s.gifts && s.gifts.lastDay) !== today;
// собранное = gifts.got ∪ сувениры из пула, лежащие в Коробке (ключик из Прихожей и т. п.)
export const collected = (pool, s) => { const ids = new Set([...(s.gifts.got || []), ...(s.box || []).map(x => x.id)]); return pool.filter(g => ids.has(g.id)); };
export function claimGift(pool, from, today = dayKey()) {
  const s = MiaStore.get(); if (!giftWaiting(s, today)) return { already: true };
  const item = pickGift(pool, collected(pool, s).map(g => g.id), today, s.guest.seed || '');
  MiaStore.update(st => { st.gifts.lastDay = today; if (item && !st.gifts.got.includes(item.id)) st.gifts.got.push(item.id); });
  if (item) Box.add({ id: item.id, kind: 'souvenir', title: item.title, icon: item.icon, thumb: item.img || '', silent: true }, from);
  const lines = P.gift;
  return { item, line: item ? lines[hash(today + (s.guest.seed || '') + 'g') % lines.length] : P['gift.allCollected'][0] };
}
