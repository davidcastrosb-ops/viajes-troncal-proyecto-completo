const PUBLIC_HOST = 'viajes.trhoncalhomes.com.mx';
const MASTER_ENDPOINT = process.env.TRHONCAL_MASTER_ENDPOINT ||
  'https://script.google.com/macros/s/AKfycbxq6OxUnMWH004OKyspo7eAbI0GvJvwwDgSnfffSzn9amtKzOWqaDmtWUnrk52rz7U8/exec';

const VALID_STATUS = new Set(['verified', 'verified-initial', 'approved', 'published']);

const HOTEL_SLUG_BY_OFFER = {
  'OF-PA-PVR-REV26-001': 'friendly-fun-vallarta',
  'OF-PA-PVR-SEP26-002': 'barcelo-puerto-vallarta',
  'OF-PA-NAY-REV26-003': 'grand-decameron-bucerias'
};

const SEGMENT_FALLBACK = {
  'OF-PA-PVR-REV26-001': { segment: 'pareja', priority: 1, publicText: 'Opción calculada para 2 adultos.' },
  'OF-PA-PVR-SEP26-002': { segment: 'pareja', priority: 2, publicText: 'Opción calculada para 2 adultos.' },
  'OF-PA-NAY-REV26-003': { segment: 'pareja', priority: 1, publicText: 'Precio publicado por persona para una ocupación de 2 adultos.' }
};

const SEGMENTS = [
  {
    key: 'pareja',
    eyebrow: 'Viajar de a dos',
    title: 'Escapada para dos',
    description: 'Opciones ya calculadas para dos adultos. Elige una para conocer hotel, habitación, servicios y condiciones.'
  },
  {
    key: 'familia-beneficio',
    eyebrow: 'Viajar en familia',
    title: 'Familia · menores con beneficio',
    description: 'Promociones donde la edad y ocupación de los menores generan un beneficio real. Siempre mostramos las edades y condiciones aplicables.'
  },
  {
    key: 'juniors',
    eyebrow: 'Familias con hijos junior',
    title: 'Familias con juniors',
    description: 'Opciones para hijos que ya no entran en la promoción infantil más baja, pero todavía pueden tener tarifa junior o de menor según el proveedor.'
  }
];

function esc(value = '') {
  return String(value).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
function safeHttpUrl(value = '') {
  try { const u = new URL(String(value)); return /^https?:$/.test(u.protocol) ? u.toString() : ''; }
  catch (_) { return ''; }
}
function money(value = '') {
  const n = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n) : String(value || '');
}
function dateMx(value = '') {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return String(value || '');
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
}
function compactList(items = []) {
  return Array.isArray(items) && items.length ? `<ul>${items.slice(0, 8).map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p>Información disponible durante la asesoría.</p>';
}

async function loadMaster() {
  const separator = MASTER_ENDPOINT.includes('?') ? '&' : '?';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${MASTER_ENDPOINT}${separator}_ts=${Date.now()}`, {
      cache: 'no-store', redirect: 'follow', signal: controller.signal,
      headers: { 'User-Agent': 'TrhoncalTravel-DestinationHubPreview/1.0', 'Cache-Control': 'no-cache' }
    });
    if (!response.ok) throw new Error(`Master ${response.status}`);
    return await response.json();
  } finally { clearTimeout(timeout); }
}

function inferSegment(offer) {
  if (SEGMENT_FALLBACK[offer.id]) return SEGMENT_FALLBACK[offer.id];
  const occupancy = String(offer.occupancy || '').toLowerCase();
  if (/2\s*adult/.test(occupancy) && !/(menor|niñ|junior)/.test(occupancy)) {
    return { segment: 'pareja', priority: 99, publicText: offer.occupancy || 'Opción para dos adultos.' };
  }
  return null;
}

function offerTarget(offer) {
  const hotelSlug = HOTEL_SLUG_BY_OFFER[offer.id];
  return hotelSlug
    ? `/hotel-v2/${encodeURIComponent(hotelSlug)}?oferta=${encodeURIComponent(offer.id)}`
    : `/oferta/${encodeURIComponent(offer.id)}`;
}

function offerCard(offer, segment) {
  const image = safeHttpUrl(offer.image);
  const dates = [offer.travelStart ? dateMx(offer.travelStart) : '', offer.travelEnd ? dateMx(offer.travelEnd) : ''].filter(Boolean).join(' – ');
  const duration = [offer.days ? `${offer.days} días` : '', offer.nights ? `${offer.nights} noches` : ''].filter(Boolean).join(' · ');
  const price = money(offer.price || '');
  const target = offerTarget(offer);
  return `<article class="hub-offer-card">
    <a class="hub-offer-image" href="${esc(target)}" aria-label="Ver ${esc(offer.title || offer.hotel || 'esta opción')}">
      ${image ? `<img src="${esc(image)}" alt="${esc(offer.hotel || offer.title || 'Promoción de viaje')}" loading="lazy">` : '<div class="hub-image-placeholder">Imagen del hotel en preparación</div>'}
    </a>
    <div class="hub-offer-body">
      <div class="hub-offer-meta"><span>${esc(offer.plan || 'Viaje')}</span>${dates ? `<small>${esc(dates)}</small>` : ''}</div>
      <h3 translate="no" class="notranslate">${esc(offer.hotel || offer.title || 'Opción de viaje')}</h3>
      <p class="hub-offer-title">${esc(offer.title || '')}</p>
      <div class="hub-offer-facts">${duration ? `<span>${esc(duration)}</span>` : ''}${offer.occupancy ? `<span>${esc(offer.occupancy)}</span>` : ''}</div>
      ${segment.publicText ? `<p class="hub-segment-note">${esc(segment.publicText)}</p>` : ''}
      <div class="hub-offer-bottom"><div>${price ? `<small>${esc(offer.priceUnit || 'Precio publicado')}</small><strong>${esc(price)}</strong><span> MXN</span>` : '<strong>Consultar precio</strong>'}</div><a class="hub-offer-cta" href="${esc(target)}">Ver esta opción →</a></div>
    </div>
  </article>`;
}

function groupOffers(offers) {
  const groups = new Map(SEGMENTS.map(s => [s.key, []]));
  offers.forEach(offer => {
    const segment = inferSegment(offer);
    if (!segment || !groups.has(segment.segment)) return;
    groups.get(segment.segment).push({ offer, segment });
  });
  for (const [key, rows] of groups) {
    rows.sort((a, b) => {
      const featured = Number(Boolean(b.offer.featuredHome)) - Number(Boolean(a.offer.featuredHome));
      if (featured) return featured;
      const priority = (a.segment.priority || 99) - (b.segment.priority || 99);
      if (priority) return priority;
      return (a.offer.ordenWeb || 999) - (b.offer.ordenWeb || 999);
    });
    groups.set(key, rows.slice(0, 2));
  }
  return groups;
}

function render404(res) {
  res.setHeader('X-Robots-Tag', 'noindex,nofollow');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(404).send('<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Destino no disponible</title><body><p>Destino de prueba no disponible.</p></body></html>');
}

export default async function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).send('Method not allowed'); }
  const slug = String(req.query.slug || '').trim().toLowerCase();
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) return render404(res);

  let payload;
  try { payload = await loadMaster(); }
  catch (_) {
    res.setHeader('X-Robots-Tag', 'noindex,nofollow');
    return res.status(503).send('No pudimos cargar la vista previa en este momento.');
  }

  const destinations = Array.isArray(payload.destinations) ? payload.destinations : [];
  const offers = Array.isArray(payload.offers) ? payload.offers : [];
  const sources = Array.isArray(payload.sources) ? payload.sources : [];
  const d = destinations.find(x => x && x.slug === slug && VALID_STATUS.has(x.status));
  if (!d) return render404(res);

  const destinationOffers = offers.filter(o => o && o.destinationId === d.id);
  const groups = groupOffers(destinationOffers);
  const hasAny = Array.from(groups.values()).some(rows => rows.length);
  const image = safeHttpUrl(d.mainImage);
  const quote = new URLSearchParams({ cta: 'destination_hub_v2', destino: d.name });
  const quoteUrl = `/cotizar-v2/?${quote.toString()}`;
  const wa = `https://wa.me/523329335952?text=${encodeURIComponent(`Hola, quiero opciones para viajar a ${d.name} con Trhoncal Travel.`)}`;
  const sourceSet = new Set(Array.isArray(d.sourceIds) ? d.sourceIds : []);
  const sourceRows = sources.filter(s => s && sourceSet.has(s.id));

  const segmentHtml = SEGMENTS.map(def => {
    const rows = groups.get(def.key) || [];
    if (!rows.length) return '';
    return `<section class="hub-segment"><div class="hub-segment-head"><div><span class="eyebrow">${esc(def.eyebrow)}</span><h2>${esc(def.title)}</h2></div><p>${esc(def.description)}</p></div><div class="hub-offer-grid">${rows.map(x => offerCard(x.offer, x.segment)).join('')}</div></section>`;
  }).join('');

  const sourceHtml = sourceRows.length ? sourceRows.slice(0, 6).map(s => {
    const u = safeHttpUrl(s.url);
    return `<div class="hub-source"><div><strong>${esc(s.organization || 'Fuente')}</strong><span>${esc(s.title || '')}</span></div>${u ? `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">Fuente oficial ↗</a>` : ''}</div>`;
  }).join('') : '<p>La ficha conserva las fuentes verificadas del destino.</p>';

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'noindex,nofollow');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=180');

  return res.status(200).send(`<!doctype html><html lang="es"><head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${esc(d.name)} · Hub de viaje V2 | Trhoncal Travel</title><meta name="robots" content="noindex,nofollow">
    <link rel="icon" type="image/svg+xml" href="/assets/images/trhoncal-travel-logo.svg">
    <link rel="stylesheet" href="/assets/css/styles.css"><link rel="stylesheet" href="/assets/css/brand-v2.css"><link rel="stylesheet" href="/assets/css/destination-hub-v2.css">
  </head><body class="destination-hub-v2">
    <header class="site-header"><div class="container header-inner"><a class="brand" href="/"><img class="brand-logo" src="/assets/images/trhoncal-travel-logo.svg" alt="Trhoncal Travel"></a><nav class="nav"><a href="/#destinos">Destinos</a><a href="/cuando-viajar/">Cuándo viajar</a><a href="/#promociones">Ofertas</a><a href="/#cotizar">Solicita tu viaje</a></nav><a class="btn btn-outline" href="${wa}" target="_blank" rel="noopener noreferrer">WhatsApp</a></div></header>
    <div class="hub-preview">VISTA PREVIA · HUB COMERCIAL DE DESTINO V2 · la ficha /mexico actual sigue intacta</div>
    <main>
      <section class="hub-hero"><div class="container hub-hero-grid"><div class="hub-hero-copy"><span class="eyebrow">${esc(d.state || '')} · ${esc(d.country || 'México')}</span><h1>${esc(d.name)}</h1><p>${esc(d.summary || '')}</p><div class="hub-hero-actions"><a class="btn btn-primary" href="#opciones">Ver opciones listas ↓</a><a class="btn btn-soft" href="${esc(quoteUrl)}">Armar un viaje diferente</a></div></div><div class="hub-hero-image">${image ? `<img src="${esc(image)}" alt="${esc(d.imageAlt || d.name)}">` : '<div class="hub-image-placeholder">Imagen del destino</div>'}</div></div></section>

      <section class="hub-products" id="opciones"><div class="container"><div class="hub-products-intro"><div><span class="eyebrow">Primero, producto real</span><h2>Opciones listas para viajar a ${esc(d.name)}</h2></div><p>Te enseñamos configuraciones ya cotizadas para que empieces comparando algo concreto. Si ninguna se parece a tu viaje, al final puedes pedir una opción personalizada.</p></div>
        ${hasAny ? segmentHtml : `<div class="hub-no-offers"><span class="eyebrow">Todavía no hay una promoción publicada</span><h2>¿Quieres viajar a ${esc(d.name)}?</h2><p>Cuéntanos tus fechas, cuántas personas viajan y las edades de los menores. Buscamos opciones reales para ti.</p><a class="btn btn-primary" href="${esc(quoteUrl)}">Quiero cotizar ${esc(d.name)} →</a></div>`}
      </div></section>

      <section class="hub-custom"><div class="container"><div class="hub-custom-card"><div><span class="eyebrow">¿No encaja ninguna?</span><h2>Ninguna de estas opciones se parece a mi viaje</h2><p>Perfecto. ${esc(d.name)} ya queda seleccionado; tú nos dices fechas, adultos, menores y edades para cotizar una alternativa en el momento.</p></div><a class="btn btn-primary" href="${esc(quoteUrl)}">Personalizar mi viaje a ${esc(d.name)} →</a></div></div></section>

      <section class="hub-guide"><div class="container"><div class="hub-guide-head"><div><span class="eyebrow">Después, la información útil</span><h2>Lo que necesitas saber antes de ir</h2></div><p>Conservamos la investigación del destino para ayudarte a decidir mejor, pero sin ponerla antes de las opciones de viaje.</p></div><div class="hub-accordion">
        <details open><summary>Por qué ir y para quién funciona</summary><div class="hub-detail-grid"><div><h3>Por qué ir</h3><p>${esc(d.whyGo || '')}</p></div><div><h3>¿Es para ti?</h3><p>${esc(d.travelerProfile || '')}</p></div></div></details>
        <details><summary>Clima, temporadas y cómo llegar</summary><div class="hub-detail-grid"><div><h3>Clima y temporadas</h3><p>${esc(d.climateSeasons || '')}</p></div><div><h3>Cómo llegar y moverse</h3><p>${esc(d.connectivity || '')}</p></div></div></details>
        <details><summary>Atractivos y experiencias</summary><div class="hub-detail-grid"><div><h3>Atractivos clave</h3>${compactList(d.attractions)}</div><div><h3>Experiencias</h3>${compactList(d.experiences)}</div></div></details>
        <details><summary>Historia, gastronomía y qué combinar</summary><div class="hub-detail-grid"><div><h3>Historia y contexto</h3><p>${esc(d.history || '')}</p><h3>Gastronomía</h3><p>${esc(d.gastronomy || '')}</p></div><div><h3>Qué combinar</h3>${compactList(d.combinations)}<h3>Patrimonio</h3><p>${esc(d.sustainabilityHeritage || '')}</p></div></div></details>
      </div></div></section>

      <section class="hub-sources"><div class="container"><span class="eyebrow">Información verificable</span><h2>Fuentes del destino</h2>${sourceHtml}</div></section>
    </main>
    <footer class="footer"><div class="container footer-grid"><div><img class="footer-logo" src="/assets/images/trhoncal-travel-logo.svg" alt="Trhoncal Travel"><p>Opciones reales, información útil y asesoría humana para convertir la idea en viaje.</p></div><div><h3>Explora</h3><p><a href="/#destinos">Destinos</a></p><p><a href="/cuando-viajar/">Cuándo viajar</a></p></div><div><h3>Contacto</h3><p><a href="${wa}" target="_blank">WhatsApp</a></p><p><a href="mailto:viajestroncal@gmail.com">viajestroncal@gmail.com</a></p></div></div></footer>
  </body></html>`);
}
