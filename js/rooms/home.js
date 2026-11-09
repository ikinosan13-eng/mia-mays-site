// Комната — живой экран: приветствие по приоритету, подарок у порога, чек-ин, «пока тебя не было», погладить/моргнуть, ночная звезда
import { $, whenActive, daypart, dayKey, hash, reduced, icon, esc } from '../core/dom.js';
import { MiaStore } from '../core/store.js';
import { countdown } from '../core/countdown.js';
import { toast } from '../core/toast.js';
import { Sound } from '../core/sound.js';
import { Box } from '../core/box.js';
import { P } from '../life/phrases.js';
import { greeting, greetGroup } from '../life/greet.js';
import { isSpecial } from '../life/clock.js';
import { data } from '../life/data.js';
import { claimGift } from '../life/gift.js';
import { renderSince } from '../life/since.js';
import { initCheckin } from '../life/checkin.js';
import { initMia, pet, blink, setPose, poseFor } from '../life/mia.js';
const KICK = { morning: 'Утро в комнате', day: 'День в комнате', evening: 'Вечер в комнате', night: 'Ночь в комнате' };

export default function init() {
  const dp = daypart(), first = new URLSearchParams(location.search).has('first');
  const kick = $('[data-now-kicker]'); if (kick) kick.textContent = KICK[dp];
  const today = $('[data-today]'); if (today) today.textContent = P.today[hash(dayKey() + (MiaStore.read('guest.seed') || '')) % P.today.length];
  countdown($('#countdown'), $('#countdownSr'));
  whenActive(() => { greet(first); gift(); since(); });
  initCheckin($('#checkin'));
  initMia($('#nowPic'));
  document.addEventListener('click', e => { const a = e.target.closest('[data-act]'); if (!a) return; a.dataset.act === 'pet' ? pet() : blink(); });
  star(); kitten(); room();
  if (first) whenActive(() => {
    const tabs = $('.rooms'); if (tabs && !reduced()) setTimeout(() => tabs.classList.add('pulse'), 600);
    tabs && tabs.addEventListener('animationend', () => tabs.classList.remove('pulse'), { once: true });
    setTimeout(() => toast(P.first[2]), 900);
    history.replaceState(null, '', location.pathname + location.hash);
  });
}
// пузырь: один раз за визит (повторный заход в Комнату в том же визите — без пузыря), закрывается тапом
function greet(first) {
  const bub = $('#bubble'), out = $('[data-greet]'); if (!bub || !out) return;
  const close = () => { document.documentElement.classList.add('greeted'); };
  bub.addEventListener('click', close);
  if (document.documentElement.classList.contains('greeted') && !first) return;
  const s = MiaStore.get(), g = greeting({ now: new Date(), first, s });
  out.textContent = g.text;
  MiaStore.update(st => { st.seen.greetVisit = st.visits.count; st.seen.recent = [...(st.seen.recent || []).filter(k => k !== g.key), g.key].slice(-5); });
  // день рождения Мии (data/mia.json) важнее всего, кроме первого входа
  data('mia').then(m => { if (!first && isSpecial(new Date(), m) === 'birthday' && g.group !== 'special.birthday') out.textContent = greeting({ now: new Date(), s, mia: m }).text; });
}
// подарок у порога: свёрток → карточка; сувенир сам ложится в Коробку
function gift() {
  const door = $('#giftDoor'), dlg = $('#giftDlg'); if (!door || !dlg) return;
  door.addEventListener('click', () => data('gifts').then(pool => {
    const r = claimGift(Array.isArray(pool) ? pool : [], door);
    door.hidden = true;
    if (r.already) return;
    const it = r.item;
    $('[data-gift-ic]', dlg).innerHTML = it && it.img ? `<img src="${esc(it.img)}" alt="" width="96" height="96">` : icon(it ? it.icon || 'gift' : 'heart');
    $('[data-gift-title]', dlg).textContent = it ? it.title : 'Обнимашка';
    $('[data-gift-note]', dlg).textContent = it ? it.note || '' : '';
    $('[data-gift-line]', dlg).textContent = r.line;
    $('[data-gift-box]', dlg).hidden = !it;
    Sound.meow(); setPose(poseFor('gift'), 2600);
    if (dlg.showModal) dlg.showModal(); else toast(r.line);
  }));
  dlg.addEventListener('close', () => { if (door.isConnected) ($('[data-act=pet]') || document.body).focus(); });
}
function since() { data('updates').then(ups => renderSince($('#since'), Array.isArray(ups) ? ups : [], MiaStore.get())); }
// комната: ночной слой грузится только когда нужен (кроссфейд opacity 420 мс); лампа и выключатель на картинке
function room() {
  const R = $('#room'); if (!R) return;
  const day = $('.room__day', R), night = $('.room__night', R), d = document.documentElement;
  const ensure = (img, cb) => { if (img.srcset) return cb(); img.addEventListener('load', cb, { once: true }); img.srcset = img.dataset.srcset; };
  const sync = () => {
    if (d.classList.contains('night')) ensure(night, () => night.classList.add('ok'));
    else if (!day.srcset) { night.classList.add('hold'); ensure(day, () => night.classList.remove('hold')); }
  };
  new MutationObserver(sync).observe(d, { attributes: true, attributeFilter: ['class'] });
  R.addEventListener('click', e => {
    const b = e.target.closest('[data-room-act]'); if (!b) return;
    if (b.dataset.roomAct === 'switch') { $('[data-switch-open]')?.click(); return; }
    const next = d.classList.contains('night') ? 'day' : 'night';
    MiaStore.set('prefs.light', next); toast(P[`lamp.${next}`][0]); Sound.click();
  });
}
// ночная звезда: ночью 7 тапов → записка-желание в Коробку (хранится только у гостя)
function star() {
  const b = $('#nightStar'), dlg = $('#wishDlg'); if (!b || !dlg) return; let n = 0;
  b.addEventListener('click', () => {
    n++; if (!reduced() && b.animate) b.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 260 });
    if (n % 7 === 0) { dlg.querySelector('form').reset(); dlg.showModal ? dlg.showModal() : toast(P.star[0]); }
  });
  dlg.addEventListener('close', () => {
    const v = dlg.querySelector('input').value.replace(/\s+/g, ' ').trim().slice(0, 80);
    if (dlg.returnValue === 'save' && v) { Box.add({ id: 'wish-' + Date.now().toString(36), kind: 'wish', title: v, icon: 'star', silent: true }); toast('Спрятала желание в коробку. Никому не скажу ♡'); }
    b.focus();
  });
}
// котёнок в коробке: выглядывает по наведению/фокусу и один раз после входа; 3 нажатия — выпрыгивает
function kitten() {
  const kb = $('#kitBox'); if (!kb) return; let clicks = 0;
  const bl = () => { kb.classList.remove('blink'); void kb.offsetWidth; kb.classList.add('blink'); };
  whenActive(() => { if (reduced()) { kb.classList.add('peek'); return; } setTimeout(() => { kb.classList.add('peek'); setTimeout(bl, 900); setTimeout(() => kb.classList.remove('peek'), 3200); }, 1800); });
  kb.addEventListener('click', () => { clicks++; bl(); Sound.meow();
    if (clicks % 3 === 0) { kb.classList.add('out'); toast('Мяу! В коробке нашёлся котёнок ♡'); setTimeout(() => kb.classList.remove('out'), 1200); } });
}
export { greetGroup };
