// Перенос старых ключей localStorage в mia:v1 (один раз, когда mia:v1 ещё нет). Старые ключи НЕ удаляются до ?v=15.
export const LEGACY = ['mia-cart-v1', 'mia-night', 'mia-sound', 'mia-rsvp-v2', 'mia-best', 'mia-purr', 'mia-tab', 'mia-wall', 'mia-mood'];
// каталог известных вещей: заполняем миниатюру и файл, если в старом списке их не было
export const CATALOG = {
  'wp-1': { kind: 'wallpaper', title: 'Обои «Уютный вечер»', href: 'img/mia-pillow.jpg', thumb: 'img/mia-pillow-320.webp' },
  'wp-2': { kind: 'wallpaper', title: 'Обои «Время подушек»', href: 'img/mia-pajama-pillow.jpg', thumb: 'img/mia-pajama-pillow-320.webp' },
  'wp-3': { kind: 'wallpaper', title: 'Обои «Ещё пять минут»', href: 'img/mia-pajama-crop.jpg', thumb: 'img/mia-pajama-crop-320.webp' },
  'st-1': { kind: 'sticker', title: 'Стикер · дуется', href: 'img/face-pillow.png', thumb: 'img/face-pillow-256.webp' },
  'st-2': { kind: 'sticker', title: 'Стикер · улыбка', href: 'img/face-pajama2.png', thumb: 'img/face-pajama2-256.webp' },
  'st-3': { kind: 'sticker', title: 'Стикер · думает', href: 'img/face-pajama.png', thumb: 'img/face-pajama-256.webp' }
};
// фаза 0 файлы не переименовывала (jpg/png оставлены как оригиналы для скачивания)
const ASSET_RENAMES = {};
const raw = k => { try { return localStorage.getItem(k); } catch { return null; } };
const json = v => { try { return JSON.parse(v); } catch { return undefined; } };

export function migrateLegacy(s) {
  const found = LEGACY.filter(k => raw(k) !== null);
  if (!found.length) return s;
  const now = Date.now();
  s.migratedFrom = found;
  s.guest.enteredAt = s.guest.enteredAt || now;
  const cart = json(raw('mia-cart-v1'));
  if (Array.isArray(cart)) {
    const seen = new Set(), wants = [];
    for (const it of cart) {
      if (!it || !it.id || seen.has(it.id)) continue; seen.add(it.id);
      const c = CATALOG[it.id] || {};
      if (it.type === 'interest' || /^soon-/.test(it.id)) { wants.push(String(it.title || it.id).replace(/^soon-/, '')); continue; } // старые «скоро» → одна запись Лавки
      const kind = it.type === 'interest' ? 'lavka' : (c.kind || (/^wp-/.test(it.id) ? 'wallpaper' : /^st-/.test(it.id) ? 'sticker' : 'souvenir'));
      const href = it.href ? (ASSET_RENAMES[it.href] || it.href) : (c.href || '');
      s.box.push({ id: String(it.id), kind, title: String(it.title || c.title || 'Без названия').slice(0, 80), href: kind === 'lavka' ? '' : href, thumb: c.thumb || '', at: now });
    }
    if (wants.length) s.box.push({ id: 'lavka-news', kind: 'lavka', title: `Лавка: сказать, когда откроется · ${wants.join(', ')}`.slice(0, 80), href: '', thumb: '', at: now });
    s.box = s.box.slice(0, 60);
  }
  const night = raw('mia-night');
  s.prefs.light = night === '1' ? 'night' : night === '0' ? 'day' : 'auto';
  if (raw('mia-sound') !== null) s.prefs.sound = raw('mia-sound') === 'on';
  const r = json(raw('mia-rsvp-v2'));
  if (r && r.n) { s.rsvp = { name: String(r.n).slice(0, 24), bring: String(r.b || ''), week: null, at: null }; s.guest.name ||= s.rsvp.name; }
  s.games.heartsBest = +raw('mia-best') || 0;
  s.games.purrs = +raw('mia-purr') || 0;
  const tab = raw('mia-tab');
  if (tab === 'tb-games') s.play.shelf = 'play'; else if (/^tb-(ava|make|try)$/.test(tab || '')) s.play.shelf = 'workshop';
  const w = json(raw('mia-wall'));
  if (Array.isArray(w)) {
    s.wall = w.filter(x => x && x.m).slice(-30).map(x => ({ n: String(x.n || '').slice(0, 24), m: String(x.m).slice(0, 140), at: null }));
    const last = [...w].reverse().find(x => x && x.n); if (last) s.guest.name ||= String(last.n).slice(0, 24);
  }
  // mia-mood не переносим: смысл сменился
  return s;
}
