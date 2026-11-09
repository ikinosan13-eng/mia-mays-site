// точка входа: ядро + код текущей комнаты
import './core/prefs.js';
import './core/nav.js';
import './core/fx.js';
import { initShell } from './core/shell.js';
import { initSwitch } from './core/switch.js';
import { syncBoxButtons } from './core/box.js';
import { initReveal } from './core/reveal.js';
import { initEggs } from './core/eggs.js';
const ROOMS = ['home', 'diary', 'album', 'play', 'living', 'box', 'intro'];
initShell(); initSwitch(); syncBoxButtons(); initReveal(); initEggs();
const r = document.body.dataset.room;
if (ROOMS.includes(r)) import(`./rooms/${r}.js`).then(m => m.default && m.default()).catch(e => console.error(e));
