// Игровая: сегмент «Поиграть | Мастерская», игры открываются во весь экран (<dialog class="fullscreen">)
import { $, $$ } from '../core/dom.js?v=16';
import { MiaStore } from '../core/store.js?v=16';
const MOD = { 'd-pet': 'pet', 'd-yarn': 'yarn', 'd-hearts': 'hearts', 'd-laser': 'laser', 'd-ava': 'avatar', 'd-gif': 'gif', 'd-meme': 'meme', 'd-try': 'tryon' };
const HASH = { games: 'play', ava: 'workshop', make: 'workshop', meme: 'workshop', try: 'workshop', workshop: 'workshop', pet: 'play', hearts: 'play', laser: 'play' };
export default function init() {
  const btns = $$('[data-shelf]'), panels = $$('[data-shelf-panel]');
  const setShelf = (v, focus, save = true) => {
    btns.forEach(b => { const on = b.dataset.shelf === v; b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
    panels.forEach(p => { p.hidden = p.dataset.shelfPanel !== v; });
    if (save) MiaStore.set('play.shelf', v);
  };
  btns.forEach((b, i) => {
    b.addEventListener('click', () => setShelf(b.dataset.shelf));
    b.addEventListener('keydown', e => { const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!d) return; e.preventDefault(); setShelf(btns[(i + d + btns.length) % btns.length].dataset.shelf, true); });
  });
  const h = location.hash.slice(1);
  setShelf(HASH[h] || MiaStore.read('play.shelf') || 'play', false, false); // хэш не меняет сохранённую полку
  if (HASH[h]) { const t = document.getElementById(h); if (t) requestAnimationFrame(() => t.scrollIntoView({ block: 'center' })); }

  const stats = () => { const g = MiaStore.read('games') || {}; const p = $('[data-purrs]'), b = $('[data-best]'); if (p) p.textContent = g.purrs ? `Мурлыканий: ${g.purrs}` : ''; if (b) b.textContent = g.heartsBest ? `Рекорд: ${g.heartsBest}` : ''; };
  stats(); MiaStore.on('games', stats);

  const ready = new Set();
  $$('[data-open]').forEach(b => b.addEventListener('click', () => {
    const d = document.getElementById(b.dataset.open); if (!d) return;
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
    document.documentElement.classList.add('fs-open');
    if (!ready.has(d.id)) { ready.add(d.id); import(`../play/${MOD[d.id]}.js?v=16`).then(m => m.default()).catch(e => console.error(e)); }
    d.addEventListener('close', () => { document.documentElement.classList.remove('fs-open'); b.focus(); }, { once: true });
  }));
  $$('[data-close-dlg]').forEach(b => b.addEventListener('click', () => b.closest('dialog').close()));
}
