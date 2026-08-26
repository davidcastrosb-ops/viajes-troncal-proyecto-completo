(() => {
  if (window.__trhoncalQuoteContextV1) return;
  window.__trhoncalQuoteContextV1 = true;

  const state = {
    destination: '',
    start: '',
    end: '',
    occasionId: '',
    offerId: '',
    promoUrl: '',
    ctaOrigin: ''
  };

  function clean(value = '', max = 500) {
    return String(value == null ? '' : value).trim().slice(0, max);
  }

  function readQuery() {
    const p = new URLSearchParams(location.search);
    return {
      destination: clean(p.get('destino'), 140),
      start: clean(p.get('salida'), 20),
      end: clean(p.get('regreso'), 20),
      occasionId: clean(p.get('ocasion'), 120),
      offerId: clean(p.get('oferta'), 120),
      promoUrl: clean(p.get('promo'), 500),
      ctaOrigin: clean(p.get('cta'), 120)
    };
  }

  function mergeContext(next = {}) {
    Object.keys(state).forEach(key => {
      const value = clean(next[key], key === 'promoUrl' ? 500 : 160);
      if (value) state[key] = value;
    });
  }

  function contextFromElement(el) {
    if (!el) return {};
    return {
      destination: el.dataset.destination || '',
      start: el.dataset.start || '',
      end: el.dataset.end || '',
      occasionId: el.dataset.occasion || el.dataset.occasionId || '',
      offerId: el.dataset.offer || el.dataset.offerId || '',
      promoUrl: el.dataset.promoUrl || '',
      ctaOrigin: el.dataset.ctaOrigen || el.dataset.ctaOrigin || ''
    };
  }

  function setDateField(name, value) {
    if (!value) return;
    const form = document.getElementById('travelQuoteForm');
    if (!form || !form.elements[name]) return;
    form.elements[name].value = value;
    const display = form.querySelector(`[data-date-display="${name}"]`);
    if (display) {
      const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : null;
      display.textContent = d && !Number.isNaN(d.getTime())
        ? new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).format(d).replace('.', '')
        : value;
    }
    const trigger = form.querySelector(`[data-calendar-open="${name}"]`);
    if (trigger) trigger.classList.add('has-value');
  }

  function applyContextToForm() {
    const form = document.getElementById('travelQuoteForm');
    if (!form) return false;
    if (state.destination && form.elements.destino && !form.elements.destino.value) {
      form.elements.destino.value = state.destination;
    }
    setDateField('fechaSalida', state.start);
    setDateField('fechaRegreso', state.end);
    return true;
  }

  function inferCtaOrigin(el) {
    if (!el) return 'web';
    if (el.closest('.calendar-offer-mini')) return 'oferta_calendario';
    if (el.closest('.travel-offer-card')) return 'oferta_ocasion';
    if (el.closest('.promo-maker-card')) return 'oferta_home';
    if (el.closest('.travel-spotlight-card')) return 'oportunidad_destacada';
    if (el.closest('.travel-opportunity-card')) return 'calendario';
    if (el.closest('.detail-conversion')) return 'ficha_destino';
    if (el.closest('.hero-actions')) return 'hero';
    if (el.closest('.quote-cta-section')) return 'cta_final';
    if (el.closest('.nav')) return 'menu';
    return 'web';
  }

  function captureClick(event) {
    const el = event.target.closest('[data-quote-launch],.quote-link,[data-travel-quote],.calendar-offer-quote');
    if (!el) return;
    mergeContext(contextFromElement(el));
    if (!state.ctaOrigin) state.ctaOrigin = inferCtaOrigin(el);
    setTimeout(applyContextToForm, 40);
    setTimeout(applyContextToForm, 140);
  }

  function installLeadPatch() {
    if (window.__trhoncalQuoteContextFetchPatched) return;
    window.__trhoncalQuoteContextFetchPatched = true;
    const upstreamFetch = window.fetch.bind(window);
    window.fetch = async function(input, init = {}) {
      const url = typeof input === 'string' ? input : (input && input.url) || '';
      const method = String(init.method || (input && input.method) || 'GET').toUpperCase();
      if (method === 'POST' && /\/api\/lead(?:\?|$)/.test(url) && typeof init.body === 'string') {
        try {
          const body = JSON.parse(init.body);
          body.ocasionId = body.ocasionId || state.occasionId || '';
          body.ofertaId = body.ofertaId || state.offerId || '';
          body.promoUrl = body.promoUrl || state.promoUrl || '';
          body.ctaOrigen = body.ctaOrigen || state.ctaOrigin || '';
          init = { ...init, body: JSON.stringify(body) };
        } catch (_) {}
      }
      return upstreamFetch(input, init);
    };
  }

  function openIncomingQuote() {
    const p = new URLSearchParams(location.search);
    if (p.get('travelQuote') !== '1') return;
    mergeContext(readQuery());
    if (!state.ctaOrigin) state.ctaOrigin = 'cuando_viajar';

    const launch = () => {
      const trigger = document.querySelector('[data-quote-launch],.quote-link');
      if (!trigger) return false;
      if (state.destination) trigger.dataset.destination = state.destination;
      if (state.start) trigger.dataset.start = state.start;
      if (state.end) trigger.dataset.end = state.end;
      if (state.occasionId) trigger.dataset.occasion = state.occasionId;
      if (state.offerId) trigger.dataset.offer = state.offerId;
      if (state.promoUrl) trigger.dataset.promoUrl = state.promoUrl;
      trigger.dataset.ctaOrigen = state.ctaOrigin;
      trigger.click();
      setTimeout(applyContextToForm, 100);
      setTimeout(applyContextToForm, 220);
      history.replaceState({}, '', location.pathname + '#cotizar');
      return true;
    };

    if (!launch()) setTimeout(launch, 350);
  }

  document.addEventListener('click', captureClick, true);
  document.addEventListener('DOMContentLoaded', () => {
    mergeContext(readQuery());
    installLeadPatch();
    openIncomingQuote();
  });

  window.TrhoncalQuoteContext = {
    get: () => ({ ...state }),
    set: mergeContext,
    apply: applyContextToForm
  };
})();
