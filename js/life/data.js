// data/*.json — только после idle (не на пути LCP), один fetch на файл за страницу; ошибка → значение по умолчанию
import { idle } from '../core/dom.js';
const cache = {};
const DEF = { mia: { birthday: null, fridayHour: 20, poses: {} }, gifts: [], updates: [], notes: [] };
export const data = name => cache[name] ||= new Promise(res => idle(() => fetch(`data/${name}.json`).then(r => r.ok ? r.json() : DEF[name]).then(res, () => res(DEF[name]))));
