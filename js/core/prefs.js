import { MiaStore } from './store.js';
import { daypart } from './dom.js';
const d = document.documentElement;
const mq = matchMedia('(prefers-reduced-motion: reduce)'), dark = matchMedia('(prefers-color-scheme: dark)');
export { daypart };
export function applyPrefs() {
  const p = MiaStore.read('prefs') || {};
  const dp = daypart();
  const light = p.light || 'auto';
  // «Как за окном»: ночь по часам или если система в тёмной теме
  const night = light === 'night' || (light !== 'day' && (dp === 'night' || dark.matches));
  d.dataset.daypart = dp; d.dataset.light = light;
  d.classList.toggle('night', night);
  if (p.motion === 'reduce' || mq.matches) d.dataset.motion = 'reduce'; else delete d.dataset.motion;
  const lite = d.dataset.motion === 'reduce' || matchMedia('(max-width:700px)').matches || !!(navigator.connection && navigator.connection.saveData) || (navigator.deviceMemory && navigator.deviceMemory <= 4);
  d.classList.toggle('lite', !!lite);
  document.querySelectorAll('meta[name=theme-color]').forEach(m => { m.content = night ? '#1E1A2C' : '#FBF6EF'; });
  return { night, dp, light };
}
applyPrefs();
MiaStore.on('prefs', applyPrefs);
mq.addEventListener?.('change', applyPrefs); dark.addEventListener?.('change', applyPrefs);
let hiddenAt = 0;
document.addEventListener('visibilitychange', () => {
  d.classList.toggle('tab-hidden', document.hidden);
  if (document.hidden) hiddenAt = Date.now(); else if (Date.now() - hiddenAt > 30 * 60e3) applyPrefs();
});
