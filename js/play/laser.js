import { $, $$ } from '../core/dom.js?v=16';
export default function init() {
  const area = $('.toy-area'); if (!area) return;
  const laser = $('.laser', area), [el, er] = $$('.ear', area); let lp = { x: .5, y: .3 };
  const setLaser = (x, y) => { lp = { x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) }; laser.style.left = lp.x * 100 + '%'; laser.style.top = lp.y * 100 + '%';
    const tilt = (lp.x - .5) * 50, perk = 1 + (1 - lp.y) * .3; el.style.transform = `rotate(${tilt - 10}deg) scaleY(${perk})`; er.style.transform = `rotate(${tilt + 10}deg) scaleY(${perk})`; };
  area.addEventListener('pointermove', e => { const r = area.getBoundingClientRect(); setLaser((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height); });
  area.addEventListener('keydown', e => { const d = { ArrowLeft: [-.05, 0], ArrowRight: [.05, 0], ArrowUp: [0, -.05], ArrowDown: [0, .05] }[e.key]; if (d) { e.preventDefault(); setLaser(lp.x + d[0], lp.y + d[1]); } });
  setLaser(.5, .3);
}
