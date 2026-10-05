const PUBLIC_HOST = 'viajes.trhoncalhomes.com.mx';
const MASTER_ENDPOINT = process.env.TRHONCAL_MASTER_ENDPOINT ||
  'https://script.google.com/macros/s/AKfycbxq6OxUnMWH004OKyspo7eAbI0GvJvwwDgSnfffSzn9amtKzOWqaDmtWUnrk52rz7U8/exec';

function esc(value = '') {
  return String(value).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function safeHttpUrl(value = '') {
  try {
    const url = new URL(String(value));
    return /^https?:$/.test(url.protocol) ? url.toString() : '';
  } catch (_) {
    return '';
  }
}

function money(value) {
  const n = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n)
    ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
    : String(value || '');
}

function dateMx(value = '') {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return String(value || '');
  const d = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

function priceUnitLabel(offer = {}) {
  const raw = String(offer.priceUnit || '').trim();
  const type = String(offer.commercialType || '').toUpperCase();
  const low = raw.toLowerCase();
  const prefix = type === 'CAMPANA_DESDE' ? 'Desde' : '';
  let unit = raw || 'Precio publicado';
  if (/total\s+por\s+estancia/.test(low)) unit = 'Total por estancia';
  else if (/por\s*persona.*estancia/.test(low)) unit = 'Por persona · estancia completa';
  else if (/por\s*habitaci[oó]n.*noche/.test(low) || /promedio.*noche/.test(low)) unit = 'Por habitación · por noche';
  else if (/por\s*persona.*noche/.test(low)) unit = 'Por persona · por noche';
  else if (/por\s+paquete/.test(low)) unit = 'Por paquete';
  else if (/por\s*persona/.test(low)) unit = 'Por persona';
  else if (/total/.test(low)) unit = 'Total publicado';
  else if (/desde/.test(low)) unit = '';
  return prefix ? (unit ? `${prefix} · ${unit}` : prefix) : (unit || 'Precio publicado');
}

function tripTotal(offer = {}) {
  const price = Number(String(offer.price ?? '').replace(/[^0-9.-]/g, ''));
  if (!Number.isFinite(price) || price <= 0) return null;
  const unit = String(offer.priceUnit || '').toLowerCase();
  const nights = Number(offer.nights);
  const rooms = Number(offer.rooms);
  const persons = Number(offer.persons);
  if (/por\s*habitaci[oó]n.*noche/.test(unit)) return nights > 0 && rooms > 0 ? price * rooms * nights : null;
  if (/por\s*persona.*noche/.test(unit)) return nights > 0 && persons > 0 ? price * persons * nights : null;
  if (/por\s*persona.*estancia/.test(unit)) return persons > 0 ? price * persons : null;
  if (/total\s+por\s+estancia|por\s+paquete/.test(unit)) return price;
  return null;
}
function publicNote(value = '') {
  const raw = String(value || '').trim();
  const fallback = 'Precio, disponibilidad y condiciones sujetos a reconfirmación antes de reservar.';
  if (!raw) return fallback;
  const internal = /(priceagencies|travel\s*promo\s*maker|proveedor|captura\s+directa|evidencia\s+interna|nota\s+interna|uso\s+interno|\/promotion\/|url\s+del\s+proveedor)/i;
  return internal.test(raw) ? fallback : raw;
}

function sharePriceText(offer = {}) {
  if (!offer.price) return '';
  return `${priceUnitLabel(offer)} ${money(offer.price)}`;
}

async function loadMaster() {
  const separator = MASTER_ENDPOINT.includes('?') ? '&' : '?';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${MASTER_ENDPOINT}${separator}_ts=${Date.now()}`, {
      method: 'GET', redirect: 'follow', cache: 'no-store', signal: controller.signal,
      headers: { 'User-Agent': 'TrhoncalTravel-Offer/1.0', 'Cache-Control': 'no-cache' }
    });
    if (!response.ok) throw new Error(`Master ${response.status}`);
    const payload = await response.json();
    if (!payload || typeof payload !== 'object') throw new Error('Invalid Master payload');
    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

function renderUnavailable(res, publicHost) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  return res.status(404).send(`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Oferta no disponible | Trhoncal Travel</title><meta name="robots" content="noindex,nofollow"><link rel="icon" type="image/svg+xml" href="/assets/images/trhoncal-travel-logo.svg"><link rel="stylesheet" href="/assets/css/styles.css"><link rel="stylesheet" href="/assets/css/brand-v2.css"></head><body><main class="section"><div class="container"><img src="/assets/images/trhoncal-travel-logo.svg" alt="Trhoncal Travel" style="max-width:180px"><h1>Esta oferta ya no está disponible</h1><p>Las promociones cambian por disponibilidad, tarifa o vigencia. Podemos ayudarte a buscar una opción actual.</p><a class="btn btn-primary" href="${publicHost ? `https://${PUBLIC_HOST}/#cotizar` : '/#cotizar'}">Solicitar opciones actuales</a></div></main></body></html>`);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method not allowed');
  }

  const id = String(req.query.id || '').trim();
  const host = String(req.headers.host || '').split(':')[0].toLowerCase();
  const isPublicHost = host === PUBLIC_HOST;
  if (!id || !/^[A-Za-z0-9_-]+$/.test(id)) return renderUnavailable(res, isPublicHost);

  let payload;
  try {
    payload = await loadMaster();
  } catch (_) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    return res.status(503).send('<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Trhoncal Travel</title></head><body><p>No pudimos cargar esta promoción. Intenta nuevamente en unos minutos.</p></body></html>');
  }

  const offers = Array.isArray(payload.offers) ? payload.offers : [];
  const destinations = Array.isArray(payload.destinations) ? payload.destinations : [];
  const offer = offers.find(x => x && x.id === id);
  if (!offer) return renderUnavailable(res, isPublicHost);

  const destination = destinations.find(d => d && d.id === offer.destinationId) || null;
  const destinationName = destination?.name || offer.leadDestinationVerified || 'Viaje especial';
  const canonical = `https://${PUBLIC_HOST}/oferta/${encodeURIComponent(offer.id)}`;
  const shareText = `${destinationName}: ${offer.title || 'promoción de viaje'}${offer.price ? ` · ${sharePriceText(offer)}` : ''}. Sujeto a disponibilidad y cambios sin previo aviso; reconfirmamos antes de reservar.`;
  // Una promoción de hotel debe usar su propia imagen. Si falta, mostramos fallback de marca;
  // nunca sustituimos silenciosamente con la foto genérica del destino.
  const image = safeHttpUrl(offer.image || (!offer.hotel ? destination?.mainImage : '') || '');
  const imageAlt = offer.hotel ? `${offer.hotel} en ${destinationName}` : (destination?.imageAlt || offer.title || destinationName);
  const externalPromo = safeHttpUrl(offer.leadFormUrl || offer.sharePromoUrl || offer.publicPromoUrl || '');
  const plan = String(offer.plan || '');
  const quoteParams = new URLSearchParams({ travelQuote: '1', cta: 'oferta_compartida' });
  if (destinationName) quoteParams.set('destino', destinationName);
  if (offer.travelStart) quoteParams.set('salida', offer.travelStart);
  if (offer.travelEnd) quoteParams.set('regreso', offer.travelEnd);
  if (offer.occasionId) quoteParams.set('ocasion', offer.occasionId);
  if (offer.id) quoteParams.set('oferta', offer.id);
  if (plan) quoteParams.set('plan', plan);
  const quoteUrl = `https://${PUBLIC_HOST}/?${quoteParams.toString()}`;
  const customQuoteParams = new URLSearchParams({ travelQuote: '1', cta: 'arma_tu_viaje_oferta' });
  if (destinationName) customQuoteParams.set('destino', destinationName);
  const customQuoteUrl = `https://${PUBLIC_HOST}/?${customQuoteParams.toString()}`;
  const pdfUrl = `https://${PUBLIC_HOST}/oferta/${encodeURIComponent(offer.id)}.pdf`;
  const waShare = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${canonical}`)}`;
  const mailShare = `mailto:?subject=${encodeURIComponent(`Mira esta opción de ${destinationName}`)}&body=${encodeURIComponent(`${shareText}\n\n${canonical}`)}`;
  const dates = [offer.travelStart ? dateMx(offer.travelStart) : '', offer.travelEnd ? dateMx(offer.travelEnd) : ''].filter(Boolean);
  const duration = [offer.days ? `${offer.days} días` : '', offer.nights ? `${offer.nights} noches` : ''].filter(Boolean).join(' · ');
  const price = money(offer.price);
  const totalValue = tripTotal(offer);
  const total = totalValue ? money(totalValue) : '';
  const personsCount = Number(offer.persons);
  const perPersonValue = totalValue && personsCount > 0 ? totalValue / personsCount : null;
  const perPerson = perPersonValue ? money(perPersonValue) : '';
  const unitIsTotal = /total\s+por\s+estancia|por\s+paquete/i.test(String(offer.priceUnit || ''));
  const showTripTotal = !!total && !unitIsTotal;
  const showPerPerson = !!perPerson && personsCount > 0;
  const includes = Array.isArray(offer.includes) ? offer.includes : [];
  const excludes = Array.isArray(offer.excludes) ? offer.excludes : [];
  const description = publicNote(offer.note || `Opción de viaje a ${destinationName}. Precio, disponibilidad y condiciones se reconfirman antes de reservar.`);
  const normalizeName = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const normalizedTitle = normalizeName(offer.title);
  const normalizedHotel = normalizeName(offer.hotel);
  const hotelCore = normalizeName(String(offer.hotel || '').split(',')[0]);
  const titleAlreadyNamesHotel = !!hotelCore && (normalizedTitle.includes(normalizedHotel) || normalizedTitle.includes(hotelCore));
  const showHotelSubtitle = !!offer.hotel && !titleAlreadyNamesHotel;

  const structured = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TravelAgency',
        '@id': `https://${PUBLIC_HOST}/#agency`,
        name: 'Trhoncal Travel',
        url: `https://${PUBLIC_HOST}/`,
        logo: `https://${PUBLIC_HOST}/assets/images/trhoncal-travel-logo.svg`,
        email: 'viajestroncal@gmail.com',
        telephone: '+52 33 2927 9412'
      },
      {
        '@type': 'WebPage',
        '@id': `${canonical}#page`,
        url: canonical,
        name: `${offer.title || destinationName} | Trhoncal Travel`,
        description,
        provider: { '@id': `https://${PUBLIC_HOST}/#agency` }
      }
    ]
  }).replace(/</g, '\\u003c');

  if (!isPublicHost) res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=180');

  return res.status(200).send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${esc(offer.title || destinationName)} | Trhoncal Travel</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="noindex,follow,max-image-preview:large">
  <link rel="canonical" href="${esc(canonical)}">
  <link rel="icon" type="image/svg+xml" href="/assets/images/trhoncal-travel-logo.svg">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Trhoncal Travel">
  <meta property="og:title" content="${esc(offer.title || destinationName)}">
  <meta property="og:description" content="${esc(shareText)}">
  <meta property="og:url" content="${esc(canonical)}">
  ${image ? `<meta property="og:image" content="${esc(image)}"><meta property="og:image:alt" content="${esc(imageAlt)}">` : ''}
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="/assets/css/styles.css">
  <link rel="stylesheet" href="/assets/css/brand-v2.css">
  <link rel="stylesheet" href="/assets/css/offer-v1.css">
  <script type="application/ld+json">${structured}</script>
</head>
<body class="offer-page">
  <header class="site-header"><div class="container header-inner"><a class="brand" href="/" aria-label="Trhoncal Travel"><img class="brand-logo" src="/assets/images/trhoncal-travel-logo.svg" alt="Trhoncal Travel"></a><nav class="nav" aria-label="Navegación principal"><a href="/#destinos">Destinos</a><a href="/cuando-viajar/">Cuándo viajar</a><a href="/#promociones">Ofertas</a><a href="/#cotizar">Arma tu viaje</a></nav><a class="btn btn-outline" href="https://wa.me/523329279412" target="_blank" rel="noopener noreferrer">WhatsApp</a></div></header>

  <main class="offer-main">
    <section class="offer-hero">
      <div class="container offer-hero-grid">
        <div class="offer-copy">
          <span class="eyebrow">Una opción para compartir</span>
          <h1${offer.hotel ? ' translate="no" class="notranslate"' : ''}>${esc(offer.title || destinationName)}</h1>
          ${showHotelSubtitle ? `<p class="offer-hotel" translate="no"><strong>Hotel: ${esc(offer.hotel)}</strong></p>` : ''}
          <p>${esc(description)}</p>
          <div class="offer-tags">
            ${dates.length ? `<span>${esc(dates.join(' - '))}</span>` : ''}
            ${duration ? `<span>${esc(duration)}</span>` : ''}
            ${plan ? `<span>${esc(plan)}</span>` : ''}
            ${offer.rooms ? `<span>${esc(Number(offer.rooms)===1?'1 habitación':offer.rooms+' habitaciones')}</span>` : ''}
            ${offer.persons ? `<span>${esc(offer.persons)} persona${Number(offer.persons)===1?'':'s'}</span>` : ''}
            ${offer.occupancy ? `<span>${esc(offer.occupancy)}</span>` : ''}
          </div>
          ${price ? `<div class="offer-price"><small>${esc(priceUnitLabel(offer))}</small><strong>${esc(price)}</strong><span>MXN</span></div>` : ''}
          ${showTripTotal ? `<div class="offer-total"><span>Total del viaje</span><strong>${esc(total)}</strong><small>MXN</small></div>` : ''}
          ${showPerPerson ? `<div class="offer-person-total"><span>Por persona</span><strong>${esc(perPerson)}</strong><small>MXN</small></div>` : ''}
          <div class="offer-payment-benefits"><span>Hasta 18 meses con tarjetas participantes</span>${offer.allowsDeposits ? `<span>${esc(offer.depositText || 'Pregunta por opción de apartar y abonar')}</span>` : ''}</div>
          <p class="offer-disclaimer">Precio, disponibilidad y condiciones se reconfirman antes de reservar.</p>
        </div>
        <div class="offer-visual">${image ? `<img src="${esc(image)}" alt="${esc(imageAlt)}">` : `<div class="offer-image-fallback"><span>TRHONCAL TRAVEL</span><strong>${esc(offer.hotel || destinationName)}</strong><small>Imagen de esta promoción pendiente de cargar</small></div>`}</div>
      </div>
    </section>

    <section class="offer-actions-section"><div class="container">
      <div class="offer-actions-card" data-share-title="${esc(offer.title || destinationName)}" data-share-text="${esc(shareText)}" data-share-url="${esc(canonical)}">
        <div><span class="eyebrow">¿Te gusta esta opción?</span><h2>Guárdala, compártela o arma tu viaje</h2><p>Puedes enviársela a quien viaje contigo para decidir juntos sin perder la promoción.</p></div>
        <div class="offer-action-buttons">
          <button class="btn btn-primary" type="button" data-native-share>Compartir promoción</button>
          <a class="btn btn-soft" href="${esc(pdfUrl)}" download>Descargar PDF</a>
          <a class="btn btn-soft" href="${esc(customQuoteUrl)}">Arma tu viaje</a>
          <a class="offer-mini-action" href="${esc(waShare)}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a class="offer-mini-action" href="${esc(mailShare)}">Correo</a>
          <button class="offer-mini-action" type="button" data-copy-link>Copiar enlace</button>
        </div>
        <p class="offer-copy-status" data-copy-status aria-live="polite"></p>
      </div>
    </section>

    <section class="section"><div class="container offer-details-grid">
      <article class="offer-detail-card"><span class="eyebrow">Tu opción</span><h2>${esc(destinationName)}</h2><dl>
        ${offer.hotel ? `<div><dt>Hotel</dt><dd translate="no" class="notranslate">${esc(offer.hotel)}</dd></div>` : ''}
        ${duration ? `<div><dt>Duración</dt><dd>${esc(duration)}</dd></div>` : ''}
        ${plan ? `<div><dt>Plan</dt><dd>${esc(plan)}</dd></div>` : ''}
        ${offer.rooms ? `<div><dt>Habitaciones</dt><dd>${esc(offer.rooms)}</dd></div>` : ''}
        ${offer.persons ? `<div><dt>Personas</dt><dd>${esc(offer.persons)}</dd></div>` : ''}
        ${offer.occupancy ? `<div><dt>Ocupación</dt><dd>${esc(offer.occupancy)}</dd></div>` : ''}
        ${dates.length ? `<div><dt>Fechas</dt><dd>${esc(dates.join(' - '))}</dd></div>` : ''}
        ${offer.verifiedAt ? `<div><dt>Precio confirmado</dt><dd>${esc(dateMx(offer.verifiedAt))}</dd></div>` : ''}
      </dl></article>
      <article class="offer-detail-card"><span class="eyebrow">Qué incluye</span><h2>Lo esencial de esta promoción</h2>${includes.length ? `<ul>${includes.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p>Consulta el detalle de servicios en la promoción vigente.</p>'}${excludes.length ? `<h3>No incluye</h3><ul>${excludes.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}</article>
    </div></section>

    <section class="offer-final"><div class="container offer-final-card"><div><span class="eyebrow">Siguiente paso</span><h2>¿Quieres avanzar con este viaje?</h2><p>Revisamos disponibilidad y condiciones actuales antes de cualquier pago.</p></div><div class="offer-final-actions"><a class="btn btn-primary" href="${esc(quoteUrl)}">Quiero este viaje →</a><a class="btn btn-soft" href="${esc(customQuoteUrl)}">Arma tu viaje →</a></div></div></section>
  </main>

  <footer class="footer"><div class="container footer-grid"><div><img class="footer-logo" src="/assets/images/trhoncal-travel-logo.svg" alt="Trhoncal Travel"><p>Tu viaje comienza desde que lo imaginas.</p></div><div><h3>Contacto</h3><p><a href="https://wa.me/523329279412" target="_blank" rel="noopener noreferrer">WhatsApp 33 2927 9412</a></p><p><a href="mailto:viajestroncal@gmail.com">viajestroncal@gmail.com</a></p></div></div></footer>
  <script src="/assets/js/tracking-v1.js"></script>
  <script src="/assets/js/offer-share-v1.js"></script>
</body>
</html>`);
}
