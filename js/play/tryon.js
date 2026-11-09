import { $, $$ } from '../core/dom.js?v=16';
export default function init() {
  const f = $('#tryFace'); if (!f) return;
  f.addEventListener('change', e => { $('#tryImg').src = e.target.value; });
  $$('[data-acc]').forEach(c => c.addEventListener('click', () => { const on = c.getAttribute('aria-pressed') !== 'true'; c.setAttribute('aria-pressed', on); $('.acc-' + c.dataset.acc).classList.toggle('on', on); }));
}
