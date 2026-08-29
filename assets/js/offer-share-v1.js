(() => {
  const card = document.querySelector('.offer-actions-card');
  if (!card) return;

  // El proveedor queda como fuente operativa interna. La experiencia pública compartible
  // permanece bajo el dominio y la marca de Trhoncal Travel.
  document.querySelectorAll('a[href*="travelpromomaker.com"],a[href*="priceagencies.com"]').forEach(link => {
    const wrapper = link.closest('.offer-final-actions');
    link.remove();
    if (wrapper && !wrapper.children.length) wrapper.remove();
  });

  // El ID de oferta conserva la trazabilidad; no exponemos la URL del proveedor
  // dentro de la barra del navegador al pasar a la cotización Trhoncal.
  document.querySelectorAll('a[href*="travelQuote=1"]').forEach(link => {
    try {
      const u = new URL(link.href, location.origin);
      u.searchParams.delete('promo');
      link.href = `${u.pathname}${u.search}${u.hash}`;
    } catch (_) {}
  });

  function offerIdFromPath() {
    const match = location.pathname.match(/\/oferta\/([^/.?#]+)/i);
    return match ? decodeURIComponent(match[1]) : '';
  }

  function protectBrand(element) {
    if (!element) return;
    element.setAttribute('translate', 'no');
    element.classList.add('notranslate');
  }

  async function hydrateHotelBrand() {
    const offerId = offerIdFromPath();
    if (!offerId) return;
    try {
      const response = await fetch('/api/master', { cache: 'no-store' });
      if (!response.ok) return;
      const master = await response.json();
      const offer = (master.offers || []).find(item => item && item.id === offerId);
      const hotel = String(offer?.hotel || '').trim();
      if (!hotel) return;

      const heading = document.querySelector('.offer-copy h1');
      if (heading && heading.textContent.includes(hotel)) protectBrand(heading);

      if (!document.querySelector('.offer-hotel-brand')) {
        const line = document.createElement('p');
        line.className = 'offer-hotel-brand';
        line.style.margin = '-6px 0 14px';
        line.style.fontSize = '18px';
        line.style.fontWeight = '800';
        line.style.color = '#8a611b';
        const label = document.createElement('span');
        label.textContent = 'Hotel: ';
        const strong = document.createElement('strong');
        strong.textContent = hotel;
        protectBrand(strong);
        line.append(label, strong);
        heading?.insertAdjacentElement('afterend', line);
      }

      const dl = document.querySelector('.offer-detail-card dl');
      if (dl && !dl.querySelector('[data-hotel-brand]')) {
        const row = document.createElement('div');
        row.dataset.hotelBrand = '1';
        const dt = document.createElement('dt');
        dt.textContent = 'Hotel';
        const dd = document.createElement('dd');
        dd.textContent = hotel;
        protectBrand(dd);
        row.append(dt, dd);
        dl.prepend(row);
      }
    } catch (_) {}
  }

  hydrateHotelBrand();

  const title = card.dataset.shareTitle || document.title;
  const text = card.dataset.shareText || 'Mira esta opción de viaje de Trhoncal Travel.';
  const url = card.dataset.shareUrl || location.href;
  const status = card.querySelector('[data-copy-status]');

  function say(message) {
    if (!status) return;
    status.textContent = message;
    clearTimeout(say.timer);
    say.timer = setTimeout(() => { status.textContent = ''; }, 3200);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      say('Enlace copiado. Ya puedes pegarlo en WhatsApp, correo o mensajes.');
    } catch (_) {
      const input = document.createElement('textarea');
      input.value = url;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
      say('Enlace copiado.');
    }
  }

  card.querySelector('[data-copy-link]')?.addEventListener('click', copyLink);

  card.querySelector('[data-native-share]')?.addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        if (error && error.name === 'AbortError') return;
      }
    }
    await copyLink();
  });
})();
