// синтез звуков без файлов; выключено по умолчанию (prefs.sound)
import { MiaStore } from './store.js';
let ctx = null, last = 0;
const isOn = () => !!MiaStore.read('prefs.sound');
const ensure = () => { if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); } if (ctx.state === 'suspended') ctx.resume(); return ctx; };
function tone(f = 880, d = .09, type = 'sine', vol = .03) {
  if (!isOn() || !ensure()) return; const n = ctx.currentTime; if (n - last < .04) return; last = n;
  const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, n); o.frequency.exponentialRampToValueAtTime(f * 1.5, n + d);
  g.gain.setValueAtTime(0, n); g.gain.linearRampToValueAtTime(vol, n + .01); g.gain.exponentialRampToValueAtTime(.0001, n + d); o.connect(g).connect(ctx.destination); o.start(n); o.stop(n + d + .02);
}
function meow() {
  if (!isOn() || !ensure()) return; const n = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle';
  o.frequency.setValueAtTime(600, n); o.frequency.linearRampToValueAtTime(900, n + .12); o.frequency.linearRampToValueAtTime(500, n + .35);
  g.gain.setValueAtTime(0, n); g.gain.linearRampToValueAtTime(.035, n + .04); g.gain.exponentialRampToValueAtTime(.0001, n + .4); o.connect(g).connect(ctx.destination); o.start(n); o.stop(n + .42);
}
const purr = () => tone(180 + Math.random() * 40, .2, 'sawtooth', .015);
const click = () => tone(1200, .03, 'square', .012);
export const Sound = { tone, meow, purr, click, ensure };
const unlock = () => { if (isOn()) ensure(); removeEventListener('pointerdown', unlock); removeEventListener('keydown', unlock); };
addEventListener('pointerdown', unlock); addEventListener('keydown', unlock);
document.addEventListener('pointerover', e => { if (e.pointerType !== 'mouse') return; const t = e.target.closest && e.target.closest('.btn,.chip,.rooms a,.g,.sticker'); if (t && !t.contains(e.relatedTarget)) tone(1100 + Math.random() * 200, .06); });
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('.btn,.chip,.icon-btn')) tone(700, .1, 'triangle'); });
