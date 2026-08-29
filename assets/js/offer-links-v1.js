(() => {
  if (window.__trhoncalOfferLinksV1) return;
  window.__trhoncalOfferLinksV1 = true;

  let decorating = false;
  let offerMap = new Map();

  function ensureStyles() {
    if (document.querySelector('link[data-offer-actions-v1]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/assets/css/offer-actions-v1.css';
    link.dataset.offerActionsV1 = '';
    document.head.appendChild(link);
  }

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

  function protectHotelBrand(node, hotel) {
    if (!node || !hotel) return;
    const card = node.closest('.promo-maker-card,.calendar-offer-mini,.travel-offer-card') || node.parentElement;
    if (!card) return;
    card.querySelectorAll('.promo-maker-hotel,.calendar-offer-mini-copy strong,.travel-offer-card h4,.promo-maker-card h3').forEach(el => {
      if ((el.textContent || '').includes(hotel)) {
        el.setAttribute('translate', 'no');
        el.classList.add('notranslate');
      }
    });
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

        const hotel = String(offerMap.get(id)?.hotel || '').trim();
        if (hotel) protectHotelBrand(node, hotel);
      });
    } finally {
      decorating = false;
    }
  }

  async function loadHotels() {
    try {
      const response = await fetch('/api/master', { cache: 'no-store' });
      if (!response.ok) return;
      const master = await response.json();
      offerMap = new Map((master.offers || []).map(offer => [String(offer.id || '').trim(), offer]));
    } catch (_) {}
  }

  async function init() {
    ensureStyles();
    await loadHotels();
    decorate();
    const observer = new MutationObserver(() => requestAnimationFrame(decorate));
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
