(() => {
  if (window.__trhoncalTrackingV1) return;
  window.__trhoncalTrackingV1 = true;

  const STORAGE_KEY = 'trhoncal_attribution_v1';
  const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;
  const PARAMS = {
    utm_source: 'utmSource',
    utm_medium: 'utmMedium',
    utm_campaign: 'utmCampaign',
    utm_content: 'utmContent',
    utm_term: 'utmTerm',
    gclid: 'gclid',
    fbclid: 'fbclid'
  };

  function nowISO(){ return new Date().toISOString(); }

  function safeRead(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const updated = Date.parse(parsed.updatedAt || '');
      if (!Number.isFinite(updated) || Date.now() - updated > MAX_AGE_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function safeWrite(value){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch (_) {}
  }

  function readCurrent(){
    const params = new URLSearchParams(location.search);
    const out = {};
    Object.entries(PARAMS).forEach(([queryKey, field]) => {
      const value = String(params.get(queryKey) || '').trim();
      if (value) out[field] = value.slice(0, 250);
    });
    return out;
  }

  function hasAttribution(obj){
    return Object.keys(PARAMS).some(key => !!obj[PARAMS[key]]);
  }

  function capture(){
    const current = readCurrent();
    const stored = safeRead() || {};
    if (!hasAttribution(current)) return stored;

    const touch = {
      ...current,
      landingPage: location.href,
      capturedAt: nowISO()
    };
    const next = {
      firstTouch: stored.firstTouch || touch,
      lastTouch: { ...(stored.lastTouch || {}), ...touch },
      updatedAt: nowISO()
    };
    safeWrite(next);
    return next;
  }

  let state = capture();

  function getAttribution(){
    state = safeRead() || state || {};
    const current = readCurrent();
    const last = { ...(state.lastTouch || {}), ...current };
    return {
      utmSource: last.utmSource || '',
      utmMedium: last.utmMedium || '',
      utmCampaign: last.utmCampaign || '',
      utmContent: last.utmContent || '',
      utmTerm: last.utmTerm || '',
      gclid: last.gclid || '',
      fbclid: last.fbclid || '',
      firstTouch: state.firstTouch || null,
      lastTouch: state.lastTouch || null
    };
  }

  function track(eventName, details = {}){
    const attribution = getAttribution();
    const payload = {
      event: String(eventName || 'interaction'),
      event_timestamp: nowISO(),
      page_location: location.href,
      page_path: location.pathname,
      page_title: document.title,
      utm_source: attribution.utmSource,
      utm_medium: attribution.utmMedium,
      utm_campaign: attribution.utmCampaign,
      utm_content: attribution.utmContent,
      utm_term: attribution.utmTerm,
      gclid: attribution.gclid,
      fbclid: attribution.fbclid,
      ...details
    };
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    try { window.dispatchEvent(new CustomEvent('trhoncal:track', { detail: payload })); } catch (_) {}
    return payload;
  }

  function patchLeadFetch(){
    if (window.__trhoncalFetchPatched) return;
    window.__trhoncalFetchPatched = true;
    const nativeFetch = window.fetch.bind(window);

    window.fetch = async function(input, init = {}){
      const url = typeof input === 'string' ? input : (input && input.url) || '';
      const method = String(init.method || (input && input.method) || 'GET').toUpperCase();
      let nextInit = init;
      let leadBody = null;

      if (method === 'POST' && /\/api\/lead(?:\?|$)/.test(url) && typeof init.body === 'string') {
        try {
          const body = JSON.parse(init.body);
          const attribution = getAttribution();
          body.utmSource = body.utmSource || attribution.utmSource || '';
          body.utmMedium = body.utmMedium || attribution.utmMedium || '';
          body.utmCampaign = body.utmCampaign || attribution.utmCampaign || '';
          leadBody = body;
          nextInit = { ...init, body: JSON.stringify(body) };
        } catch (_) {}
      }

      const response = await nativeFetch(input, nextInit);
      if (leadBody && response.ok) {
        response.clone().json().then(result => {
          if (result && result.ok === true) {
            track('submit_lead', {
              lead_id: result.leadId || '',
              destination: leadBody.destino || '',
              origin: leadBody.origen || '',
              occasion_id: leadBody.ocasionId || '',
              offer_id: leadBody.ofertaId || ''
            });
          }
        }).catch(() => {});
      }
      return response;
    };
  }

  function destinationFromLink(link){
    const match = String(link.getAttribute('href') || '').match(/\/mexico\/([^?#/]+)/i);
    return match ? decodeURIComponent(match[1]) : '';
  }

  document.addEventListener('click', event => {
    const target = event.target.closest('a,button');
    if (!target) return;
    const href = target.tagName === 'A' ? String(target.getAttribute('href') || '') : '';

    if (/wa\.me\//i.test(href)) {
      track('whatsapp_click', { link_url: href, link_text: String(target.textContent || '').trim().slice(0, 120) });
    }
    if (/travelpromomaker\.com/i.test(href)) {
      track('view_promo', {
        link_url: href,
        offer_id: target.dataset.offer || target.dataset.offerId || '',
        occasion_id: target.dataset.occasion || ''
      });
    }
    if (target.matches('[data-quote-launch],.quote-link,[data-travel-quote]')) {
      track('open_quote', {
        destination: target.dataset.destination || '',
        occasion_id: target.dataset.occasion || '',
        offer_id: target.dataset.offer || target.dataset.offerId || '',
        cta_text: String(target.textContent || '').trim().slice(0, 120)
      });
    }
    const destinationSlug = destinationFromLink(target);
    if (destinationSlug) track('destination_click', { destination_slug: destinationSlug });
  }, true);

  patchLeadFetch();
  window.TrhoncalTracking = { track, getAttribution, capture };

  const pageDetails = {};
  const destinationMatch = location.pathname.match(/^\/mexico\/([^/]+)\/?$/i);
  track('page_view', pageDetails);
  if (destinationMatch) track('view_destination', { destination_slug: decodeURIComponent(destinationMatch[1]) });
  if (/^\/cuando-viajar\/?$/i.test(location.pathname)) track('view_when_to_travel');
})();
