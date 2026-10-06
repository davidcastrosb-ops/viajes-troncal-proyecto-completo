import '../assets/js/commercial.js';
const commercial = globalThis.TravelCommercial;
function metaNumeric(value) {
  const n = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function metaCatalogPrice(offer = {}) {
  const { totalCents, personCents } = commercial.amounts(offer);
  // No safe total means no catalog product; never advertise an incomplete base as a person total.
  return commercial.formatCents(personCents ?? totalCents, true);
}

function metaCleanText(value = '') {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .replace(/priceagencies|travel\s*promo\s*maker|proveedor/ig, '')
    .trim();
}

function metaCsvCell(value = '') {
  const text = String(value ?? '');
  return '"' + text.replace(/"/g, '""') + '"';
}

function buildMetaFeed(payload = {}) {
  const publicHost = 'viajes.trhoncalhomes.com.mx';
  const destinations = Array.isArray(payload.destinations) ? payload.destinations : [];
  const offers = Array.isArray(payload.offers) ? payload.offers : [];
  const headers = [
    'id','title','description','availability','condition','price','link','image_link',
    'brand','product_type','custom_label_0','custom_label_1','custom_label_2',
    'custom_label_3','custom_label_4'
  ];

  const rows = offers
    .filter(offer => commercial.visible(offer) && offer.id && offer.price && offer.image)
    .map(offer => {
      const destination = destinations.find(d => d && d.id === offer.destinationId) || null;
      const destinationName = metaCleanText(destination?.name || offer.leadDestinationVerified || 'Viaje');
      const price = metaCatalogPrice(offer);
      if (!price) return null;
      const people = Number(offer.persons);
      const priceText = people > 0
        ? `Precio por persona para ${people} viajero${people === 1 ? '' : 's'}.`
        : 'Precio publicado sujeto a reconfirmación.';
      const description = metaCleanText(
        `${offer.hotel || offer.title || destinationName}. ${offer.plan || ''}. ${priceText} Precio, disponibilidad y condiciones sujetos a reconfirmación antes de reservar.`
      );
      return [
        offer.id,
        metaCleanText(offer.title || `${destinationName} · Trhoncal Travel`),
        description,
        'in stock',
        'new',
        price,
        `https://${publicHost}/oferta/${encodeURIComponent(offer.id)}`,
        metaCleanText(offer.image),
        'Trhoncal Travel',
        'Viajes > Hotel',
        destinationName,
        metaCleanText(offer.hotel || ''),
        metaCleanText(offer.plan || ''),
        metaCleanText(offer.occasionId || ''),
        metaCleanText(offer.commercialType || 'TARIFA_DINAMICA')
      ];
    })
    .filter(Boolean);

  return [headers, ...rows].map(values => values.map(metaCsvCell).join(',')).join('\n') + '\n';
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const endpoint = process.env.TRHONCAL_MASTER_ENDPOINT ||
    'https://script.google.com/macros/s/AKfycbxq6OxUnMWH004OKyspo7eAbI0GvJvwwDgSnfffSzn9amtKzOWqaDmtWUnrk52rz7U8/exec';

  // Bypass cache so editorial visibility changes can be observed quickly.
  const separator = endpoint.includes('?') ? '&' : '?';
  const upstreamUrl = `${endpoint}${separator}_ts=${Date.now()}`;

  res.setHeader('X-Content-Type-Options', 'nosniff');

  try {
    const response = await fetch(upstreamUrl, {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store',
      headers: {
        'User-Agent': 'TrhoncalTravel/1.0',
        'Cache-Control': 'no-cache'
      }
    });

    const raw = await response.text();

    if (!response.ok) {
      console.error('Master upstream unavailable', { status: response.status });
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.status(502).json({ error: 'Master endpoint unavailable' });
    }

    let payload;
    try {
      payload = JSON.parse(raw);
    } catch (error) {
      console.error('Master upstream returned invalid JSON');
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.status(502).json({ error: 'Master endpoint returned invalid data' });
    }

    if (!payload || typeof payload !== 'object') {
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.status(502).json({ error: 'Invalid Master payload' });
    }

    const internalPattern = /(priceagencies|travel\s*promo\s*maker|proveedor|captura\s+directa|evidencia\s+interna|nota\s+interna|uso\s+interno|\/promotion\/)/i;
    const safePayload = { ...payload };
    if (Array.isArray(payload.offers)) {
      safePayload.offers = payload.offers.map(item => {
        if (!item || typeof item !== 'object') return item;
        const clean = { ...item };
        delete clean.providerId;
        delete clean.Proveedor_ID;
        delete clean.URL_proveedor_interna;
        delete clean.publicPromoUrl;
        delete clean.sharePromoUrl;
        delete clean.leadFormUrl;
        delete clean.internalNotes;
        delete clean.Notas_Internas;
        if (typeof clean.note === 'string' && internalPattern.test(clean.note)) {
          clean.note = 'Precio, disponibilidad y condiciones sujetos a reconfirmación antes de reservar.';
        }
        return clean;
      });
    }
    if (Array.isArray(payload.sources)) {
      safePayload.sources = payload.sources.filter(item => {
        if (!item || typeof item !== 'object') return false;
        const haystack = [item.level, item.type, item.organization, item.title].filter(Boolean).join(' ');
        return !/\binterna\b|priceagencies|travel\s*promo\s*maker/i.test(haystack);
      });
    }

    if (String(req.query?.format || '').toLowerCase() === 'meta') {
      const csv = buildMetaFeed(safePayload);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'inline; filename="trhoncal-travel-meta-feed.csv"');
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
      return res.status(200).send(csv);
    }

    res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
    return res.status(200).json(safePayload);
  } catch (error) {
    console.error('Could not load Trhoncal Travel Master Sheet', error);
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(500).json({ error: 'Could not load Trhoncal Travel Master Sheet' });
  }
}
