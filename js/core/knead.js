// «Мия месит лапками…» — индикатор только на время реального ожидания: появляется через 150 мс, удаляется по завершении
const PAWS = '<svg class="knead-paws" viewBox="0 0 40 20" aria-hidden="true"><g><ellipse cx="10" cy="12" rx="7" ry="6"/><circle cx="5" cy="4.5" r="2"/><circle cx="10" cy="3" r="2"/><circle cx="15" cy="4.5" r="2"/></g><g><ellipse cx="30" cy="12" rx="7" ry="6"/><circle cx="25" cy="4.5" r="2"/><circle cx="30" cy="3" r="2"/><circle cx="35" cy="4.5" r="2"/></g></svg>';
export function knead(host, text = 'Мия месит лапками…') {
  if (!host) return () => {};
  let el = null; host.setAttribute('aria-busy', 'true');
  const t = setTimeout(() => { el = document.createElement('span'); el.className = 'knead'; if (!host.closest('[role=status],[aria-live]')) el.setAttribute('role', 'status'); el.innerHTML = `${PAWS}<span>${text}</span>`; host.append(el); }, 150);
  return () => { clearTimeout(t); host.removeAttribute('aria-busy'); if (el) el.remove(); };
}
export const kneading = async (host, work) => { const done = knead(host); try { return await work(); } finally { done(); } };
