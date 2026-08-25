(() => {
  const cleanDestinationRoute = /^\/mexico\/[^/]+\/?$/.test(window.location.pathname);
  if (!cleanDestinationRoute) return;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const moveToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  moveToTop();
  requestAnimationFrame(moveToTop);
  window.addEventListener('pageshow', moveToTop, { once: true });
})();
