// MiaStore — единое состояние гостя в localStorage['mia:v1'].
import { migrateLegacy, LEGACY } from './migrate.js';
const KEY = 'mia:v1';
const seed = () => Math.random().toString(36).slice(2, 8).padEnd(6, '0');
export const defaults = () => ({
  v: 1, createdAt: Date.now(), migratedFrom: [],
  guest: { name: '', seed: seed(), enteredAt: null },
  prefs: { light: 'auto', sound: false, motion: 'auto', music: false },
  box: [], rsvp: null,
  checkin: { last: null, log: [] },
  games: { heartsBest: 0, purrs: 0, blinks: 0 },
  play: { shelf: 'play' },
  wall: [],
  visits: { count: 0, days: 0, first: null, last: null, prev: null, lastDay: null, week: [] },
  gifts: { lastDay: null, got: [] },
  seen: { updates: 0, hints: [], recent: [], greetVisit: 0 },
  pwa: { installed: false, promptDismissedAt: null, iosHintShown: 0 }
});
const isObj = x => x && typeof x === 'object' && !Array.isArray(x);
const merge = (d, s) => { if (!isObj(s)) return d; for (const k of Object.keys(s)) d[k] = isObj(d[k]) && isObj(s[k]) ? merge(d[k], s[k]) : s[k]; return d; };
const clone = x => JSON.parse(JSON.stringify(x));

let mem = false, state, dirty = false, frozen = false, memWarned = false;
const subs = {};
const ls = (() => { try { const t = '__mia'; localStorage.setItem(t, t); localStorage.removeItem(t); return localStorage; } catch { mem = true; return null; } })();

function read() {
  if (!ls) return defaults();
  let rawv = null; try { rawv = ls.getItem(KEY); } catch { mem = true; }
  if (rawv == null) { const s = migrateLegacy(defaults()); dirty = true; return s; }
  try { const p = JSON.parse(rawv); if (!isObj(p) || p.v !== 1) throw 0; return merge(defaults(), p); }
  catch { try { ls.setItem(KEY + ':broken', rawv); } catch {} dirty = true; return defaults(); }
}
function flush() {
  if (!dirty || frozen) return; dirty = false;
  if (!ls) return;
  try { ls.setItem(KEY, JSON.stringify(state)); } catch { mem = true; }
}
let queued = false;
const schedule = () => { dirty = true; if (!queued) { queued = true; queueMicrotask(() => { queued = false; flush(); }); } };
const emit = (before, after) => { for (const k of Object.keys(subs)) if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) subs[k].forEach(fn => { try { fn(clone(after[k]), after); } catch (e) { console.error(e); } }); };
const path = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);

state = read();
if (dirty) schedule();

export const MiaStore = {
  get: () => clone(state),
  read: p => clone(path(state, p) ?? null),
  set(p, v) { this.update(s => { const ks = p.split('.'), last = ks.pop(); const o = ks.reduce((a, k) => (a[k] ??= {}), s); o[last] = v; }); },
  update(fn) { const before = clone(state); fn(state); schedule(); emit(before, state); },
  on(key, fn) { (subs[key] ||= []).push(fn); return () => { subs[key] = subs[key].filter(f => f !== fn); }; },
  reset() {
    frozen = true;
    if (ls) { try { [KEY, KEY + ':broken', ...LEGACY].forEach(k => ls.removeItem(k)); } catch {} }
    try { sessionStorage.removeItem('mia-intro'); } catch {}
    const before = state; state = defaults(); emit(before, state);
  },
  // «ключ от дома»: полная замена состояния из файла. Проверка v===1, типы веток как в defaults; иначе — false и ничего не меняем
  replace(obj) {
    if (!isObj(obj) || obj.v !== 1) return false;
    const d = defaults(), clean = {};
    for (const k of Object.keys(d)) { if (!(k in obj)) continue; const a = d[k], b = obj[k];
      if (Array.isArray(a) ? Array.isArray(b) : isObj(a) ? isObj(b) : (a === null || b === null || typeof a === typeof b)) clean[k] = b; }
    if (!isObj(clean.guest) || !Array.isArray(clean.box || [])) return false;
    const next = merge(d, clone(clean));
    next.box = next.box.filter(x => isObj(x) && x.id).slice(0, 60); next.guest.name = String(next.guest.name || '').slice(0, 24);
    const before = state; state = next; dirty = true; flush(); emit(before, state); return true;
  },
  get memoryOnly() { return mem; },
  get memWarned() { return memWarned; }, set memWarned(v) { memWarned = v; }
};
addEventListener('storage', e => {
  if (e.key !== KEY || frozen) return;
  const before = state;
  try { state = e.newValue ? merge(defaults(), JSON.parse(e.newValue)) : defaults(); } catch { return; }
  emit(before, state);
});
