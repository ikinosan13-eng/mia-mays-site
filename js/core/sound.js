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
// мурлыканье: шум → lowpass 400 Гц, амплитудная модуляция 26 Гц, огибающая 0.6 с, громкость ≤ 0.04; не чаще раза в 0.6 с
let noise = null, lastPurr = 0;
function purr() {
  if (!isOn() || !ensure()) return; const n = ctx.currentTime; if (n - lastPurr < .6) return; lastPurr = n;
  if (!noise) { noise = ctx.createBuffer(1, ctx.sampleRate * .7 | 0, ctx.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const src = ctx.createBufferSource(), lp = ctx.createBiquadFilter(), am = ctx.createGain(), lfo = ctx.createOscillator(), depth = ctx.createGain(), env = ctx.createGain();
  src.buffer = noise; lp.type = 'lowpass'; lp.frequency.value = 400;
  lfo.frequency.value = 26; depth.gain.value = .5; am.gain.value = .5; lfo.connect(depth).connect(am.gain);
  env.gain.setValueAtTime(0, n); env.gain.linearRampToValueAtTime(.04, n + .12); env.gain.setValueAtTime(.04, n + .38); env.gain.linearRampToValueAtTime(0, n + .6);
  src.connect(lp).connect(am).connect(env).connect(ctx.destination); src.start(n); lfo.start(n); src.stop(n + .62); lfo.stop(n + .62);
}
const click = () => tone(1200, .03, 'square', .012);
export const Sound = { tone, meow, purr, click, ensure, get on() { return isOn(); } };
const unlock = () => { if (isOn()) ensure(); removeEventListener('pointerdown', unlock); removeEventListener('keydown', unlock); };
addEventListener('pointerdown', unlock); addEventListener('keydown', unlock);
document.addEventListener('pointerover', e => { if (e.pointerType !== 'mouse') return; const t = e.target.closest && e.target.closest('.btn,.chip,.rooms a,.g,.sticker'); if (t && !t.contains(e.relatedTarget)) tone(1100 + Math.random() * 200, .06); });
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('.btn,.chip,.icon-btn')) tone(700, .1, 'triangle'); });
