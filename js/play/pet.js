import { $ } from '../core/dom.js';
import { MiaStore } from '../core/store.js';
import { toast } from '../core/toast.js';
import { Sound } from '../core/sound.js';
export default function init() {
  const pet = $('#petZone'); if (!pet) return;
  const cnt = $('#petCount'); let n = MiaStore.read('games.purrs') || 0, acc = 0, lastP = null; cnt.textContent = n;
  const purr = () => { n++; cnt.textContent = n; MiaStore.set('games.purrs', n); pet.classList.remove('petting'); void pet.offsetWidth; pet.classList.add('petting'); Sound.purr();
    if (n % 25 === 0) { toast(`Уже ${n} мурлыканий! Гладить у тебя получается лучше всех`); } };
  pet.addEventListener('pointermove', e => { if (lastP) { acc += Math.hypot(e.clientX - lastP.x, e.clientY - lastP.y); if (acc > 120) { acc = 0; purr(); } } lastP = { x: e.clientX, y: e.clientY }; });
  pet.addEventListener('pointerleave', () => lastP = null); pet.addEventListener('click', purr);
}
