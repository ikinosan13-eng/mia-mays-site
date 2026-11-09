// Гостиная: отсчёт до пятницы, «Я приду», стена записок
import { $ } from '../core/dom.js';
import { MiaStore } from '../core/store.js';
import { countdown } from '../core/countdown.js';
import { toast } from '../core/toast.js';
import { Sound } from '../core/sound.js';
import { burst } from '../core/fx.js';
const isoWeek = d => { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y = t.getUTCFullYear(), w = Math.ceil(((t - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7); return `${y}-W${String(w).padStart(2, '0')}`; };
export default function init() {
  countdown($('#countdown'), $('#countdownSr'));
  const name = MiaStore.read('guest.name') || '';
  // запись на Уютную ночь
  const f = $('#rsvp');
  if (f) { const st = $('#rsvpStatus'), nm = $('#rsvpName'), br = $('#rsvpBring');
    const show = () => { const r = MiaStore.read('rsvp'); if (r && r.name) { st.textContent = `Ты в списке, ${r.name}! Принесёшь: ${r.bring}. ♡`; nm.value ||= r.name; if (r.bring) br.value = r.bring; } };
    if (name) nm.value = name; show();
    f.addEventListener('submit', e => { e.preventDefault(); const n = nm.value.replace(/\s+/g, ' ').trim().slice(0, 24); if (!n) return;
      MiaStore.update(s => { s.rsvp = { name: n, bring: br.value, week: isoWeek(new Date()), at: Date.now() }; s.guest.name ||= n; });
      show(); toast('Записала тебя на Уютную ночь ♡'); Sound.meow(); const r = f.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + 40); });
  }
  // стена записок (только в этом браузере)
  const list = $('#wallList'), wf = $('#wallForm');
  if (list && wf) { const wn = $('#wallName'), wm = $('#wallMsg'); if (name) wn.value = name;
    const li = (w, i) => { const el = document.createElement('li'); el.style.setProperty('--t', (i % 3 - 1) * 1.5 + 'deg'); const b = document.createElement('b'); b.textContent = w.n + ': '; el.append(b, document.createTextNode(w.m)); return el; };
    const render = () => { list.textContent = ''; const l = MiaStore.read('wall') || []; if (!l.length) { const p = li({ n: 'Мия', m: 'Оставь первую тёплую записку! ♡' }, 0); p.classList.add('ph'); list.append(p); return; } l.slice().reverse().forEach((w, i) => list.append(li(w, i))); };
    render();
    wf.addEventListener('submit', e => { e.preventDefault(); const n = wn.value.trim().slice(0, 24), m = wm.value.trim().slice(0, 140); if (!n || !m) return;
      MiaStore.update(s => { s.wall = [...s.wall, { n, m, at: Date.now() }].slice(-30); s.guest.name ||= n; }); wm.value = '';
      render(); list.firstElementChild && list.firstElementChild.classList.add('new'); Sound.tone(880, .14, 'triangle'); toast('Записка приколота ♡'); });
  }
}
