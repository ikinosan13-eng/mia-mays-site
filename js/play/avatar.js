import { $, $$, load, dl } from '../core/dom.js?v=16';
import { toast } from '../core/toast.js?v=16';
import { Box } from '../core/box.js?v=16';
export default function init() {
  const ac = $('#avaCanvas'); if (!ac) return;
  const ax = ac.getContext('2d'), S = 512; let img = null, ox = 0, oy = 0, drag = null; const opt = { ears: true, bow: true, blush: false, frame: true };
  load('img/face-pajama2-512.webp').then(i => { img = i; draw(); });
  const zoom = $('#avaZoom'), col = $('#avaColor'), earS = $('#avaEar');
  function ear(x, y, s, flip) { ax.save(); ax.translate(x, y); ax.scale(flip ? -s : s, s); ax.fillStyle = col.value; ax.strokeStyle = '#2A2230'; ax.lineWidth = 6;
    ax.beginPath(); ax.moveTo(-50, 40); ax.quadraticCurveTo(-40, -70, 10, -95); ax.quadraticCurveTo(40, -30, 50, 40); ax.closePath(); ax.fill(); ax.stroke();
    ax.fillStyle = '#fff'; ax.beginPath(); ax.moveTo(-26, 30); ax.quadraticCurveTo(-18, -40, 8, -60); ax.quadraticCurveTo(26, -10, 28, 30); ax.closePath(); ax.fill(); ax.restore(); }
  function draw() { ax.clearRect(0, 0, S, S); ax.save(); ax.beginPath(); ax.arc(S / 2, S / 2, S / 2, 0, 7); ax.clip(); ax.fillStyle = '#fbd9e7'; ax.fillRect(0, 0, S, S);
    if (img) { const z = +zoom.value, s = Math.max(S / img.width, S / img.height) * z, w = img.width * s, h = img.height * s; ax.drawImage(img, (S - w) / 2 + ox, (S - h) / 2 + oy, w, h); }
    if (opt.blush) { ax.fillStyle = '#ff8fb066'; [[170, 330], [342, 330]].forEach(([x, y]) => { ax.beginPath(); ax.ellipse(x, y, 40, 22, 0, 0, 7); ax.fill(); }); }
    ax.restore(); const es = +earS.value;
    if (opt.ears) { ear(140, 120, es, false); ear(372, 120, es, true); }
    if (opt.bow) { ax.save(); ax.translate(390, 210); ax.rotate(.3); ax.fillStyle = '#e0607e'; ax.strokeStyle = '#2A2230'; ax.lineWidth = 5;
      ax.beginPath(); ax.moveTo(0, 0); ax.lineTo(-55, -32); ax.lineTo(-55, 32); ax.closePath(); ax.fill(); ax.stroke(); ax.beginPath(); ax.moveTo(0, 0); ax.lineTo(55, -32); ax.lineTo(55, 32); ax.closePath(); ax.fill(); ax.stroke();
      ax.fillStyle = '#F5B8D4'; ax.beginPath(); ax.arc(0, 0, 14, 0, 7); ax.fill(); ax.stroke(); ax.restore(); }
    if (opt.frame) { ax.lineWidth = 16; ax.strokeStyle = '#F5B8D4'; ax.beginPath(); ax.arc(S / 2, S / 2, S / 2 - 8, 0, 7); ax.stroke(); } }
  $('#avaFile').addEventListener('change', e => { const f = e.target.files[0]; if (!f) return; const u = URL.createObjectURL(f); load(u).then(i => { if (!i) { toast('Ой, лапка соскользнула. Попробуешь ещё раз?'); return; } img = i; ox = oy = 0; zoom.value = 1; draw(); URL.revokeObjectURL(u); toast('Фото загружено — только у тебя в браузере'); }); });
  [zoom, col, earS].forEach(i => i.addEventListener('input', draw));
  $$('[data-ava]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.ava; opt[k] = !opt[k]; b.setAttribute('aria-pressed', opt[k]); draw(); }));
  ac.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, ox, oy }; ac.setPointerCapture(e.pointerId); });
  ac.addEventListener('pointermove', e => { if (!drag) return; const k = S / ac.getBoundingClientRect().width; ox = drag.ox + (e.clientX - drag.x) * k; oy = drag.oy + (e.clientY - drag.y) * k; draw(); });
  ac.addEventListener('pointerup', () => drag = null); ac.addEventListener('pointercancel', () => drag = null);
  $('#avaDl').addEventListener('click', () => { dl(ac.toDataURL('image/png'), 'mia-avatarka.png'); toast('Аватарка сохранена ♡'); });
  // в коробку — маленькая превьюшка 112 px (живёт только в этом браузере, никуда не отправляется)
  const thumb = () => { const c = document.createElement('canvas'); c.width = c.height = 112; c.getContext('2d').drawImage(ac, 0, 0, 112, 112);
    const w = c.toDataURL('image/webp', .8); if (w.startsWith('data:image/webp')) return w;
    const x = c.getContext('2d'); x.globalCompositeOperation = 'destination-over'; x.fillStyle = '#F7DDE5'; x.fillRect(0, 0, 112, 112); return c.toDataURL('image/jpeg', .8); };
  $('#avaBox').addEventListener('click', () => Box.add({ id: 'avatar-' + Date.now().toString(36), kind: 'avatar', title: 'Аватарка с ушками (сделана в Мастерской)', thumb: thumb() }, ac));
}
