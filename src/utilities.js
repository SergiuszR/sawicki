export function initUtilities() {
  // Copy Email
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    const container = btn.closest('.w-col, .w-row, .w-container, section') || btn.parentElement;
    const mailto = btn.closest('a[href^="mailto:"]') || btn.querySelector('a[href^="mailto:"]') || container?.querySelector('a[href^="mailto:"]');
    if (mailto) {
      const email = mailto.href.replace('mailto:', '').split('?')[0];
      navigator.clipboard?.writeText(email);
    }
  });
}
