// пасхалка: набери «мяу» (или meow) вне полей ввода — Мия в шапке дёргает ушками и отвечает. Один раз за визит.
import { $ } from './dom.js';
import { toast } from './toast.js';
import { Sound } from './sound.js';
export function initEggs() {
  let buf = '', done = false;
  addEventListener('keydown', e => {
    if (done || e.target.closest('input,textarea,select,[contenteditable]') || e.key.length !== 1) return;
    buf = (buf + e.key.toLowerCase()).slice(-4);
    if (!/мяу$|meow$/.test(buf)) return; done = true;
    Sound.meow(); toast('Мяу? Ты говоришь по-кошачьи!');
    const c = $('.mia-chip'); if (c) { c.classList.remove('twitch'); void c.offsetWidth; c.classList.add('twitch'); setTimeout(() => c.classList.remove('twitch'), 500); }
  });
}
