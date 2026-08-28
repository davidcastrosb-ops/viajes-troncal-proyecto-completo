(() => {
  if (window.__trhoncalOfferLinksV1) return;
  window.__trhoncalOfferLinksV1 = true;

  let decorating = false;

  function shareHref(id) {
    return `/oferta/${encodeURIComponent(String(id || '').trim())}`;
  }

  function addShare(container, id) {
    if (!container || !id || container.querySelector('[data-offer-share]')) return;
    const a = document.createElement('a');
    a.href = shareHref(id);
    a.dataset.offerShare = id;
    a.textContent = 'Compartir promoción';
    a.setAttribute('aria-label', 'Compartir esta promoción de Trhoncal Travel');

    if (container.classList.contains('promo-maker-actions')) {
      a.className = 'promo-maker-secondary offer-share-pill';
    } else if (container.classList.contains('travel-offer-actions')) {
      a.className = 'btn btn-soft offer-share-pill';
    } else {
      a.className = 'offer-share-link offer-share-pill';
    }

    container.appendChild(a);
  }

  function decorate() {
    if (decorating) return;
    decorating = true;
    try {
      document.querySelectorAll('[data-offer]').forEach(node => {
        const id = String(node.dataset.offer || '').trim();
        if (!id) return;

        if (node.tagName === 'A' && /ver promoción/i.test(node.textContent || '')) {
          node.href = shareHref(id);
          node.textContent = 'Ver promoción →';
          node.removeAttribute('target');
          node.removeAttribute('rel');
        }

        const container = node.closest('.promo-maker-actions,.calendar-offer-mini-actions,.travel-offer-actions');
        if (container) addShare(container, id);
      });
    } finally {
      decorating = false;
    }
  }

  function init() {
    decorate();
    const observer = new MutationObserver(() => requestAnimationFrame(decorate));
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
