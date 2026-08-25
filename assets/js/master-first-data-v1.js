(() => {
  const nativeFetch = window.fetch.bind(window);
  const MASTER_PATH = '/api/master';
  const CALENDAR_PATH = '/assets/data/mexico-calendar.json';
  const OCCASIONS_PATH = '/assets/data/travel-occasions.json';
  let masterPromise = null;

  function pathnameOf(input) {
    try {
      const value = typeof input === 'string' ? input : input && input.url;
      if (!value) return '';
      return new URL(value, window.location.origin).pathname;
    } catch (_) {
      return '';
    }
  }

  function jsonResponse(payload, source = 'master') {
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Trhoncal-Data-Source': source
      }
    });
  }

  async function loadMaster() {
    if (!masterPromise) {
      masterPromise = nativeFetch(MASTER_PATH, { cache: 'no-store' })
        .then(async response => {
          if (!response.ok) throw new Error(`master-${response.status}`);
          const payload = await response.json();
          if (!payload || typeof payload !== 'object') throw new Error('master-invalid');
          return payload;
        })
        .catch(error => {
          masterPromise = null;
          throw error;
        });
    }
    return masterPromise;
  }

  window.TrhoncalMasterData = {
    load: loadMaster,
    nativeFetch,
    source: 'master-first-with-local-fallback'
  };

  window.fetch = async function trhoncalMasterFirstFetch(input, init = {}) {
    const method = String(init.method || (input && input.method) || 'GET').toUpperCase();
    const path = pathnameOf(input);
    if (method !== 'GET' || (path !== CALENDAR_PATH && path !== OCCASIONS_PATH)) {
      return nativeFetch(input, init);
    }

    try {
      const master = await loadMaster();
      if (path === CALENDAR_PATH && master.calendar && Array.isArray(master.calendar.events) && master.calendar.events.length) {
        return jsonResponse(master.calendar);
      }
      if (path === OCCASIONS_PATH && Array.isArray(master.occasions) && master.occasions.length) {
        return jsonResponse({ occasions: master.occasions });
      }
    } catch (error) {
      console.warn('Trhoncal Master no disponible; usando respaldo local.', error);
    }

    return nativeFetch(input, init);
  };
})();
