// PWA: регистрация SW (не в prerender), тост обновления, предложение «Поселить Мию на экран», подсказка для iOS.
import { $, whenActive, icon } from './dom.js?v=16';
import { MiaStore } from './store.js?v=16';
import { toast } from './toast.js?v=16';
const DAY = 864e5;
const room = () => document.body.dataset.room;
export const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
export const isIOS = () => /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let deferred = null;

function register() {
  if (!('serviceWorker' in navigator)) return;
  const sw = navigator.serviceWorker;
  // ?nosw=1 — аварийно для одного гостя: снять SW и кэши Мии
  if (/[?&]nosw=1/.test(location.search)) {
    sw.controller?.postMessage('OFF');
    // второй проход: запросы, начатые до OFF (данные после idle), могли успеть положить что-то в кэш
    const sweep = () => caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('mia-')).map(k => caches.delete(k))));
    sw.getRegistrations().then(rs => Promise.all(rs.map(r => r.unregister())))
      .then(sweep).then(() => { setTimeout(sweep, 500); toast('Мия убрала офлайн-кэш. Дом теперь работает только по сети'); });
    return;
  }
  const hadController = !!sw.controller;
  const go = async () => {
    let reg; try { reg = await sw.register('sw.js', { scope: './' }); } catch (e) { console.warn('sw', e); return; }
    if (!reg) return; // SW выключен политикой браузера
    const ask = w => toast('Мия переставила мебель. Обновить дом?', { action: 'Обновить', sticky: true, onAction: () => w.postMessage('SKIP_WAITING') });
    if (reg.waiting && sw.controller) ask(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const w = reg.installing; if (!w) return;
      w.addEventListener('statechange', () => { if (w.state === 'installed' && sw.controller) ask(w); });
    });
    // перезагрузка ровно один раз и только при смене версии (не при самой первой установке)
    let reloaded = false;
    sw.addEventListener('controllerchange', () => { if (hadController && !reloaded) { reloaded = true; location.reload(); } });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) reg.update().catch(() => {}); });
  };
  if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
}

const eligible = () => {
  const s = MiaStore.get();
  if (isStandalone() || s.pwa.installed || room() === 'intro') return false;
  const d = s.pwa.promptDismissedAt;
  return (s.visits.days || 0) >= 2 && (!d || Date.now() - d > 14 * DAY);
};
function markInstalled() {
  if (!MiaStore.read('pwa.installed')) MiaStore.set('pwa.installed', true);
  navigator.storage?.persist?.().catch(() => {});
  $('#installCard')?.remove(); const b = $('[data-action=install]'); if (b) b.hidden = true;
}
function card(kind) {
  if ($('#installCard')) return $('#installCard');
  const main = $('main'); if (!main) return null;
  const ios = kind === 'ios', el = document.createElement('section');
  el.className = 'sec install-card'; el.id = 'installCard'; el.setAttribute('aria-labelledby', 'installTitle');
  el.innerHTML = `<div class="card install-card__in"><img src="img/icons/icon-192.a1.png" alt="" width="56" height="56">
    <div class="install-card__txt"><h2 id="installTitle">Поселить Мию на экран</h2>
    <p>${ios ? `Нажми «Поделиться» <span class="ios-share">${icon('share')}<span class="sr-only">(значок со стрелкой вверх)</span></span>, потом «На экран „Домой“».` : 'Будет мурчать у тебя на телефоне, даже без интернета'}</p>
    <div class="row">${ios ? '<button type="button" class="btn small" data-inst="ok">Понятно</button>' : '<button type="button" class="btn small" data-inst="go">Поселить</button><button type="button" class="btn small ghost" data-inst="later">Не сейчас</button>'}</div></div></div>`;
  main.append(el);
  el.addEventListener('click', async e => {
    const b = e.target.closest('[data-inst]'); if (!b) return;
    if (b.dataset.inst === 'go') await prompt();
    else { MiaStore.set('pwa.promptDismissedAt', Date.now()); el.remove(); if (b.dataset.inst === 'later') toast('Хорошо, спрошу через пару недель'); }
  });
  return el;
}
async function prompt() {
  if (!deferred) { if (isIOS()) { const c = card('ios'); c?.scrollIntoView({ block: 'center' }); c?.querySelector('button')?.focus(); } return; }
  const d = deferred; deferred = null;
  d.prompt();
  const { outcome } = await d.userChoice.catch(() => ({ outcome: 'dismissed' }));
  $('#installCard')?.remove(); const b = $('[data-action=install]'); if (b) b.hidden = true;
  if (outcome !== 'accepted') MiaStore.set('pwa.promptDismissedAt', Date.now());
}

export function initPWA() {
  whenActive(() => {
    register();
    if (isStandalone()) { markInstalled(); return; }
    const sheetBtn = $('[data-action=install]');
    sheetBtn?.addEventListener('click', () => { $('#switchSheet')?.close(); prompt(); });
    const onBip = e => {
      e.preventDefault(); deferred = e;
      if (sheetBtn) sheetBtn.hidden = false;
      if (room() === 'home' && eligible()) card('install');
    };
    if (window.__miaBip) { onBip(window.__miaBip); window.__miaBip = null; }
    addEventListener('beforeinstallprompt', onBip);
    addEventListener('appinstalled', () => { markInstalled(); toast('Ура, я теперь живу у тебя на экране ♡'); });
    if (isIOS() && !navigator.standalone) {
      if (sheetBtn) sheetBtn.hidden = false;
      const n = MiaStore.read('pwa.iosHintShown') || 0;
      if (room() === 'home' && eligible() && n < 2) { MiaStore.set('pwa.iosHintShown', n + 1); card('ios'); }
    }
  });
}
