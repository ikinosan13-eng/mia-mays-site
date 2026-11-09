import { $, load, dl } from '../core/dom.js';
import { toast } from '../core/toast.js';
export default function init() {
  const mc = $('#memeCanvas'); if (!mc) return; const mx = mc.getContext('2d');
  async function meme() { const i = await load($('#memeImg').value); if (!i) return; const s = Math.max(600 / i.width, 600 / i.height);
    mx.drawImage(i, (600 - i.width * s) / 2, (600 - i.height * s) / 2, i.width * s, i.height * s);
    mx.font = 'bold 44px Nunito, Impact, sans-serif'; mx.textAlign = 'center'; mx.lineWidth = 8; mx.strokeStyle = '#2A2230'; mx.fillStyle = '#fff';
    [[$('#memeTop').value, 60], [$('#memeBot').value, 575]].forEach(([t, y]) => { t = t.toUpperCase(); mx.strokeText(t, 300, y, 570); mx.fillText(t, 300, y, 570); }); }
  ['#memeImg', '#memeTop', '#memeBot'].forEach(s => $(s).addEventListener('input', meme)); meme(); document.fonts && document.fonts.ready.then(meme);
  $('#memeDl').addEventListener('click', () => { dl(mc.toDataURL('image/png'), 'mia-mem.png'); toast('Мем сохранён 😸'); });
}
