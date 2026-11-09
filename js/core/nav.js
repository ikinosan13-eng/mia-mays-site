// переходы: CSS @view-transition делает кроссфейд; здесь только типы forward/back и страховка для bfcache
addEventListener('pageswap', e => { try { if (e.viewTransition && e.activation) e.viewTransition.types.add(e.activation.navigationType === 'traverse' ? 'back' : 'forward'); } catch {} });
addEventListener('pagereveal', e => { try { if (e.viewTransition && window.navigation && navigation.activation) e.viewTransition.types.add(navigation.activation.navigationType === 'traverse' ? 'back' : 'forward'); } catch {} });
addEventListener('pageshow', e => { if (e.persisted) { document.querySelectorAll('.box-fly,.pop-heart').forEach(n => n.remove()); dispatchEvent(new Event('mia:restored')); } });
