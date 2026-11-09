// recordVisit() — один раз на визит: новый визит = прошло > 30 мин с visits.last или наступила новая дата.
// Только когда страница реально показана (не prerender). days не убывает при переводе часов назад.
import { MiaStore } from '../core/store.js';
import { whenActive, dayKey } from '../core/dom.js';
const GAP = 30 * 60 * 1000;
export function recordVisit(now = Date.now()) {
  whenActive(() => MiaStore.update(s => {
    const v = s.visits, today = dayKey(new Date(now)), newDay = !v.lastDay || today > v.lastDay;
    if (v.last && now - v.last < GAP && !newDay && now >= v.last) { v.last = now; return; } // тот же визит
    v.count += 1; v.prev = v.last; v.last = now; v.first ||= now;
    if (newDay) {
      v.days += 1; v.lastDay = today;
      const weekAgo = dayKey(new Date(now - 6 * 864e5));
      v.week = [...new Set([...(v.week || []), today])].filter(d => d >= weekAgo).sort();
    }
  }));
}
