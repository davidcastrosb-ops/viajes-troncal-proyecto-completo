(() => {
  // Home: carga la experiencia "Cuándo viajar" sin acoplarla al núcleo del sitio.
  if (!document.querySelector('link[href="/assets/css/when-to-travel-v1.css"]')) {
    const css=document.createElement('link');
    css.rel='stylesheet';
    css.href='/assets/css/when-to-travel-v1.css';
    document.head.appendChild(css);
  }
  if (!document.querySelector('script[src="/assets/js/when-to-travel-v1.js"]')) {
    const script=document.createElement('script');
    script.src='/assets/js/when-to-travel-v1.js';
    script.defer=true;
    document.head.appendChild(script);
  }

  const cleanDestinationRoute = /^\/mexico\/[^/]+\/?$/.test(window.location.pathname);
  if (!cleanDestinationRoute) return;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const moveToTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  moveToTop();
  requestAnimationFrame(moveToTop);
  window.addEventListener('pageshow', moveToTop, { once: true });
})();
