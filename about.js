(() => {
  'use strict';
  const openButton = document.getElementById('athar-about-open');
  const backdrop = document.getElementById('athar-about-backdrop');
  const dialog = document.getElementById('athar-about-dialog');
  const closeButtons = [document.getElementById('athar-about-close'), document.getElementById('athar-about-x')];
  if (!openButton || !backdrop || !dialog) return;
  let previousFocus = null;
  let closeTimer = null;
  const focusable = () => [...dialog.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),[tabindex]:not([tabindex="-1"])')];
  function openDialog() {
    if (!backdrop.hidden) return;
    previousFocus = document.activeElement;
    backdrop.hidden = false;
    requestAnimationFrame(() => { backdrop.classList.add('is-visible'); dialog.focus(); });
    document.addEventListener('keydown', onKeyDown);
  }
  function closeDialog() {
    if (backdrop.hidden) return;
    backdrop.classList.remove('is-visible');
    document.removeEventListener('keydown', onKeyDown);
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => { backdrop.hidden = true; if (previousFocus && previousFocus.focus) previousFocus.focus(); }, 230);
  }
  function onKeyDown(event) {
    if (event.key === 'Escape') { event.preventDefault(); closeDialog(); return; }
    if (event.key !== 'Tab') return;
    const items = focusable();
    if (!items.length) { event.preventDefault(); dialog.focus(); return; }
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  openButton.addEventListener('click', openDialog);
  closeButtons.forEach(button => button && button.addEventListener('click', closeDialog));
  backdrop.addEventListener('click', event => { if (event.target === backdrop) closeDialog(); });
})();
