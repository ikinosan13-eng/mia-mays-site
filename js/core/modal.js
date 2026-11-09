// простая модалка с ловушкой фокуса (лайтбокс Альбома)
import { $$, reduced } from './dom.js';
import { Sound } from './sound.js';
let cur = null, back = null;
const focusables = m => $$('button,[href],input,select,[tabindex]:not([tabindex="-1"])', m).filter(x => !x.disabled && x.offsetParent !== null);
export const Modal = {
  open(m, from) { if (!m) return; if (cur) Modal.close(true); cur = m; back = from || document.activeElement; m.hidden = false; void m.offsetWidth; m.classList.add('open'); document.body.style.overflow = 'hidden'; (focusables(m)[0] || m).focus(); Sound.tone(520, .15); },
  close(instant) { const m = cur; if (!m) return; cur = null; m.classList.remove('open'); document.body.style.overflow = '';
    const done = () => { if (!m.classList.contains('open')) { m.hidden = true; m.dispatchEvent(new Event('modalclose')); } }; instant === true || reduced() ? done() : setTimeout(done, 240); back && back.focus && back.focus(); },
  get cur() { return cur; }
};
addEventListener('keydown', e => { if (!cur) return; if (e.key === 'Escape') { e.preventDefault(); Modal.close(); return; }
  if (e.key === 'Tab') { const f = focusables(cur); if (!f.length) return; const a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } } });
document.addEventListener('click', e => { const m = e.target.closest && e.target.closest('.modal'); if (m && m === cur && (e.target === m || e.target.closest('[data-close]'))) Modal.close(); });
