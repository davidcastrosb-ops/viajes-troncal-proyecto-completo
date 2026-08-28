(() => {
  if (window.__trhoncalOfferLinksV1) return;
  window.__trhoncalOfferLinksV1 = true;

  const MASTER_URL = '/api/master';
  let offerMap = new Map();
  let decorating = false;

  const safeUrl = value => {
    try {
      const u = new URL(String(value || ''), location.origin);
      return /^https?:$/.test(u.protocol) ? u.toString() : '';
    } catch (_) {
      return '';
    }
  };

  function bestProviderLink(offer) {
    return safeUrl(offer?.leadFormUrl || offer?.sharePromoUrl || offer?.publicPromoUrl || '');
  }

  function shareHref(id) {
    return `/oferta/${encodeURIComponent(id)}`;
  }

  function addShare(container, id) {
    if (!container || !id || container.querySelector('[data-offer-share]')) return;
    const a = document.createElement('a');
    a.href = shareHref(id);
    a.dataset.offerShare = id;
    a.textContent = 'Compartir ↗';

    if (container.classList.contains('promo-maker-actions')) a.className = 'promo-maker-secondary';
    else if (container.classList.contains('travel-offer-actions')) a.className = 'btn btn-soft';
    else a.className = 'offer-share-link';

    container.appendChild(a);
  }

  function decorate() {
    if (decorating || !offerMap.size) return;
    decorating = true;
    try {
      document.querySelectorAll('[data-offer]').forEach(node => {
        const id = node.dataset.offer;
        const offer = offerMap.get(id);
        if (!offer) return;

        if (node.tagName === 'A' && /ver promoción/i.test(node.textContent || '')) {
          const target = bestProviderLink(offer);
          if (target) node.href = target;
        }

        const container = node.closest('.promo-maker-actions,.calendar-offer-mini-actions,.travel-offer-actions');
        if (container) addShare(container, id);
      });
    } finally {
      decorating = false;
    }
  }

  async function init() {
    try {
      const response = await fetch(MASTER_URL, { cache: 'no-store' });
      if (!response.ok) return;
      const master = await response.json();
      offerMap = new Map((master.offers || []).map(o => [o.id, o]));
      decorate();
      const observer = new MutationObserver(() => requestAnimationFrame(decorate));
      observer.observe(document.body, { childList: true, subtree: true });
    } catch (_) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
