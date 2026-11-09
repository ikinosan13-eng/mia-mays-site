// Коробка: сохранённое, пятница, рекорды, Лавка
import { $, esc, icon } from '../core/dom.js';
import { MiaStore } from '../core/store.js';
import { Box } from '../core/box.js';
import { toast } from '../core/toast.js';
import { data } from '../life/data.js';
import { collected } from '../life/gift.js';
import { isoWeek, pl } from '../life/clock.js';
import { MOODS } from '../life/checkin.js';
const MOOD_W = { sleepy: 'сонно', good: 'хорошо', busy: 'суетно', sad: 'грустно' };
const KIND = { wallpaper: 'обои', sticker: 'стикер', souvenir: 'сувенир', note: 'записка', wish: 'желание', lavka: 'Лавка · скоро', avatar: 'аватарка' };
export default function init() {
  const items = $('#boxItems'), lav = $('#boxLavka');
  const row = it => `<li class="box-row" data-id="${esc(it.id)}">${it.thumb ? `<img src="${esc(it.thumb)}" alt="" width="56" height="56" loading="lazy">` : `<span class="box-ph">${icon(it.icon || (it.kind === 'souvenir' ? 'heart' : it.kind === 'wish' ? 'star' : 'box'))}</span>`}
    <span class="meta"><small class="tag">${esc(KIND[it.kind] || it.kind)}</small><b>${esc(it.title)}</b></span>
    <span class="acts">${it.href ? `<a class="icon-btn" href="${esc(it.href)}" download aria-label="Скачать: ${esc(it.title)}">${icon('download')}</a>` : ''}<button class="icon-btn" type="button" data-rm aria-label="Убрать: ${esc(it.title)}">${icon('trash')}</button></span></li>`;
  const render = () => {
    const s = MiaStore.get(), all = s.box, saved = all.filter(x => x.kind !== 'lavka'), lv = all.filter(x => x.kind === 'lavka');
    items.innerHTML = saved.map(row).join('') || '<li class="note center">Здесь появятся обои и стикеры из Альбома.</li>';
    lav.innerHTML = lv.map(row).join(''); $('#lavkaNone').hidden = !!lv.length;
    $('#boxClearWrap').hidden = !all.length;
    const empty = !(all.length || s.rsvp || s.games.heartsBest || s.games.purrs); $('#boxEmpty').hidden = !empty; $('#saved').hidden = empty;
    const r = s.rsvp, rb = $('#boxRsvp');
    if (r && r.name) rb.innerHTML = `<p><b>${esc(r.name)}</b> — в списке на Уютную ночь. Принесёшь: <b>${esc(r.bring || 'хорошее настроение')}</b>.</p><a class="btn small ghost" href="living.html#rsvp">Изменить</a>`;
    $('#statBest').textContent = s.games.heartsBest || 0; $('#statPurrs').textContent = s.games.purrs || 0; $('#statBox').textContent = all.length;
    const sb = $('#statBlinks'); if (sb) sb.textContent = s.games.blinks || 0;
    days(s); souv(s);
  };
  // «Дни у Мии» и неделя из 7 лапок (пн–вс, текущая ISO-неделя), под лапкой — настроение из чек-ина
  const days = s => {
    const n = Math.max(1, s.visits.days || 0), el = $('[data-days]'); if (el) el.textContent = `Ты заглядываешь к Мие уже ${n} ${pl(n, 'день', 'дня', 'дней')} ♡`;
    const now = new Date(), wd = (now.getDay() + 6) % 7, wk = new Set(s.visits.week || []), log = Object.fromEntries((s.checkin.log || []).map(x => [x.day, x.mood]));
    document.querySelectorAll('[data-wd]').forEach(li => {
      const i = +li.dataset.wd, d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - wd + i);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`, on = wk.has(k) && isoWeek(d) === isoWeek(now), m = log[k];
      li.classList.toggle('on', on); li.classList.toggle('today', i === wd);
      li.querySelector('.mood').textContent = m ? MOODS[m] : '';
      li.querySelector('[data-wd-sr]').textContent = `: ${on ? 'заглядывали' : 'нет'}${m ? `, ${MOOD_W[m]}` : ''}`;
    });
  };
  // коллекция сувениров: собранные — с названием, остальные — силуэты без названий
  let pool = null;
  const souv = s => {
    if (!pool) return;
    const got = new Set(collected(pool, s).map(g => g.id)), g = $('#souvGrid');
    $('[data-souv-n]').textContent = got.size; $('[data-souv-y]').textContent = pool.length;
    const pic = it => it.img ? `<img src="${esc(it.img)}" alt="" width="48" height="48" loading="lazy" decoding="async">` : icon(it.icon || 'gift');
    g.innerHTML = pool.map(it => got.has(it.id) ? `<li class="got" title="${esc(it.title)}">${pic(it)}<span>${esc(it.title)}</span></li>` : `<li class="sil">${pic(it)}<span class="sr-only">ещё не найден</span></li>`).join('');
  };
  data('gifts').then(p => { pool = Array.isArray(p) ? p : []; souv(MiaStore.get()); });
  render(); MiaStore.on('box', render); MiaStore.on('rsvp', render); MiaStore.on('games', render); MiaStore.on('gifts', render);
  // удаление: фокус уходит на соседнюю строку (или заголовок), в тосте — «Вернуть»
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-rm]'); if (!b) return;
    const li = b.closest('[data-id]'), id = li.dataset.id, item = MiaStore.get().box.find(x => x.id === id), idx = MiaStore.get().box.findIndex(x => x.id === id);
    const near = li.nextElementSibling || li.previousElementSibling, nearId = near && near.dataset.id;
    Box.remove(id);
    const target = (nearId && document.querySelector(`[data-id="${CSS.escape(nearId)}"] [data-rm]`)) || $('#savedTitle');
    if (target === $('#savedTitle')) target.tabIndex = -1;
    target.focus();
    toast('Убрала из коробки', { action: 'Вернуть', ms: 5000, onAction: () => MiaStore.update(s => { if (item && !s.box.some(x => x.id === id)) s.box.splice(Math.max(0, idx), 0, item); }) });
  });
  const dlg = $('#boxConfirm');
  $('#boxClear').addEventListener('click', () => { if (dlg && dlg.showModal) dlg.showModal(); });
  dlg?.addEventListener('close', () => { if (dlg.returnValue === 'yes') { Box.clear(); toast('Коробка пустая. Но всё ещё уютная'); $('#savedTitle').focus(); } else $('#boxClear').focus(); });
}
