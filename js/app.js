// точка входа: ядро + код текущей комнаты
import './core/prefs.js';
import './core/nav.js';
import './core/fx.js';
import { initShell } from './core/shell.js';
import { initSwitch } from './core/switch.js';
import { syncBoxButtons } from './core/box.js';
import { initEggs } from './core/eggs.js';
import { recordVisit } from './life/visits.js';
const ROOMS = ['home', 'diary', 'album', 'play', 'living', 'box', 'intro'];
initShell(); initSwitch(); syncBoxButtons(); initEggs();
recordVisit();
// PWA не на критическом пути: модуль грузим после load; ранний beforeinstallprompt сохраняем до его прихода
addEventListener('beforeinstallprompt', e => { e.preventDefault(); window.__miaBip = e; }, { once: true });
const pwa = () => import('./core/pwa.js').then(m => m.initPWA()).catch(e => console.error(e));
if (document.readyState === 'complete') pwa(); else addEventListener('load', pwa, { once: true });
const r = document.body.dataset.room;
if (ROOMS.includes(r)) import(`./rooms/${r}.js`).then(m => m.default && m.default()).catch(e => console.error(e));
