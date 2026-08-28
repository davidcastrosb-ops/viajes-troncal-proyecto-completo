(() => {
  if (window.__trhoncalModalA11yV1) return;
  window.__trhoncalModalA11yV1 = true;

  const SELECTOR = '#quoteModal';
  const FOCUSABLE = [
    'a[href]:not([tabindex="-1"])',
    'button:not([disabled]):not([tabindex="-1"])',
    'input:not([disabled]):not([type="hidden"]):not([tabindex="-1"])',
    'select:not([disabled]):not([tabindex="-1"])',
    'textarea:not([disabled]):not([tabindex="-1"])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  function ensureModalFixStyles(){
    if(document.getElementById('trhoncal-modal-fix-styles')) return;
    const style=document.createElement('style');
    style.id='trhoncal-modal-fix-styles';
    style.textContent='.quote-modal-destination[hidden]{display:none!important}';
    document.head.appendChild(style);
  }

  function loadHelper(src,dataKey,globalKey){
    if(document.querySelector(`script[${dataKey}]`) || window[globalKey]) return;
    const script=document.createElement('script');
    script.src=src;
    script.defer=true;
    script.setAttribute(dataKey,'');
    document.head.appendChild(script);
  }

  function modal(){ return document.querySelector(SELECTOR); }

  function visibleFocusable(root){
    return Array.from(root.querySelectorAll(FOCUSABLE)).filter(el => {
      if (el.hidden) return false;
      const style = getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
  }

  function sync(root){
    if (!root) return;
    const isOpen = !root.hidden;
    const desiredAriaHidden = isOpen ? 'false' : 'true';
    if (root.getAttribute('aria-hidden') !== desiredAriaHidden) {
      root.setAttribute('aria-hidden', desiredAriaHidden);
    }

    const panel = root.querySelector('.quote-modal-panel');
    if (panel && !panel.hasAttribute('tabindex')) panel.setAttribute('tabindex', '-1');
    if (!isOpen || root.contains(document.activeElement)) return;

    const items = visibleFocusable(root);
    (items[0] || panel)?.focus({ preventScroll: true });
  }

  function init(){
    ensureModalFixStyles();
    loadHelper('/assets/js/calendar-sources-v1.js','data-calendar-sources-v1','__trhoncalCalendarSourcesV1');
    loadHelper('/assets/js/calendar-guard-v1.js','data-calendar-guard-v1','__trhoncalCalendarGuardV1');

    const root = modal();
    if (!root) return;
    sync(root);

    // Only the hidden state needs observation. Observing aria-hidden while also writing it
    // created a feedback loop that could freeze the browser as soon as the modal opened.
    const observer = new MutationObserver(() => sync(root));
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['hidden']
    });
  }

  document.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const root = modal();
    if (!root || root.hidden) return;
    const items = visibleFocusable(root);
    if (!items.length) {
      event.preventDefault();
      root.querySelector('.quote-modal-panel')?.focus({ preventScroll: true });
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || !root.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }, true);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
