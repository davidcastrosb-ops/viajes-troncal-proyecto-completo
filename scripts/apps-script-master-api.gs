/**
 * Trhoncal Travel — Public JSON API from the Master Sheet
 *
 * Intended use:
 * 1) Bind this script to the Google Sheets version of the Trhoncal Travel Master.
 * 2) Deploy as Web App, execute as owner, access: anyone with the link.
 * 3) Put the deployment URL in assets/data/site.json -> data.masterEndpoint.
 *
 * SECURITY / PRIVACY:
 * - Returns ONLY explicitly public fields.
 * - Does not expose provider URLs, internal notes, margins, commissions or private fields.
 * - Destinations require Mostrar_Web=Sí AND a verified/approved/published research state.
 * - Offers require Mostrar_Web=Sí, Publicable=Sí, a confirmed-price date, and no expired web date.
 */

function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const now = new Date();
  const payload = {
    version: '1.0',
    generatedAt: now.toISOString(),
    destinations: buildPublicDestinations_(ss),
    offers: buildPublicOffers_(ss, now),
    sources: buildPublicSources_(ss)
  };

  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function buildPublicDestinations_(ss) {
  const rows = sheetObjects_(ss, '01_Destinos');
  const allowedStates = ['Verificado', 'Aprobado', 'Publicado'];

  return rows
    .filter(r => text_(r.Mostrar_Web) === 'Sí' && allowedStates.includes(text_(r.Estado_investigación)))
    .sort((a, b) => number_(a.Orden_Home, 999) - number_(b.Orden_Home, 999))
    .map(r => ({
      id: text_(r.Destino_ID),
      name: text_(r.Nombre),
      state: text_(r['Estado/Región']),
      country: text_(r.País),
      puebloMagico: /^sí$/i.test(text_(r.Pueblo_Mágico)),
      segments: splitList_(r.Segmentos),
      status: 'published',
      featured: text_(r.Destacado_Home) === 'Sí',
      order: number_(r.Orden_Home, 999),
      lastVerified: dateISO_(r.Última_verificación),
      sourceId: text_(r.Fuente_principal_ID),
      ficheId: text_(r.Ficha_ID)
    }));
}

function buildPublicOffers_(ss, now) {
  const rows = sheetObjects_(ss, '07_Ofertas_Vigentes');

  return rows
    .filter(r => {
      const show = text_(r.Mostrar_Web) === 'Sí';
      const publicable = text_(r.Publicable) === 'Sí';
      const confirmed = !!dateValue_(r.Ultima_Confirmacion_Precio);
      const expires = dateValue_(r.Fecha_Expiracion_Web);
      const notExpired = !expires || endOfDay_(expires) >= now;
      return show && publicable && confirmed && notExpired;
    })
    .sort((a, b) => number_(a.Orden_Web, 999) - number_(b.Orden_Web, 999))
    .map(r => ({
      id: text_(r.Oferta_ID),
      destinationId: text_(r.Destino_ID),
      title: text_(r.Título),
      hotel: text_(r.Hotel),
      days: number_(r.Días, null),
      nights: number_(r.Noches, null),
      plan: text_(r.Plan),
      price: formatPrice_(r.Precio_MXN, r.Unidad_precio),
      priceValue: number_(r.Precio_MXN, null),
      currency: 'MXN',
      priceUnit: text_(r.Unidad_precio),
      occupancy: text_(r.Ocupación),
      featured: text_(r.Destacada_Home) === 'Sí',
      order: number_(r.Orden_Web, 999),
      lastConfirmed: dateISO_(r.Ultima_Confirmacion_Precio),
      expiresAt: dateISO_(r.Fecha_Expiracion_Web),
      publicable: true
    }));
}

function buildPublicSources_(ss) {
  const rows = sheetObjects_(ss, '05_Fuentes');
  return rows
    .filter(r => text_(r.Fuente_ID) && /^A_/.test(text_(r.Nivel)))
    .map(r => ({
      id: text_(r.Fuente_ID),
      organization: text_(r['Organismo/Fuente']),
      type: text_(r.Tipo),
      title: text_(r['Título/uso']),
      url: text_(r.URL),
      verifiedAt: dateISO_(r.Fecha_verificación),
      status: text_(r.Estado)
    }));
}

function sheetObjects_(ss, sheetName) {
  const sh = ss.getSheetByName(sheetName);
  if (!sh) return [];
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(h => text_(h));
  return values.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { if (h) obj[h] = row[i]; });
    return obj;
  });
}

function text_(value) {
  return value == null ? '' : String(value).trim();
}

function splitList_(value) {
  return text_(value).split(';').map(v => v.trim()).filter(Boolean);
}

function number_(value, fallback) {
  if (value === '' || value == null) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function dateValue_(value) {
  if (value instanceof Date && !isNaN(value)) return value;
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d) ? null : d;
}

function dateISO_(value) {
  const d = dateValue_(value);
  if (!d) return '';
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function endOfDay_(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function formatPrice_(price, unit) {
  const n = number_(price, null);
  if (n == null) return '';
  const suffix = text_(unit) ? ' · ' + text_(unit) : '';
  return '$' + Math.round(n).toLocaleString('es-MX') + ' MXN' + suffix;
}
