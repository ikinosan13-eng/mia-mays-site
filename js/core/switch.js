// лист «Выключатель»: свет, звук, меньше движения, имя, ссылки, «Забыть всё»
import { MiaStore } from './store.js';
import { $, whenActive } from './dom.js';
import { toast } from './toast.js';
import { Sound } from './sound.js';
export function initSwitch() {
  const dlg = $('#switchSheet'), btn = $('[data-switch-open]');
  if (!dlg || !btn) return;
  const f = $('form', dlg), main = $('[data-sheet-main]', dlg), conf = $('[data-sheet-confirm]', dlg);
  const fill = () => {
    const s = MiaStore.get();
    f.elements.light.value = s.prefs.light || 'auto';
    f.elements.sound.checked = !!s.prefs.sound;
    f.elements.motion.checked = s.prefs.motion === 'reduce';
    f.elements.name.value = s.guest.name || '';
    main.hidden = false; conf.hidden = true;
  };
  btn.addEventListener('click', () => { fill(); if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); btn.setAttribute('aria-expanded', 'true'); });
  dlg.addEventListener('close', () => { btn.setAttribute('aria-expanded', 'false'); btn.focus(); });
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); }); // клик по подложке
  const LAMP = { night: 'Свет погас… Я тогда посплю, ладно? 💤', day: 'Ой, светло! Я ещё не причесалась', auto: 'Пусть свет будет как за окном. Так честнее' };
  f.addEventListener('change', e => {
    const t = e.target;
    if (t.name === 'light') { MiaStore.set('prefs.light', t.value); toast(LAMP[t.value]); }
    if (t.name === 'sound') { MiaStore.set('prefs.sound', t.checked); if (t.checked) { Sound.ensure(); Sound.click(); } }
    if (t.name === 'motion') MiaStore.set('prefs.motion', t.checked ? 'reduce' : 'auto');
    if (t.name === 'name') saveName();
  });
  const saveName = () => { const v = f.elements.name.value.replace(/\s+/g, ' ').trim().slice(0, 24); f.elements.name.value = v; if (v !== (MiaStore.read('guest.name') || '')) { MiaStore.set('guest.name', v); toast(v ? `Запишу на дверце: ${v}` : 'Хорошо, можно и без имени'); } };
  f.elements.name.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); saveName(); } });
  dlg.addEventListener('click', e => {
    const a = e.target.closest('[data-action]'); if (!a) return;
    if (a.dataset.action === 'reset') { main.hidden = true; conf.hidden = false; $('[data-action=reset-no]', conf).focus(); }
    if (a.dataset.action === 'reset-no') { fill(); $('[data-action=reset]', dlg).focus(); }
    if (a.dataset.action === 'reset-yes') { MiaStore.reset(); location.href = 'index.html'; }
  });
  whenActive(() => { if (MiaStore.memoryOnly && !MiaStore.memWarned) { MiaStore.memWarned = true; toast('Мия не может ничего запомнить в этом режиме браузера'); } });
}
