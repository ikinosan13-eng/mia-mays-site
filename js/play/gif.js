import { $, load, dl, reduced, lite } from '../core/dom.js';
import { toast } from '../core/toast.js';
export default function init() {
  const gc = $('#gifCanvas'); if (!gc) return;
  const gx = gc.getContext('2d'); let gImg, t0 = performance.now(), on = false, raf = 0;
  const still = () => reduced() || lite();
  const kick = () => { if (!raf && on && !document.hidden) raf = requestAnimationFrame(loop); };
  const set = async () => { gImg = await load($('#gifImg').value); draw(t0); kick(); };
  function draw(t) { const k = (t - t0) / 1000, a = $('#gifAnim').value; gx.fillStyle = '#fbd9e7'; gx.fillRect(0, 0, 320, 320);
    let dx = 0, dy = 0, r = 0; if (a === 'bounce') dy = -Math.abs(Math.sin(k * 5)) * 24; else if (a === 'shake') dx = Math.sin(k * 40) * 6; else r = Math.sin(k * 6) * .12;
    if (gImg) { gx.save(); gx.translate(160 + dx, 165 + dy); gx.rotate(r); gx.beginPath(); gx.arc(0, 0, 115, 0, 7); gx.clip(); gx.drawImage(gImg, -120, -120, 240, 240); gx.restore(); }
    const s = $('#gifStk').value; if (s) { gx.font = '48px serif'; gx.textAlign = 'start'; gx.fillText(s, 250, 70 + Math.sin(k * 4) * 6); }
    gx.font = 'bold 32px Nunito, sans-serif'; gx.textAlign = 'center'; gx.lineWidth = 6; gx.strokeStyle = '#fff'; gx.fillStyle = '#e0607e';
    const txt = $('#gifText').value; gx.strokeText(txt, 160, 305, 300); gx.fillText(txt, 160, 305, 300); }
  // анимация крутится только пока окно гифки открыто и видно (rec — тоже)
  function loop(t) { raf = 0; if (!on || document.hidden) return; draw(still() && !rec ? t0 : t); if (!still() || rec) kick(); }
  let rec = false;
  const dlg = gc.closest('dialog');
  const sync = () => { on = !!(dlg ? dlg.open : true); if (on) kick(); };
  if (dlg) { new MutationObserver(sync).observe(dlg, { attributes: true, attributeFilter: ['open'] }); }
  document.addEventListener('visibilitychange', kick);
  $('#gifImg').addEventListener('change', set);
  ['#gifText', '#gifStk', '#gifAnim'].forEach(q => $(q).addEventListener('input', () => { draw(t0); kick(); }));
  set(); sync();
  $('#gifPng').addEventListener('click', () => { dl(gc.toDataURL('image/png'), 'mia-kadr.png'); toast('Кадр сохранён'); });
  $('#gifRec').addEventListener('click', () => { const st = $('#gifStatus');
    if (!window.MediaRecorder || !gc.captureStream) { st.textContent = 'Запись не поддерживается — сохранила кадр.'; return dl(gc.toDataURL(), 'mia-kadr.png'); }
    const r = new MediaRecorder(gc.captureStream(30), MediaRecorder.isTypeSupported('video/webm') ? { mimeType: 'video/webm' } : {}), chunks = [];
    r.ondataavailable = e => chunks.push(e.data); r.onstop = () => { rec = false; dl(URL.createObjectURL(new Blob(chunks, { type: 'video/webm' })), 'mia-gifka.webm'); st.textContent = 'Готово!'; toast('Видео-гифка готова ♡'); };
    st.textContent = 'Записываю 3 секунды…'; rec = true; kick(); r.start(); setTimeout(() => r.stop(), 3000); });
}
