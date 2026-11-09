// пасхалка: набери «мяу» (или meow) — с неба сыплются лапки (по событию, один раз)
import { reduced } from './dom.js';
import { toast } from './toast.js';
import { Sound } from './sound.js';
export function initEggs() {
  let buf = '';
  addEventListener('keydown', e => {
    if (e.target.closest('input,textarea,select,[contenteditable]') || e.key.length !== 1) return;
    buf = (buf + e.key.toLowerCase()).slice(-4);
    if (!/мяу$|meow$/.test(buf)) return; buf = ''; Sound.meow(); toast('Мяу? Ты говоришь по-кошачьи!'); if (reduced()) return;
    for (let i = 0; i < 20; i++) setTimeout(() => { const p = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); p.setAttribute('class', 'paw-rain i'); p.setAttribute('aria-hidden', 'true'); p.innerHTML = '<use href="#i-paw"/>';
      p.style.cssText = `left:${Math.random() * 100}vw;--t:${2.4 + Math.random() * 2}s;--dx:${(Math.random() * 120 - 60).toFixed(0)}px;--r:${(Math.random() * 360).toFixed(0)}deg`; document.body.append(p); setTimeout(() => p.remove(), 4600); }, i * 80);
  });
}
