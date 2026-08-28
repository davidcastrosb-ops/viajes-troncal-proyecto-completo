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
