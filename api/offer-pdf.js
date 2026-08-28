import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as QRCode from 'qrcode';

const PUBLIC_HOST = 'viajes.trhoncalhomes.com.mx';
const MASTER_ENDPOINT = process.env.TRHONCAL_MASTER_ENDPOINT ||
  'https://script.google.com/macros/s/AKfycbxq6OxUnMWH004OKyspo7eAbI0GvJvwwDgSnfffSzn9amtKzOWqaDmtWUnrk52rz7U8/exec';

function clean(value = '') {
  return String(value == null ? '' : value)
    .replace(/[–—]/g, '-')
    .replace(/[•·]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/→|↗/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function money(value) {
  const n = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n)
    ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
    : clean(value);
}

function dateMx(value = '') {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return clean(value);
  const d = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${MASTER_ENDPOINT}${separator}_ts=${Date.now()}`, {
      method: 'GET', redirect: 'follow', cache: 'no-store', signal: controller.signal,
      headers: { 'User-Agent': 'TrhoncalTravel-OfferPDF/1.0', 'Cache-Control': 'no-cache' }
    });
    if (!response.ok) throw new Error(`Master ${response.status}`);
    const payload = await response.json();
    if (!payload || typeof payload !== 'object') throw new Error('Invalid Master payload');
    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

function wrap(text, font, size, maxWidth) {
  const words = clean(text).split(' ').filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) <= maxWidth) line = test;
    else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawWrapped(page, text, opts) {
  const { x, y, font, size, maxWidth, color, lineHeight = size * 1.28, maxLines = 20 } = opts;
  const lines = wrap(text, font, size, maxWidth).slice(0, maxLines);
  lines.forEach((line, i) => page.drawText(line, { x, y: y - i * lineHeight, font, size, color }));
  return y - lines.length * lineHeight;
}

async function fetchImage(pdfDoc, url) {
  if (!url) return null;
  try {
    const response = await fetch(url, { redirect: 'follow' });
    if (!response.ok) return null;
    const type = String(response.headers.get('content-type') || '').toLowerCase();
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (type.includes('png')) return await pdfDoc.embedPng(bytes);
    if (type.includes('jpeg') || type.includes('jpg')) return await pdfDoc.embedJpg(bytes);
    return null;
  } catch (_) {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method not allowed');
  }

  const id = String(req.query.id || '').trim();
  if (!id || !/^[A-Za-z0-9_-]+$/.test(id)) return res.status(404).send('Oferta no disponible');

  let payload;
  try {
    payload = await loadMaster();
  } catch (_) {
    return res.status(503).send('No pudimos generar la ficha en este momento.');
  }

  const offers = Array.isArray(payload.offers) ? payload.offers : [];
  const destinations = Array.isArray(payload.destinations) ? payload.destinations : [];
  const offer = offers.find(x => x && x.id === id);
  if (!offer) return res.status(404).send('Oferta no disponible');

  const destination = destinations.find(d => d && d.id === offer.destinationId) || null;
  const destinationName = clean(destination?.name || offer.leadDestinationVerified || 'Viaje especial');
  const canonical = `https://${PUBLIC_HOST}/oferta/${encodeURIComponent(offer.id)}`;
  const imageUrl = safeHttpUrl(offer.image || destination?.mainImage || '');
  const title = clean(offer.title || destinationName);
  const price = money(offer.price);
  const dates = [offer.travelStart ? dateMx(offer.travelStart) : '', offer.travelEnd ? dateMx(offer.travelEnd) : ''].filter(Boolean).join(' - ');
  const duration = [offer.days ? `${offer.days} días` : '', offer.nights ? `${offer.nights} noches` : ''].filter(Boolean).join(' / ');
  const includes = Array.isArray(offer.includes) ? offer.includes.map(clean).filter(Boolean) : [];

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`${title} | Trhoncal Travel`);
  pdfDoc.setAuthor('Trhoncal Travel');
  pdfDoc.setSubject('Ficha compartible de promoción de viaje');
  pdfDoc.setKeywords(['Trhoncal Travel', destinationName, 'viaje', 'promoción']);

  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const navy = rgb(0.024, 0.247, 0.325);
  const navyDark = rgb(0.012, 0.18, 0.243);
  const gold = rgb(0.847, 0.686, 0.345);
  const cream = rgb(0.969, 0.957, 0.925);
  const gray = rgb(0.36, 0.43, 0.46);
  const white = rgb(1, 1, 1);

  page.drawRectangle({ x: 0, y: 0, width, height, color: cream });
  page.drawRectangle({ x: 0, y: height - 92, width, height: 92, color: navy });
  page.drawText('TRHONCAL', { x: 42, y: height - 50, font: bold, size: 23, color: white });
  page.drawText('TRAVEL', { x: 43, y: height - 68, font: bold, size: 10, color: gold });
  page.drawText('Una opción para compartir', { x: 385, y: height - 55, font: regular, size: 10, color: white });

  let y = height - 126;
  const image = await fetchImage(pdfDoc, imageUrl);
  if (image) {
    const targetW = width - 84;
    const targetH = 205;
    const scale = Math.max(targetW / image.width, targetH / image.height);
    const drawW = image.width * scale;
    const drawH = image.height * scale;
    page.drawImage(image, {
      x: 42 + (targetW - drawW) / 2,
      y: y - targetH,
      width: drawW,
      height: drawH
    });
    page.drawRectangle({ x: 42, y: y - targetH, width: targetW, height: targetH, borderColor: rgb(.86,.82,.72), borderWidth: 1 });
    y -= targetH + 24;
  }

  y = drawWrapped(page, title, { x: 42, y, font: bold, size: 23, maxWidth: width - 84, color: navyDark, lineHeight: 27, maxLines: 3 }) - 8;
  page.drawText(destinationName, { x: 42, y, font: bold, size: 11, color: gold });
  y -= 24;

  const meta = [dates, duration, clean(offer.plan), clean(offer.occupancy)].filter(Boolean).join('  |  ');
  if (meta) {
    y = drawWrapped(page, meta, { x: 42, y, font: regular, size: 10.5, maxWidth: width - 84, color: gray, lineHeight: 14, maxLines: 3 }) - 8;
  }

  if (price) {
    page.drawText('PRECIO PUBLICADO', { x: 42, y, font: bold, size: 9, color: gold });
    page.drawText(price, { x: 42, y: y - 30, font: bold, size: 28, color: navy });
    page.drawText('MXN', { x: 170, y: y - 25, font: bold, size: 10, color: navy });
    y -= 52;
  }

  if (includes.length) {
    page.drawText('INCLUYE', { x: 42, y, font: bold, size: 10, color: navy });
    y -= 18;
    for (const item of includes.slice(0, 6)) {
      const nextY = drawWrapped(page, `- ${item}`, { x: 48, y, font: regular, size: 10, maxWidth: 315, color: gray, lineHeight: 14, maxLines: 2 });
      y = nextY - 3;
    }
  }

  const qrBuffer = await QRCode.toBuffer(canonical, { type: 'png', width: 220, margin: 1, color: { dark: '#063F53', light: '#FFFFFF' } });
  const qr = await pdfDoc.embedPng(qrBuffer);
  const qrSize = 112;
  const qrX = width - 42 - qrSize;
  const qrY = 102;
  page.drawRectangle({ x: qrX - 8, y: qrY - 8, width: qrSize + 16, height: qrSize + 16, color: white, borderColor: gold, borderWidth: 1 });
  page.drawImage(qr, { x: qrX, y: qrY, width: qrSize, height: qrSize });
  page.drawText('Escanea para ver la promoción', { x: qrX - 3, y: qrY - 25, font: bold, size: 8.3, color: navy });
  page.drawText('actualizada y compartirla.', { x: qrX + 8, y: qrY - 37, font: regular, size: 8.3, color: gray });

  const noteY = Math.min(y - 8, 205);
  page.drawText('IMPORTANTE', { x: 42, y: noteY, font: bold, size: 9, color: gold });
  drawWrapped(page, clean(offer.note || 'Precio, disponibilidad y condiciones se reconfirman antes de reservar.'), {
    x: 42, y: noteY - 17, font: regular, size: 9.3, maxWidth: 335, color: gray, lineHeight: 13, maxLines: 5
  });

  page.drawLine({ start: { x: 42, y: 76 }, end: { x: width - 42, y: 76 }, thickness: 1, color: rgb(.83,.78,.66) });
  page.drawText('Trhoncal Travel', { x: 42, y: 55, font: bold, size: 10, color: navy });
  page.drawText('WhatsApp 33 2933 5952  |  viajestroncal@gmail.com', { x: 42, y: 40, font: regular, size: 8.8, color: gray });
  page.drawText('Consulta siempre la versión vigente antes de pagar o reservar.', { x: 42, y: 26, font: regular, size: 8.3, color: gray });
  page.drawText('El QR abre la versión vigente de esta promoción en Trhoncal Travel.', { x: 312, y: 26, font: regular, size: 7.3, color: gray });

  const bytes = await pdfDoc.save();
  const safeName = clean(destinationName).replace(/[^A-Za-z0-9áéíóúÁÉÍÓÚñÑ]+/g, '-').replace(/^-|-$/g, '') || 'oferta';
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="Trhoncal-Travel-${safeName}.pdf"`);
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.status(200).send(Buffer.from(bytes));
}
