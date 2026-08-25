const PUBLIC_HOST = 'viajes.trhoncalhomes.com.mx';
const MASTER_ENDPOINT = process.env.TRHONCAL_MASTER_ENDPOINT ||
  'https://script.google.com/macros/s/AKfycbxq6OxUnMWH004OKyspo7eAbI0GvJvwwDgSnfffSzn9amtKzOWqaDmtWUnrk52rz7U8/exec';

const VALID_STATUS = new Set(['verified', 'verified-initial', 'approved', 'published']);

function esc(value = '') {
  return String(value).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function list(items = []) {
  return Array.isArray(items) && items.length
    ? `<ul class="detail-list">${items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`
    : '<p>Consulta con nosotros las opciones que mejor se adapten a tu viaje.</p>';
}

function safeHttpUrl(value = '') {
  try {
    const url = new URL(String(value));
    return /^https?:$/.test(url.protocol) ? url.toString() : '';
  } catch (_) {
    return '';
  }
}

async function loadMaster() {
  const separator = MASTER_ENDPOINT.includes('?') ? '&' : '?';
  const response = await fetch(`${MASTER_ENDPOINT}${separator}_ts=${Date.now()}`, {
    method: 'GET', redirect: 'follow', cache: 'no-store',
    headers: { 'User-Agent': 'TrhoncalTravel-SSR/1.0', 'Cache-Control': 'no-cache' }
  });
  if (!response.ok) throw new Error(`Master ${response.status}`);
  const payload = await response.json();
  if (!payload || typeof payload !== 'object') throw new Error('Invalid Master payload');
  return payload;
}

function render404(res, publicHost) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  return res.status(404).send(`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Destino no encontrado | Trhoncal Travel</title><meta name="robots" content="noindex,nofollow"><link rel="icon" type="image/svg+xml" href="/assets/images/trhoncal-travel-logo.svg"><link rel="stylesheet" href="/assets/css/styles.css"><link rel="stylesheet" href="/assets/css/brand-v2.css"></head><body><main class="section"><div class="container"><img src="/assets/images/trhoncal-travel-logo.svg" alt="Trhoncal Travel" style="max-width:180px"><h1>Destino no encontrado</h1><p>Esta ficha no está disponible en este momento.</p><a class="btn btn-primary" href="${publicHost ? 'https://' + PUBLIC_HOST + '/#destinos' : '/#destinos'}">Explorar destinos</a></div></main></body></html>`);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method not allowed');
  }

  const slug = String(req.query.slug || '').trim().toLowerCase();
  const host = String(req.headers.host || '').split(':')[0].toLowerCase();
  const isPublicHost = host === PUBLIC_HOST;
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) return render404(res, isPublicHost);

  let payload;
  try {
    payload = await loadMaster();
  } catch (_) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    return res.status(503).send('<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Trhoncal Travel</title><link rel="icon" type="image/svg+xml" href="/assets/images/trhoncal-travel-logo.svg"></head><body><p>No pudimos cargar esta ficha. Intenta nuevamente en unos minutos.</p></body></html>');
  }

  const destinations = Array.isArray(payload.destinations) ? payload.destinations : [];
  const sources = Array.isArray(payload.sources) ? payload.sources : [];
  const d = destinations.find(x => x && x.slug === slug && VALID_STATUS.has(x.status));
  if (!d) return render404(res, isPublicHost);

  const sourceSet = new Set(Array.isArray(d.sourceIds) ? d.sourceIds : []);
  const sourceRows = sources.filter(s => s && sourceSet.has(s.id));
  const canonical = `https://${PUBLIC_HOST}/mexico/${encodeURIComponent(d.slug)}`;
  const title = `${d.name}: inspírate y viaja | Trhoncal Travel`;
  const description = d.summary || `Guía de ${d.name} con información revisada y asesoría de Trhoncal Travel.`;
  const image = safeHttpUrl(d.mainImage);
  const waText = encodeURIComponent(`Hola, quiero cotizar un viaje a ${d.name} con Trhoncal Travel.`);
  const wa = `https://wa.me/523329335952?text=${waText}`;
  const photo = image ? `<div class="detail-photo"><img src="${esc(image)}" alt="${esc(d.imageAlt || d.name)}"><div class="detail-photo-caption">${d.imageCredit ? `<span>${esc(d.imageCredit)}</span>` : ''}${d.imageLicense ? `<small>${esc(d.imageLicense)}</small>` : ''}</div></div>` : '';
  const sourceHtml = sourceRows.length ? sourceRows.map(s => {
    const u = safeHttpUrl(s.url);
    return `<div class="detail-source"><div><b>${esc(s.organization)} — ${esc(s.title)}</b><span>Verificada ${esc(s.verifiedAt || '')}</span></div>${u ? `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">Fuente oficial ↗</a>` : ''}</div>`;
  }).join('') : '<p>Consulta con nosotros las fuentes utilizadas para esta ficha.</p>';

  const structured = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TouristDestination',
        name: d.name,
        description,
        url: canonical,
        image: image || undefined,
        containedInPlace: d.state ? { '@type': 'AdministrativeArea', name: d.state } : undefined
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Trhoncal Travel', item: `https://${PUBLIC_HOST}/` },
          { '@type': 'ListItem', position: 2, name: 'Destinos de México', item: `https://${PUBLIC_HOST}/#destinos` },
          { '@type': 'ListItem', position: 3, name: d.name, item: canonical }
        ]
      }
    ]
  }).replace(/</g, '\\u003c');

  const robotsMeta = isPublicHost ? 'index,follow,max-image-preview:large' : 'noindex,nofollow';
  if (!isPublicHost) res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

  return res.status(200).send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="${robotsMeta}">
  <link rel="icon" type="image/svg+xml" href="/assets/images/trhoncal-travel-logo.svg">
  <link rel="canonical" href="${esc(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Trhoncal Travel">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(canonical)}">
  ${image ? `<meta property="og:image" content="${esc(image)}">` : ''}
  <link rel="stylesheet" href="/assets/css/styles.css">
  <link rel="stylesheet" href="/assets/css/brand-v2.css">
  <link rel="stylesheet" href="/assets/css/detail-v2.css">
  <link rel="stylesheet" href="/assets/css/quote-modal-v1.css">
  <script>if('scrollRestoration' in history)history.scrollRestoration='manual';window.scrollTo(0,0);</script>
  <script type="application/ld+json">${structured}</script>
</head>
<body class="destination-route">
  <header class="site-header"><div class="container header-inner"><a class="brand" href="/#inicio" aria-label="Trhoncal Travel"><img class="brand-logo" src="/assets/images/trhoncal-travel-logo.svg" alt="Trhoncal Travel"></a><nav class="nav" aria-label="Navegación principal"><a href="/#destinos">Destinos</a><a href="/#inspiracion">Inspírate</a><a href="/#fuentes">Fuentes</a><a href="/#cotizar">Cotizar</a></nav><a class="btn btn-outline" href="${wa}" target="_blank" rel="noopener noreferrer">WhatsApp</a></div></header>
  <main>
    <div class="destination-detail-overlay open route-page" aria-hidden="false"><article class="destination-detail" aria-labelledby="detailTitle">
      <div class="detail-route-bar"><a class="detail-route-brand" href="/#destinos"><img src="/assets/images/trhoncal-travel-logo.svg" alt="Trhoncal Travel"></a><div class="detail-route-context"><span>México · ${esc(d.state || '')}</span><a class="detail-route-back" href="/#destinos">← Volver a destinos</a></div></div>
      <header class="detail-header ${image ? 'with-photo' : ''}">${photo}<div class="detail-header-copy"><span class="eyebrow">${esc(d.state || '')} · ${esc(d.country || 'México')}${d.puebloMagico ? ' · Pueblo Mágico' : ''}</span><h1 id="detailTitle">${esc(d.name)}</h1><p>${esc(description)}</p></div></header>
      <div class="detail-body">
        <div class="detail-summary-grid"><div class="detail-stat"><small>Estancia sugerida</small><b>${esc(d.recommendedStay || 'Estancia según itinerario')}</b></div><div class="detail-stat"><small>Tipo de viaje</small><b>${esc((d.segments || []).slice(0,4).join(' · ') || d.type || 'Viaje personalizado')}</b></div><div class="detail-stat"><small>Información revisada</small><b>${esc(d.lastVerified || 'Revisada por Trhoncal Travel')}</b></div></div>
        <div class="detail-columns">
          <div><section class="detail-block"><h2>Por qué ir</h2><p>${esc(d.whyGo || '')}</p></section><section class="detail-block"><h2>Historia y contexto</h2><p>${esc(d.history || '')}</p></section><section class="detail-block"><h2>Atractivos clave</h2>${list(d.attractions)}</section><section class="detail-block"><h2>Experiencias</h2>${list(d.experiences)}</section></div>
          <div><section class="detail-block"><h2>¿Es para ti?</h2><p>${esc(d.travelerProfile || '')}</p></section><section class="detail-block"><h2>Clima y temporadas</h2><p>${esc(d.climateSeasons || '')}</p></section><section class="detail-block"><h2>Cómo llegar y moverse</h2><p>${esc(d.connectivity || '')}</p></section><section class="detail-block"><h2>Qué combinar</h2>${list(d.combinations)}</section></div>
        </div>
        <section class="detail-block"><h2>Gastronomía</h2><p>${esc(d.gastronomy || '')}</p></section>
        <section class="detail-block"><h2>Patrimonio y reconocimientos</h2>${list(d.recognitions)}<p>${esc(d.sustainabilityHeritage || '')}</p></section>
        <section class="detail-sources"><h2>Fuentes que respaldan esta ficha</h2>${sourceHtml}</section>
        <section class="detail-conversion"><div><span class="eyebrow">Tu viaje, a tu medida</span><h2>¿Te imaginas en ${esc(d.name)}?</h2><p>Ya conocemos el destino. Sólo cuéntanos tus fechas, cuántas personas viajan y desde dónde sales para empezar.</p></div><div class="detail-conversion-actions"><a class="btn btn-primary quote-link" href="/#cotizar" data-destination="${esc(d.name)}">Solicita tu viaje a ${esc(d.name)}</a><a class="btn btn-soft" href="${wa}" target="_blank" rel="noopener noreferrer">Prefiero WhatsApp</a></div></section>
      </div>
    </article></div>
  </main>

  <div id="quoteModal" class="quote-modal" hidden aria-hidden="true"><div class="quote-modal-backdrop" data-quote-close></div><section class="quote-modal-panel" role="dialog" aria-modal="true" aria-labelledby="quoteModalTitle"><button class="quote-modal-close" type="button" data-quote-close aria-label="Cerrar solicitud">×</button><header class="quote-modal-head"><span class="eyebrow">Trhoncal Travel</span><h2 id="quoteModalTitle">Tu viaje a ${esc(d.name)}</h2><p id="quoteModalCopy">Ya sabemos a dónde quieres ir. Cuéntanos fechas, viajeros y lo esencial para empezar.</p><div id="quoteSelectedDestination" class="quote-modal-destination">Destino seleccionado: ${esc(d.name)}</div></header><div class="quote-modal-frame-wrap"><iframe id="quoteModalFrame" class="quote-modal-frame" title="Solicita tu viaje con Trhoncal Travel" src="about:blank" loading="lazy"></iframe></div><p class="quote-modal-fallback">Si el formulario no carga, <a id="quoteModalFallbackLink" href="https://form.jotform.com/261127730314044?destinoDeseado=${encodeURIComponent(d.name)}" target="_blank" rel="noopener noreferrer">ábrelo aquí</a>.</p></section></div>

  <footer class="footer"><div class="container footer-grid"><div><img class="footer-logo" src="/assets/images/trhoncal-travel-logo.svg" alt="Trhoncal Travel"><p>Información útil para elegir mejor y asesoría humana para convertir la idea en un viaje real.</p></div><div><h3>Explora</h3><p><a href="/#destinos">Destinos</a></p><p><a href="/#fuentes">Fuentes</a></p></div><div><h3>Contacto</h3><p><a href="${wa}" target="_blank" rel="noopener noreferrer">WhatsApp</a></p><p><a href="mailto:viajestroncal@gmail.com">viajestroncal@gmail.com</a></p></div></div></footer>
  <script src="/assets/js/tracking-v1.js"></script>
  <script src="/assets/js/quote-modal-v1.js"></script>
  <script src="/assets/js/modal-a11y-v1.js"></script>
</body></html>`);
}