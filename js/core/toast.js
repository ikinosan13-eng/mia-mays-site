import { $, whenActive } from './dom.js';
let cur = null, timer = 0, pinned = null;
// не больше одного тоста одновременно; 3 с; опционально кнопка-действие.
// sticky: висит, пока не нажмут (обновление дома); обычные тосты показываются поверх и потом возвращают его.
export function toast(text, { action, onAction, ms = 3000, sticky = false } = {}) {
  whenActive(() => {
    const box = $('.toasts'); if (!box) return;
    const opts = { text, action, onAction, ms, sticky };
    if (sticky) pinned = opts;
    show(box, opts);
  });
}
function show(box, o) {
  if (cur) { clearTimeout(timer); cur.remove(); cur = null; }
  const t = document.createElement('div'); t.className = 'toast'; if (o.sticky) t.dataset.sticky = '';
  const s = document.createElement('span'); s.textContent = o.text; t.append(s);
  if (o.action) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = o.action;
    b.addEventListener('click', () => { if (o.sticky) pinned = null; o.onAction && o.onAction(); hide(t); }); t.append(b);
  }
  box.append(t); cur = t;
  if (!o.sticky) timer = setTimeout(() => hide(t), o.ms);
}
function hide(t) {
  if (!t.isConnected) return; t.classList.add('out'); if (cur === t) cur = null;
  setTimeout(() => { t.remove(); const box = $('.toasts'); if (pinned && !cur && box) show(box, pinned); }, 240);
}
