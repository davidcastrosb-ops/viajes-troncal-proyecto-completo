const LEAD_ENDPOINT = process.env.TRHONCAL_LEAD_ENDPOINT ||
  process.env.TRHONCAL_MASTER_ENDPOINT ||
  'https://script.google.com/macros/s/AKfycbxq6OxUnMWH004OKyspo7eAbI0GvJvwwDgSnfffSzn9amtKzOWqaDmtWUnrk52rz7U8/exec';

const PUBLIC_ORIGIN = 'https://viajes.trhoncalhomes.com.mx';
const UPSTREAM_TIMEOUT_MS = 40000;

function clean(value = '', max = 200) {
  return String(value == null ? '' : value)
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function safeText(value = '', max = 200) {
  const text = clean(value, max);
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function normalize(body = {}) {
  return {
    action: 'submitLead',
    website: clean(body.website, 120),
    nombre: safeText(body.nombre, 80),
    apellido: safeText(body.apellido, 80),
    whatsapp: clean(body.whatsapp, 30),
    destino: safeText(body.destino, 140),
    ciudadSalida: safeText(body.ciudadSalida, 120),
    fechaSalida: clean(body.fechaSalida, 20),
    fechaRegreso: clean(body.fechaRegreso, 20),
    personas: clean(body.personas, 8),
    adultos: clean(body.adultos, 4),
    menores: clean(body.menores, 4),
    edadesMenores: safeText(body.edadesMenores, 120),
    hospedaje: safeText(body.hospedaje, 40),
    origen: safeText(body.origen, 50),
    urlOrigen: safeText(body.urlOrigen, 500),
    slugDestino: safeText(body.slugDestino, 160),
    utmSource: safeText(body.utmSource, 120),
    utmMedium: safeText(body.utmMedium, 120),
    utmCampaign: safeText(body.utmCampaign, 160),
    ocasionId: safeText(body.ocasionId, 120),
    ofertaId: safeText(body.ofertaId, 120),
    promoUrl: safeText(body.promoUrl, 500),
    ctaOrigen: safeText(body.ctaOrigen, 120),
    consentimiento: body.consentimiento === true
  };
}

function validISODate(value = '') {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime());
}

function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseAges(value = '') {
  return String(value || '')
    .replace(/^'/, '')
    .split(/[,;|\s]+/)
    .map(v => v.trim())
    .filter(Boolean)
    .map(Number);
}

function validate(lead) {
  if (!lead.nombre) return 'Escribe tu nombre.';
  const digits = lead.whatsapp.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return 'Revisa tu WhatsApp.';
  if (!lead.destino) return 'Indica el destino o escribe “Ayúdame a elegir”.';
  if (!lead.ciudadSalida) return 'Indica tu ciudad de salida.';
  if (!lead.fechaSalida || !validISODate(lead.fechaSalida)) return 'Indica una fecha aproximada de salida válida.';
  if (lead.fechaSalida < todayISO()) return 'La fecha de salida no puede estar en el pasado.';
  if (lead.fechaRegreso) {
    if (!validISODate(lead.fechaRegreso)) return 'Revisa la fecha aproximada de regreso.';
    if (lead.fechaRegreso < lead.fechaSalida) return 'La fecha de regreso no puede ser anterior a la salida.';
  }
  const people = Number(lead.personas);
  if (!Number.isFinite(people) || people < 1 || people > 99) return 'Revisa el número de viajeros.';

  const hasFamilyBreakdown = lead.adultos !== '' || lead.menores !== '' || lead.edadesMenores !== '';
  if (hasFamilyBreakdown) {
    const adults = Number(lead.adultos);
    const children = Number(lead.menores || 0);
    if (!Number.isInteger(adults) || adults < 1 || adults > 20) return 'Revisa el número de adultos.';
    if (!Number.isInteger(children) || children < 0 || children > 20) return 'Revisa el número de menores.';
    if (adults + children !== people) return 'El total de viajeros no coincide con adultos y menores.';
    const ages = parseAges(lead.edadesMenores);
    if (children > 0 && ages.length !== children) return 'Indica la edad de cada menor.';
    if (ages.some(age => !Number.isInteger(age) || age < 0 || age > 17)) return 'Revisa las edades de los menores.';
    if (children === 0 && ages.length) return 'Indicaste edades de menores, pero el número de menores es 0.';
  }

  if (!['Todo incluido', 'Sin todo incluido', 'Recomiéndame'].includes(lead.hospedaje.replace(/^'/, ''))) return 'Elige una preferencia de hospedaje.';
  if (!lead.consentimiento) return 'Necesitamos tu autorización para contactarte.';
  return '';
}

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, message: 'Trhoncal Travel lead endpoint activo' });
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'Método no permitido.' });
  }

  const origin = String(req.headers.origin || '');
  if (origin && origin !== PUBLIC_ORIGIN && !origin.endsWith('.vercel.app')) {
    return res.status(403).json({ ok: false, error: 'Origen no permitido.' });
  }

  const contentType = String(req.headers['content-type'] || '').toLowerCase();
  if (contentType && !contentType.includes('application/json')) {
    return res.status(415).json({ ok: false, error: 'Formato no permitido.' });
  }

  const lead = normalize(req.body || {});
  if (lead.website) return res.status(200).json({ ok: true, leadId: 'IGNORED' });

  const validationError = validate(lead);
  if (validationError) return res.status(400).json({ ok: false, error: validationError });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const upstream = await fetch(LEAD_ENDPOINT, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TrhoncalTravel-Lead/2.4'
      },
      body: JSON.stringify(lead),
      signal: controller.signal
    });

    const text = await upstream.text();
    let payload;
    try { payload = JSON.parse(text); } catch (_) { payload = null; }

    if (!upstream.ok || !payload || payload.ok !== true) {
      return res.status(502).json({
        ok: false,
        error: payload && payload.error ? payload.error : 'No pudimos registrar la solicitud.'
      });
    }

    return res.status(200).json({
      ok: true,
      leadId: payload.leadId || '',
      emailSent: payload.emailSent === true
    });
  } catch (error) {
    const timeoutError = error && error.name === 'AbortError';
    return res.status(502).json({
      ok: false,
      error: timeoutError ? 'El registro tardó demasiado.' : 'No pudimos registrar la solicitud.'
    });
  } finally {
    clearTimeout(timeout);
  }
}
