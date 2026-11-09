// Альбом: лайтбокс (клавиатура ←/→/Esc, свайп), тост для обоев
import { $, $$ } from '../core/dom.js';
import { Modal } from '../core/modal.js';
import { toast } from '../core/toast.js';
export default function init() {
  const lb = $('#lb'); if (!lb) return;
  const img = $('#lbImg'), cap = $('#lbCap'), items = $$('.g');
  const BLANK = img.src; let gi = 0;
  const big = im => { const src = im.parentElement && im.parentElement.tagName === 'PICTURE' && $('source:not([media])', im.parentElement); if (!src) return im.currentSrc || im.src; const c = src.srcset.split(',').map(x => x.trim().split(' ')[0]); return c[c.length - 1]; };
  const show = i => { gi = (i + items.length) % items.length; const im = $('img', items[gi]); img.removeAttribute('width'); img.removeAttribute('height'); img.src = big(im); img.alt = im.alt || '';
    cap.textContent = ($('.g-cap', items[gi].closest('figure')) || {}).textContent || ''; };
  items.forEach((b, i) => b.addEventListener('click', () => { show(i); const run = () => Modal.open(lb, b);
    if (document.startViewTransition && document.documentElement.dataset.motion !== 'reduce' && !document.documentElement.classList.contains('lite')) { try { document.startViewTransition(run); return; } catch {} } run(); }));
  $('.lb-nav.prev', lb).addEventListener('click', () => show(gi - 1)); $('.lb-nav.next', lb).addEventListener('click', () => show(gi + 1));
  addEventListener('keydown', e => { if (Modal.cur === lb && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) show(gi + (e.key === 'ArrowLeft' ? -1 : 1)); });
  let sx = null; lb.addEventListener('pointerdown', e => sx = e.clientX); lb.addEventListener('pointerup', e => { if (sx !== null && Math.abs(e.clientX - sx) > 50) show(gi + (e.clientX < sx ? 1 : -1)); sx = null; });
  lb.addEventListener('modalclose', () => { img.src = BLANK; img.alt = ''; img.width = 1; img.height = 1; cap.textContent = ''; });
  document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('a[download]'); if (!a) return; toast(a.hasAttribute('data-wallpaper') ? 'Готово! Теперь я у тебя на обоях 😳' : 'Скачиваю… спасибо! ♡'); });
}
