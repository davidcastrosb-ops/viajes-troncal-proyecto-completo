const PUBLIC_HOST = 'viajes.trhoncalhomes.com.mx';
const MASTER_ENDPOINT = process.env.TRHONCAL_MASTER_ENDPOINT ||
  'https://script.google.com/macros/s/AKfycbxq6OxUnMWH004OKyspo7eAbI0GvJvwwDgSnfffSzn9amtKzOWqaDmtWUnrk52rz7U8/exec';

function numeric(value) {
  const n = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function tripTotal(offer = {}) {
  const price = numeric(offer.price);
  if (!price || price <= 0) return null;
  const unit = String(offer.priceUnit || '').toLowerCase();
  const nights = Number(offer.nights);
  const rooms = Number(offer.rooms);
  const persons = Number(offer.persons);

  if (/por\s*habitaci[oó]n.*noche/.test(unit)) {
    return nights > 0 && rooms > 0 ? price * rooms * nights : null;
  }
  if (/por\s*persona.*noche/.test(unit)) {
    return nights > 0 && persons > 0 ? price * persons * nights : null;
  }
  if (/por\s*persona.*estancia/.test(unit)) {
    return persons > 0 ? price * persons : null;
  }
  if (/total\s+por\s+estancia|por\s+paquete/.test(unit)) {
    return price;
  }
  return null;
}

function catalogPrice(offer = {}) {
  const total = tripTotal(offer);
  const persons = Number(offer.persons);
  if (total && persons > 0) return total / persons;
  return numeric(offer.price);
}

function cleanText(value = '') {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .replace(/priceagencies|travel\s*promo\s*maker|proveedor/ig, '')
    .trim();
}

function csvCell(value = '') {
  const text = String(value ?? '');
  return '"' + text.replace(/"/g, '""') + '"';
}

function csvRow(values) {
  return values.map(csvCell).join(',');
}

async function loadMaster() {
  const separator = MASTER_ENDPOINT.includes('?') ? '&' : '?';
  const response = await fetch(`${MASTER_ENDPOINT}${separator}_ts=${Date.now()}`, {
    method: 'GET',
    redirect: 'follow',
    cache: 'no-store',
    headers: {
      'User-Agent': 'TrhoncalTravel-MetaFeed/1.0',
      'Cache-Control': 'no-cache'
    }
  });

  if (!response.ok) throw new Error(`Master ${response.status}`);
  const payload = await response.json();
  if (!payload || typeof payload !== 'object') throw new Error('Invalid Master payload');
  return payload;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method not allowed');
  }

  try {
    const payload = await loadMaster();
    const destinations = Array.isArray(payload.destinations) ? payload.destinations : [];
    const offers = Array.isArray(payload.offers) ? payload.offers : [];

    const headers = [
      'id','title','description','availability','condition','price','link','image_link',
      'brand','product_type','custom_label_0','custom_label_1','custom_label_2',
      'custom_label_3','custom_label_4'
    ];

    const rows = offers
      .filter(offer => offer && offer.id && offer.price && offer.image)
      .map(offer => {
        const destination = destinations.find(d => d && d.id === offer.destinationId) || null;
        const destinationName = cleanText(destination?.name || offer.leadDestinationVerified || 'Viaje');
        const price = catalogPrice(offer);
        if (!price || price <= 0) return null;

        const people = Number(offer.persons);
        const priceText = people > 0
          ? `Precio por persona para ${people} viajero${people === 1 ? '' : 's'}.`
          : 'Precio publicado sujeto a reconfirmación.';
        const description = cleanText(
          `${offer.hotel || offer.title || destinationName}. ${offer.plan || ''}. ${priceText} Precio, disponibilidad y condiciones sujetos a reconfirmación antes de reservar.`
        );

        return [
          offer.id,
          cleanText(offer.title || `${destinationName} · Trhoncal Travel`),
          description,
          'in stock',
          'new',
          `${price.toFixed(2)} MXN`,
          `https://${PUBLIC_HOST}/oferta/${encodeURIComponent(offer.id)}`,
          cleanText(offer.image),
          'Trhoncal Travel',
          'Viajes > Hotel',
          destinationName,
          cleanText(offer.hotel || ''),
          cleanText(offer.plan || ''),
          cleanText(offer.occasionId || ''),
          cleanText(offer.commercialType || 'TARIFA_DINAMICA')
        ];
      })
      .filter(Boolean);

    const csv = [headers, ...rows].map(csvRow).join('\n') + '\n';
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="trhoncal-travel-meta-feed.csv"');
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.status(200).send(csv);
  } catch (error) {
    console.error('Could not build Trhoncal Travel Meta feed', error);
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(502).send('Could not build Meta feed');
  }
}
