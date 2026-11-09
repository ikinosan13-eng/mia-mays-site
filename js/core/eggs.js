// пасхалка: набери «мяу» (или meow) вне полей ввода — Мия в шапке дёргает ушками и отвечает. Один раз за визит.
import { $ } from './dom.js?v=16';
import { toast } from './toast.js?v=16';
import { Sound } from './sound.js?v=16';
import { P } from '../life/phrases.js?v=16';
export function initEggs() {
  // котик в консоли — один раз за сессию
  try { if (!sessionStorage.getItem('mia:cat')) { sessionStorage.setItem('mia:cat', '1'); console.log('%c /\\_/\\\n( o.o )  Мур, разработчик!\n > ^ <   Исходники: github.com/ikinosan13-eng/mia-mays-site', 'color:#A23F66;font:600 13px/1.3 monospace'); } } catch {}
  let buf = '', done = false;
  addEventListener('keydown', e => {
    if (done || e.target.closest('input,textarea,select,[contenteditable]') || e.key.length !== 1) return;
    buf = (buf + e.key.toLowerCase()).slice(-4);
    if (!/мяу$|meow$/.test(buf)) return; done = true;
    Sound.meow(); toast(P.meow[0]);
    const c = $('.mia-chip'); if (c) { c.classList.remove('twitch'); void c.offsetWidth; c.classList.add('twitch'); setTimeout(() => c.classList.remove('twitch'), 500); }
  });
}
