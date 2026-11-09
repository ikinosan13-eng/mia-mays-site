// точка входа: ядро + код текущей комнаты
import './core/prefs.js?v=16';
import './core/nav.js?v=16';
import './core/fx.js?v=16';
import { initShell } from './core/shell.js?v=16';
import { initSwitch } from './core/switch.js?v=16';
import { syncBoxButtons } from './core/box.js?v=16';
import { initEggs } from './core/eggs.js?v=16';
import { recordVisit } from './life/visits.js?v=16';
const ROOMS = ['home', 'diary', 'album', 'play', 'living', 'box', 'intro', 'lost'];
initShell(); initSwitch(); syncBoxButtons(); initEggs();
recordVisit();
// PWA не на критическом пути: модуль грузим после load; ранний beforeinstallprompt сохраняем до его прихода
addEventListener('beforeinstallprompt', e => { e.preventDefault(); window.__miaBip = e; }, { once: true });
const pwa = () => import('./core/pwa.js?v=16').then(m => m.initPWA()).catch(e => console.error(e));
if (document.readyState === 'complete' || /[?&]nosw=1/.test(location.search)) pwa(); else addEventListener('load', pwa, { once: true });
const r = document.body.dataset.room;
if (ROOMS.includes(r)) import(`./rooms/${r}.js?v=16`).then(m => m.default && m.default()).catch(e => console.error(e));
