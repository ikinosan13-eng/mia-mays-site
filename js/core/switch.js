// лист «Выключатель»: свет, звук, меньше движения, имя, ссылки, «Забыть всё»
import { MiaStore } from './store.js?v=16';
import { $, whenActive, dayKey } from './dom.js?v=16';
import { toast } from './toast.js?v=16';
import { Sound } from './sound.js?v=16';
import { P } from '../life/phrases.js?v=16';
import { knead } from './knead.js?v=16';
export function initSwitch() {
  const dlg = $('#switchSheet'), btn = $('[data-switch-open]');
  if (!dlg || !btn) return;
  const f = $('form', dlg), main = $('[data-sheet-main]', dlg), conf = $('[data-sheet-confirm]', dlg), imp = $('[data-sheet-import]', dlg), file = $('[data-import]', dlg);
  let pending = null;
  const fill = () => {
    const s = MiaStore.get();
    f.elements.light.value = s.prefs.light || 'auto';
    f.elements.sound.checked = !!s.prefs.sound;
    f.elements.motion.checked = s.prefs.motion === 'reduce';
    f.elements.name.value = s.guest.name || '';
    main.hidden = false; conf.hidden = true; imp.hidden = true; pending = null;
  };
  btn.addEventListener('click', () => { fill(); if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); btn.setAttribute('aria-expanded', 'true'); });
  dlg.addEventListener('close', () => { btn.setAttribute('aria-expanded', 'false'); btn.focus(); });
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); }); // клик по подложке
  const LAMP = { night: P['lamp.night'][0], day: P['lamp.day'][0], auto: P['lamp.auto'][0] };
  f.addEventListener('change', e => {
    const t = e.target;
    if (t.name === 'light') { MiaStore.set('prefs.light', t.value); toast(LAMP[t.value]); }
    if (t.name === 'sound') { MiaStore.set('prefs.sound', t.checked); if (t.checked) { Sound.ensure(); Sound.click(); } }
    if (t.name === 'motion') MiaStore.set('prefs.motion', t.checked ? 'reduce' : 'auto');
    if (t.name === 'name') saveName();
    if (t === file) readKey();
  });
  const saveName = () => { const v = f.elements.name.value.replace(/\s+/g, ' ').trim().slice(0, 24); f.elements.name.value = v; if (v !== (MiaStore.read('guest.name') || '')) { MiaStore.set('guest.name', v); toast(v ? `Запишу на дверце: ${v}` : 'Хорошо, можно и без имени'); } };
  f.elements.name.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); saveName(); } });
  dlg.addEventListener('click', e => {
    const a = e.target.closest('[data-action]'); if (!a) return;
    if (a.dataset.action === 'reset') { main.hidden = true; conf.hidden = false; $('[data-action=reset-no]', conf).focus(); }
    if (a.dataset.action === 'reset-no') { fill(); $('[data-action=reset]', dlg).focus(); }
    if (a.dataset.action === 'export') exportKey();
    if (a.dataset.action === 'reset-yes') { MiaStore.reset(); location.href = 'index.html'; }
    if (a.dataset.action === 'import') { file.value = ''; file.click(); }
    if (a.dataset.action === 'import-no') { fill(); $('[data-action=import]', dlg).focus(); }
    if (a.dataset.action === 'import-yes') {
      if (pending && MiaStore.replace(pending)) { toast('Ключ подошёл! Дом такой, как в ключе ♡'); setTimeout(() => location.reload(), 900); }
      else { fill(); toast(ERR); }
    }
  });
  // «ключ от дома»: всё состояние mia:v1 в JSON-файл (импорт — фаза 3)
  const exportKey = () => {
    const data = { ...MiaStore.get(), exportedAt: new Date().toISOString() };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = `mia-key-${dayKey()}.json`; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    toast('Ключ от дома сохранён. Береги его ♡');
  };
  // импорт: файл → JSON → v===1 → подтверждение; мусор → ошибка, данные не трогаем
  const ERR = 'Ой, лапка соскользнула. Попробуешь ещё раз?';
  const readKey = async () => {
    const fl = file.files && file.files[0]; if (!fl) return;
    const done = knead($('.sheet__links', dlg));
    let obj = null;
    try { if (fl.size > 2e6) throw 0; obj = JSON.parse(await fl.text()); } catch { obj = null; }
    done();
    if (!obj || typeof obj !== 'object' || obj.v !== 1 || !obj.guest || typeof obj.guest !== 'object') { toast(ERR); return; }
    pending = obj; main.hidden = true; imp.hidden = false; $('[data-action=import-no]', imp).focus();
  };
  whenActive(() => { if (MiaStore.memoryOnly && !MiaStore.memWarned) { MiaStore.memWarned = true; toast('Мия не может ничего запомнить в этом режиме браузера'); } });
}
