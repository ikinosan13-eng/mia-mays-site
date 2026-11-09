// 404: Мия ловит лазерную точку за курсором; 3 раза → «Нашла! Пойдём домой». Только transform, только на событиях, rAF-троттлинг
import { $ } from '../core/dom.js';
import { Sound } from '../core/sound.js';
export default function init() {
  const box = $('#lost'), dot = $('.laser404'), cat = $('#lost picture'), say = $('#lostSay'); if (!box || !dot || !cat) return;
  let x = 0, y = 0, raf = 0, wait = 0, caught = 0, done = false;
  const place = () => { raf = 0; dot.style.transform = `translate(${x}px,${y}px)`; dot.classList.add('on'); };
  const pounce = () => {
    if (done) return; const c = cat.getBoundingClientRect(), dx = x - (c.left + c.width / 2), dy = y - (c.top + c.height / 2), k = Math.min(1, 110 / (Math.hypot(dx, dy) || 1));
    cat.style.transform = `translate(${dx * k}px,${dy * k}px)`; Sound.tone(520, .08, 'triangle');
    setTimeout(() => { cat.style.transform = ''; }, 380);
    if (++caught >= 3) { done = true; dot.classList.remove('on'); say.textContent = 'Нашла! Пойдём домой'; const h = $('#lostHint'); if (h) h.hidden = true; $('.lost .btn')?.focus({ preventScroll: true }); }
  };
  const move = e => { if (done) return; x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(place); clearTimeout(wait); wait = setTimeout(pounce, 450); };
  document.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') move(e); });
  document.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' && !e.target.closest('a,button')) { move(e); clearTimeout(wait); wait = setTimeout(pounce, 200); } });
  document.documentElement.addEventListener('pointerleave', () => { clearTimeout(wait); dot.classList.remove('on'); });
}
