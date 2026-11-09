// Комната — экран «сейчас»: приветствие по времени суток, «Сегодня Мия…», отсчёт до пятницы, котёнок в коробке
import { $, whenActive, daypart, dayKey, hash, reduced } from '../core/dom.js';
import { MiaStore } from '../core/store.js';
import { countdown } from '../core/countdown.js';
import { toast } from '../core/toast.js';
import { Sound } from '../core/sound.js';
import { burst } from '../core/fx.js';
import { miaStatus } from '../core/shell.js';
// фаза 1: приветствия по времени суток (фаза 3 — полный банк с приоритетами)
const GREET = {
  morning: ['Доброе утро, {name} ☀️ Я ещё в пижаме, не смотри так|Доброе утро ☀️ Я ещё в пижаме, не смотри так', 'Ой, ты так рано… Подожди, я только ушки причешу', 'Утро! Чайник уже шумит — будешь со мной?', 'Мрр… ещё пять минуточек. Ладно, три. Привет!', 'Я уже проснулась. Почти. Наполовину точно'],
  day: ['Привет, {name}! Заходи, чайник ещё тёплый|Привет! Заходи, чайник ещё тёплый', 'О, гости! Я как раз дочитала главу', 'Садись куда хочешь. Только подушку не забирай, она моя любимая', 'Я тут разбираю полароиды. Хочешь посмотреть альбом?', 'Мур! Ты тут! Ушки сразу торчком'],
  evening: ['Вечер — лучшее время для пледа. Залезай', 'Я зажгла лампу. Теперь совсем уютно', 'Добрый вечер, {name}. Как прошёл день?|Добрый вечер. Как прошёл день?', 'Чай с мёдом готов. Твоя кружка — та, что с ушками', 'За окном темнеет, а у нас тепло'],
  night: ['Тсс… ты так поздно. Тоже не спится?', 'Я уже в пижаме. Говорим шёпотом, ладно? 🌙', '{name}, ночь — время секретов. Расскажешь один?|Ночь — время секретов. Расскажешь один?', 'Мрр… я почти сплю. Но тебе рада всегда', 'Ночью дом тихий-тихий. Только ты, я и лампа']
};
const FIRST = 'Это моя комната! Внизу — двери в остальные. Заглядывай куда хочешь';
const TODAY = ['проснулась в 11:40 и решила, что это утро', 'заварила чай с мёдом и забыла его на подоконнике', 'нашла под кроватью потерянный клубок', 'ждёт пятницу и Уютную ночь', 'переложила подушки три раза — теперь идеально', 'считала капли дождя за окном', 'вяжет шарф длиной с хвостик'];
const KICK = { morning: 'Утро в комнате', day: 'День в комнате', evening: 'Вечер в комнате', night: 'Ночь в комнате' };
const fill = (line, name) => { const [withName, without] = line.split('|'); return name ? withName.replace('{name}', name) : (without || withName.replace(/\{name\},?\s*/, '')); };

export default function init() {
  const s = MiaStore.get(), dp = daypart(), k = dayKey(), seed = s.guest.seed || '';
  const first = new URLSearchParams(location.search).has('first');
  const greet = $('[data-greet]'), name = s.guest.name;
  if (greet) { const bank = GREET[dp]; greet.textContent = first ? FIRST : fill(bank[hash(k + dp + seed) % bank.length], name); }
  const kick = $('[data-now-kicker]'); if (kick) kick.textContent = KICK[dp];
  const st = $('[data-now-status]'); if (st) st.textContent = `Сейчас Мия ${miaStatus()}.`;
  const today = $('[data-today]'); if (today) today.textContent = TODAY[hash(k + seed) % TODAY.length];
  countdown($('#countdown'), $('#countdownSr'));
  if (first) whenActive(() => {
    const tabs = $('.rooms'); if (tabs && !reduced()) setTimeout(() => tabs.classList.add('pulse'), 600);
    tabs && tabs.addEventListener('animationend', () => tabs.classList.remove('pulse'), { once: true });
    setTimeout(() => toast('Держи ключик от дома. Он теперь в твоей Коробке ♡'), 900);
    history.replaceState(null, '', location.pathname + location.hash);
  });
  kitten();
}
// котёнок в коробке: выглядывает по наведению/фокусу и один раз после входа; 3 нажатия — выпрыгивает
function kitten() {
  const kb = $('#kitBox'); if (!kb) return; let clicks = 0;
  const blink = () => { kb.classList.remove('blink'); void kb.offsetWidth; kb.classList.add('blink'); };
  whenActive(() => { if (reduced()) { kb.classList.add('peek'); return; } setTimeout(() => { kb.classList.add('peek'); setTimeout(blink, 900); setTimeout(() => kb.classList.remove('peek'), 3200); }, 1800); });
  kb.addEventListener('click', () => { clicks++; blink(); Sound.meow();
    if (clicks % 3 === 0) { kb.classList.add('out'); const r = kb.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + 20, 10); toast('Мяу! В коробке нашёлся котёнок ♡'); setTimeout(() => kb.classList.remove('out'), 1200); } });
}
