// Гостиная: отсчёт до пятницы, «Я приду», стена записок
import { $, $$ } from '../core/dom.js?v=16';
import { MiaStore } from '../core/store.js?v=16';
import { countdown } from '../core/countdown.js?v=16';
import { toast } from '../core/toast.js?v=16';
import { Sound } from '../core/sound.js?v=16';
import { burst } from '../core/fx.js?v=16';
import { isoWeek } from '../life/clock.js?v=16';
import { data } from '../life/data.js?v=16';
import { esc } from '../core/dom.js?v=16';
const HASH = { friday: 'friday', rsvp: 'friday', countdown: 'friday', wall: 'wall', info: 'info', rules: 'info', about: 'info' };
// полки «Пятница · Стена · О доме» (как в Игровой); без JS видны все разделы подряд
function shelves() {
  const btns = $$('[data-shelf]'), panels = $$('[data-shelf-panel]');
  const set = (v, focus) => {
    btns.forEach(b => { const on = b.dataset.shelf === v; b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
    panels.forEach(p => { p.hidden = p.dataset.shelfPanel !== v; });
    document.dispatchEvent(new CustomEvent('mia:shelf', { detail: v }));
  };
  btns.forEach((b, i) => {
    b.addEventListener('click', () => set(b.dataset.shelf));
    b.addEventListener('keydown', e => { const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!d) return; e.preventDefault(); set(btns[(i + d + btns.length) % btns.length].dataset.shelf, true); });
  });
  const go = () => { const h = location.hash.slice(1); set(HASH[h] || 'friday');
    if (HASH[h] && !['friday', 'wall', 'info'].includes(h)) { const t = document.getElementById(h); if (t) requestAnimationFrame(() => t.scrollIntoView({ block: 'start' })); } };
  go(); addEventListener('hashchange', go);
  return set;
}
export default function init() {
  const setShelf = shelves();
  // витрина «Записки гостей» из data/notes.json (владелец отбирает руками); пусто — блока нет
  data('notes').then(ns => { const box = $('#notesShow'); if (!box || !Array.isArray(ns) || !ns.length) return;
    $('#notesList').innerHTML = ns.slice(0, 24).map(n => `<li><b>${esc(n.n || 'Гость')}</b><br>${esc(n.m || '')}</li>`).join(''); box.hidden = false; });
  // титры: тройной тап по знаку дома в «О доме»
  const logo = $('#aboutLogo'), cr = $('#credits'); let taps = [];
  if (logo && cr) logo.addEventListener('click', () => { const t = performance.now(); taps = [...taps.filter(x => t - x < 900), t];
    if (taps.length >= 3) { taps = []; cr.hidden = !cr.hidden; if (!cr.hidden) cr.focus(); } });
  countdown($('#countdown'), $('#countdownSr'));
  const name = MiaStore.read('guest.name') || '';
  // запись на Уютную ночь
  const f = $('#rsvp');
  if (f) { const st = $('#rsvpStatus'), nm = $('#rsvpName'), br = $('#rsvpBring');
    const show = () => { const r = MiaStore.read('rsvp'); if (r && r.name) { st.textContent = `Ты в списке, ${r.name}! Принесёшь: ${r.bring}. ♡`; nm.value ||= r.name; if (r.bring) br.value = r.bring; } };
    if (name) nm.value = name; show();
    f.addEventListener('submit', e => { e.preventDefault(); const n = nm.value.replace(/\s+/g, ' ').trim().slice(0, 24); if (!n) return;
      MiaStore.update(s => { s.rsvp = { name: n, bring: br.value, week: isoWeek(new Date()), at: Date.now() }; s.guest.name ||= n; });
      show(); bar(); toast('Записала тебя на Уютную ночь ♡'); Sound.meow(); const r = f.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + 40); });
  }
  // липкая кнопка «Я приду» над таб-баром — пока записи нет и форма не на экране
  const barEl = $('#rsvpBar'); let formVisible = true, shelf = 'friday';
  const bar = () => { if (barEl) barEl.hidden = !!(MiaStore.read('rsvp') || {}).name || formVisible || shelf !== 'friday'; };
  if (barEl && f && 'IntersectionObserver' in window) {
    new IntersectionObserver(es => { formVisible = es[0].isIntersecting; bar(); }).observe(f.querySelector('[type=submit]'));
    document.addEventListener('mia:shelf', e => { shelf = e.detail; bar(); });
    barEl.querySelector('[data-rsvp-go]').addEventListener('click', () => { setShelf('friday'); f.scrollIntoView({ block: 'center' }); $('#rsvpName').focus({ preventScroll: true }); });
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
