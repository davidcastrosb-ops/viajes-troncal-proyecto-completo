(() => {
  // Home: carga la experiencia "Cuándo viajar" sin duplicar assets con hero-v4.js.
  if (!document.querySelector('link[data-when-travel-v1],link[href="/assets/css/when-to-travel-v1.css"]')) {
    const css=document.createElement('link');
    css.rel='stylesheet';
    css.href='/assets/css/when-to-travel-v1.css';
    css.dataset.whenTravelV1='';
    document.head.appendChild(css);
  } else {
    const existingCss=document.querySelector('link[href="/assets/css/when-to-travel-v1.css"]');
    if(existingCss&&!existingCss.hasAttribute('data-when-travel-v1')) existingCss.dataset.whenTravelV1='';
  }

  if (!document.querySelector('script[data-when-travel-v1],script[src="/assets/js/when-to-travel-v1.js"]')) {
    const script=document.createElement('script');
    script.src='/assets/js/when-to-travel-v1.js';
    script.defer=true;
    script.dataset.whenTravelV1='';
    document.head.appendChild(script);
  } else {
    const existingScript=document.querySelector('script[src="/assets/js/when-to-travel-v1.js"]');
    if(existingScript&&!existingScript.hasAttribute('data-when-travel-v1')) existingScript.dataset.whenTravelV1='';
  }

  // Todas las tarjetas de ofertas comparten la misma regla: proveedor para "Ver promoción"
  // y página Trhoncal propia para compartir/descargar PDF.
  if (!document.querySelector('script[src="/assets/js/offer-links-v1.js"]')) {
    const shareScript=document.createElement('script');
    shareScript.src='/assets/js/offer-links-v1.js';
    shareScript.defer=true;
    document.head.appendChild(shareScript);
  }

  const cleanDestinationRoute = /^\/mexico\/[^/]+\/?$/.test(window.location.pathname);
  if (!cleanDestinationRoute) return;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const moveToTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  moveToTop();
  requestAnimationFrame(moveToTop);
  window.addEventListener('pageshow', moveToTop, { once: true });
})();
