/* One public pricing contract, loaded by classic scripts and server side-effect imports.
 * Exact decimal arithmetic until settlement: positive amounts round half-up to cents.
 * Person amounts divide the exact trip amount before rounding (never a rounded card value).
 */
(() => {
  function decimal(value) {
    const raw = String(value ?? '').trim().replace(/[$,\s]|MXN/gi, '');
    if (!/^\d+(?:\.\d+)?$/.test(raw)) return null;
    const [whole, fraction = ''] = raw.split('.');
    const numerator = BigInt(whole + fraction), denominator = 10n ** BigInt(fraction.length);
    return numerator > 0n ? { numerator, denominator } : null;
  }
  function count(value) {
    const n = Number(value);
    return Number.isSafeInteger(n) && n > 0 ? n : null;
  }
  function cents(amount, divisor = 1) {
    if (!amount || !count(divisor)) return null;
    const denominator = amount.denominator * BigInt(divisor);
    const result = (amount.numerator * 200n + denominator) / (2n * denominator);
    return result <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(result) : null;
  }
  function exactTrip(offer = {}) {
    const unit = String(offer.priceUnit || '').toLowerCase();
    let amount = decimal(offer.priceValue ?? offer.price);
    // Compatibility with the deployed endpoint that rounds its display price to pesos.
    // Recover only one explicitly labelled total from the public note, for a total unit,
    // and only when it agrees with that display price to within half a peso.
    if (offer.priceValue == null && /total\s+por\s+estancia|por\s+paquete/.test(unit)) {
      const matches = Array.from(String(offer.note || '').matchAll(/\bTotal\s+\$([\d,]+\.\d{2})\s*MXN\b/gi));
      const exact = matches.length === 1 ? decimal(matches[0][1]) : null;
      if (amount && exact && Math.abs(Number(exact.numerator) / Number(exact.denominator) - Number(amount.numerator) / Number(amount.denominator)) <= .5) amount = exact;
    }
    if (!amount) return null;
    let factors;
    if (/por\s*habitaci[oó]n.*noche/.test(unit)) factors = [count(offer.rooms), count(offer.nights)];
    else if (/por\s*persona.*noche/.test(unit)) factors = [count(offer.persons), count(offer.nights)];
    else if (/por\s*persona.*estancia/.test(unit)) factors = [count(offer.persons)];
    else if (/total\s+por\s+estancia|por\s+paquete/.test(unit)) factors = [];
    else return null;
    if (factors.some(n => n === null)) return null;
    return { numerator: factors.reduce((n, factor) => n * BigInt(factor), amount.numerator), denominator: amount.denominator };
  }
  function amounts(offer = {}) {
    const exact = exactTrip(offer), people = count(offer.persons);
    return { totalCents: cents(exact), personCents: people ? cents(exact, people) : null };
  }
  function formatCents(value, meta = false) {
    if (value === null || !Number.isSafeInteger(value) || value < 0) return '';
    const whole = Math.floor(value / 100), fraction = String(value % 100).padStart(2, '0');
    if (meta) return `${whole}.${fraction} MXN`;
    return `$${new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(whole)}${value % 100 ? '.' + fraction : ''}`;
  }
  function money(value) { return formatCents(cents(decimal(value))); }
  function tripTotal(offer) { const n = amounts(offer).totalCents; return n === null ? null : n / 100; }
  function perPerson(offer) { const n = amounts(offer).personCents; return n === null ? null : n / 100; }
  function today(now = new Date()) {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
    const part = name => parts.find(p => p.type === name).value;
    return `${part('year')}-${part('month')}-${part('day')}`;
  }
  function visible(offer, now = new Date()) {
    if (!offer) return false;
    if ([offer.showWeb, offer.mostrarWeb, offer.publicable].some(value => value === false)) return false;
    if (/^(expired|expirada|suspended|suspendida|draft|borrador)$/i.test(String(offer.status || ''))) return false;
    const expiry = String(offer.expiresAt || offer.fechaExpiracionWeb || offer.expirationDate || '').trim();
    if (expiry && (!/^\d{4}-\d{2}-\d{2}$/.test(expiry) || expiry < today(now))) return false;
    return true;
  }
  function deposits(value) { return value === true || /^(sí|si)$/i.test(String(value || '').trim()); }
  function prefix(offer) { return String(offer.commercialType || '').toUpperCase() === 'CAMPANA_DESDE' ? 'Desde' : ''; }
  function shortNote(offer, safeNote) {
    if (amounts(offer).totalCents === null) return safeNote;
    // Only remove repeated price/quantity sentences. Preserve dates, taxes and all conditions.
    const duplicate = /^(?:Precio total (?:por estancia|del viaje) para (?:\d+ (?:habitación|habitaciones) y )?\d+ adultos(?:, \d+ noches)?|Precio por habitación por noche: \$[\d,.]+ MXN|Esta opción contempla \d+ habitaciones durante \d+ noches|Total(?: de esta opción:)? \$[\d,.]+ MXN|Precio por persona \$[\d,.]+ MXN)\.$/i;
    const conditions = safeNote.split(/(?<=\.)\s+/).filter(sentence => !duplicate.test(sentence)).join(' ');
    const rooms = count(offer.rooms), persons = count(offer.persons);
    const occupancy = String(offer.occupancy || '').trim();
    const basis = [rooms ? `${rooms} ${rooms === 1 ? 'habitación' : 'habitaciones'}` : '', persons ? (occupancy || `${persons} personas`) : ''].filter(Boolean).join(' y ');
    return `${basis ? 'Precio para ' + basis + '. ' : ''}${conditions}`.trim();
  }
  globalThis.TravelCommercial = Object.freeze({ amounts, formatCents, money, tripTotal, perPerson, visible, deposits, prefix, count, shortNote });
})();
