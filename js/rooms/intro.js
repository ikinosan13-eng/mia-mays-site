// Прихожая (только первый визит): 3 реплики, «Пропустить», имя, «Войти» → ключик в Коробку → Комната
import { $, $$ } from '../core/dom.js';
import { MiaStore } from '../core/store.js';
import { Sound } from '../core/sound.js';
const LINES = ['Ой… привет! Это мой дом. Я Мия — кошкодевочка-домоседка.', 'Тут маленькая комната, окно на звёзды и гора подушек. А по пятницам — Уютная ночь.', 'Заходи? Я поставлю чайник ♡'];
export default function init() {
  const line = $('#hallLine'), next = $('#hallNext'), skip = $('#hallSkip'), form = $('#hallForm'), ctrl = $('#hallCtrl'), dots = $$('.hall-dots i'), name = $('#hallName');
  if (!line || !form) return;
  let i = 0;
  const saved = MiaStore.read('guest.name'); if (saved) name.value = saved;
  const say = n => { i = n; line.textContent = LINES[i]; dots.forEach((d, k) => d.classList.toggle('on', k <= i)); Sound.tone(900, .05, 'sine', .015); };
  const ask = () => { ctrl.hidden = true; line.textContent = LINES[LINES.length - 1]; dots.forEach(d => d.classList.add('on')); form.hidden = false; name.focus({ preventScroll: true }); };
  next.addEventListener('click', () => (i < LINES.length - 1 ? say(i + 1) : ask()));
  skip.addEventListener('click', ask);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const n = name.value.replace(/\s+/g, ' ').trim().slice(0, 24);
    MiaStore.update(s => { if (n) s.guest.name = n; s.guest.enteredAt = s.guest.enteredAt || Date.now();
      if (!s.box.some(x => x.id === 'g-key')) s.box.unshift({ id: 'g-key', kind: 'souvenir', title: 'Ключик от дома', href: '', thumb: 'img/items/item-key.a1-128.webp', icon: 'key', at: Date.now() }); });
    Sound.meow();
    setTimeout(() => { location.href = 'home.html?first=1'; }, 30);
  });
}
