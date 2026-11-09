import { $, whenActive } from './dom.js';
let cur = null, timer = 0;
// не больше одного тоста одновременно; 3 с; опционально кнопка-действие
export function toast(text, { action, onAction, ms = 3000 } = {}) {
  whenActive(() => {
    const box = $('.toasts'); if (!box) return;
    if (cur) { clearTimeout(timer); cur.remove(); cur = null; }
    const t = document.createElement('div'); t.className = 'toast';
    const s = document.createElement('span'); s.textContent = text; t.append(s);
    if (action) { const b = document.createElement('button'); b.type = 'button'; b.textContent = action; b.addEventListener('click', () => { onAction && onAction(); hide(t); }); t.append(b); }
    box.append(t); cur = t;
    timer = setTimeout(() => hide(t), ms);
  });
}
function hide(t) { if (!t.isConnected) return; t.classList.add('out'); setTimeout(() => t.remove(), 240); if (cur === t) cur = null; }
