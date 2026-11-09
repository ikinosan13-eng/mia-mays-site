// Коробка: сохранённое, пятница, рекорды, Лавка
import { $, esc, icon } from '../core/dom.js';
import { MiaStore } from '../core/store.js';
import { Box } from '../core/box.js';
import { toast } from '../core/toast.js';
const KIND = { wallpaper: 'обои', sticker: 'стикер', souvenir: 'сувенир', note: 'записка', wish: 'желание', lavka: 'Лавка · скоро', avatar: 'аватарка' };
export default function init() {
  const items = $('#boxItems'), lav = $('#boxLavka');
  const row = it => `<li class="box-row" data-id="${esc(it.id)}">${it.thumb ? `<img src="${esc(it.thumb)}" alt="" width="56" height="56" loading="lazy">` : `<span class="box-ph">${icon(it.kind === 'souvenir' ? 'heart' : 'box')}</span>`}
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
  };
  render(); MiaStore.on('box', render); MiaStore.on('rsvp', render); MiaStore.on('games', render);
  document.addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (!b) return; const id = b.closest('[data-id]').dataset.id; Box.remove(id); toast('Убрала из коробки'); });
  $('#boxClear').addEventListener('click', () => { if (!confirm('Очистить коробку? Сохранённые вещи исчезнут из этого браузера.')) return; Box.clear(); toast('Коробка пустая. Но всё ещё уютная'); });
}
