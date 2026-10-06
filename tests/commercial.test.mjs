import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const contract = await fs.readFile(new URL('../assets/js/commercial.js', import.meta.url), 'utf8');
const context = vm.createContext({ Intl, Date });
vm.runInContext(contract, context);
const commercial = context.TravelCommercial;
const cases = [
  { id: 'FRIENDLY', price: '$11,714', priceUnit: 'total por estancia', persons: 2, total: 1171400, person: 585700 },
  { id: 'DECAMERON', price: 4511, priceUnit: 'por habitación por noche', rooms: 2, persons: 2, nights: 2, total: 1804400, person: 902200 },
  { id: 'SUNSCAPE', price: '$18,947', priceUnit: 'total por estancia', persons: 2, note: 'Total $18,947.02 MXN.', total: 1894702, person: 947351 }
];
for (const offer of cases) test(offer.id + ': exact amounts and Meta formatting', () => {
  assert.equal(commercial.amounts(offer).totalCents, offer.total);
  assert.equal(commercial.amounts(offer).personCents, offer.person);
  assert.equal(commercial.formatCents(offer.person, true), (offer.person / 100).toFixed(2) + ' MXN');
});
test('all five price bases use only explicit positive integer multipliers', () => {
  for (const [unit, data, expected] of [
    ['por habitación por noche', { rooms: 2, nights: 3 }, 600],
    ['por persona por noche', { persons: 2, nights: 3 }, 600],
    ['por persona por estancia', { persons: 2 }, 200],
    ['total por estancia', {}, 100], ['por paquete', {}, 100]
  ]) assert.equal(commercial.tripTotal({ price: 100, priceUnit: unit, ...data }), expected);
  for (const unit of ['por habitación por noche', 'por persona por noche', 'por persona por estancia']) {
    for (const invalid of [undefined, '', 0, -1, 1.5, Infinity, 'dos']) {
      assert.equal(commercial.tripTotal({ price: 100, priceUnit: unit, rooms: invalid, persons: invalid, nights: invalid }), null);
    }
  }
});
test('decimal half-up rounding divides exact amounts before settlement', () => {
  assert.equal(commercial.money('1.005'), '$1.01');
  const result = commercial.amounts({ price: '10.004', priceUnit: 'por paquete', persons: 3 });
  assert.equal(result.totalCents, 1000);
  assert.equal(result.personCents, 333);
  assert.equal(commercial.money('1.015'), '$1.02');
  assert.equal(commercial.tripTotal({ price: 'Consultar', priceUnit: 'por paquete' }), null);
  assert.equal(commercial.amounts({ price: '10', priceValue: '10.02', priceUnit: 'por paquete' }).totalCents, 1002);
  assert.equal(commercial.amounts({ price: '100', note: 'Total $900.02 MXN.', priceUnit: 'por paquete' }).totalCents, 10000);
});
test('expiry is inclusive on the Mexico City date, including upstream master offers', () => {
  const now = new Date('2026-10-07T01:00:00Z'); // still October 6 in Mexico City
  assert.equal(commercial.visible({ _fromMaster: true, expiresAt: '2026-10-05' }, now), false);
  assert.equal(commercial.visible({ expiresAt: '2026-10-06' }, now), true);
  assert.equal(commercial.visible({ showWeb: false }, now), false);
  assert.equal(commercial.visible({ status: 'suspendida' }, now), false);
});
test('Desde and deposits require explicit authorization', () => {
  assert.equal(commercial.prefix({ commercialType: 'TARIFA_DINAMICA', priceUnit: 'por habitación por noche' }), '');
  assert.equal(commercial.prefix({ commercialType: 'CAMPANA_DESDE' }), 'Desde');
  for (const value of [false, 'No', 'false', undefined]) assert.equal(commercial.deposits(value), false);
  for (const value of [true, 'Sí', 'si']) assert.equal(commercial.deposits(value), true);
});
async function handler(path, payload) {
  const ctx = vm.createContext({ Intl, Date, URL, URLSearchParams, AbortController, setTimeout, clearTimeout, console, process: { env: {} }, fetch: async () => ({ ok: true, json: async () => payload, text: async () => JSON.stringify(payload) }) });
  const mod = new vm.SourceTextModule(await fs.readFile(new URL('../' + path, import.meta.url), 'utf8'), { context: ctx });
  await mod.link(async name => {
    assert.equal(name, '../assets/js/commercial.js');
    return new vm.SourceTextModule(contract, { context: ctx });
  });
  await mod.evaluate();
  return mod.namespace.default;
}
const response = () => ({ code: 200, headers: {}, body: '', setHeader(k,v) { this.headers[k]=v; }, status(n) { this.code=n; return this; }, send(v) { this.body=v; return this; }, json(v) { this.body=v; return this; } });
test('individual offers share total/person hierarchy and gate expired offers', async () => {
  for (const offer of cases) {
    const run = await handler('api/offer.js', { offers: [offer] });
    const res = response(); await run({ method: 'GET', query: { id: offer.id }, headers: { host: 'viajes.trhoncalhomes.com.mx' } }, res);
    assert.equal(res.code, 200);
    assert.ok(res.body.indexOf('Total del viaje') < res.body.indexOf('Por persona'));
    assert.ok(res.body.includes(commercial.formatCents(offer.total)));
    assert.ok(res.body.includes(commercial.formatCents(offer.person)));
    assert.match(res.body, /Hasta 18 meses con tarjetas participantes/);
    assert.match(res.body, /content="index,follow/);
  }
  const run = await handler('api/offer.js', { offers: [{ ...cases[0], expiresAt: '2000-01-01' }] });
  const res = response(); await run({ method: 'GET', query: { id: cases[0].id }, headers: {} }, res);
  assert.equal(res.code, 404); assert.equal(res.headers['X-Robots-Tag'], 'noindex, nofollow');
});
test('Meta feed preserves its contract, excludes expired/incomplete offers and uses exact person cents', async () => {
  const offers = cases.map(o => ({ ...o, image: 'https://viajes.trhoncalhomes.com.mx/assets/example.jpg' }));
  offers.push({ ...offers[0], id: 'EXPIRED', expiresAt: '2000-01-01' });
  offers.push({ ...offers[1], id: 'INCOMPLETE', rooms: undefined });
  const run = await handler('api/master.js', { offers }); const res = response();
  await run({ method: 'GET', query: { format: 'meta' } }, res);
  assert.equal(res.code, 200); assert.match(res.headers['Content-Type'], /text\/csv/);
  for (const offer of cases) assert.ok(res.body.includes(commercial.formatCents(offer.person, true)));
  assert.doesNotMatch(res.body, /EXPIRED|INCOMPLETE|PriceAgencies|meses sin intereses/i);
  assert.equal(res.body.trim().split('\n').length, 4);
});
test('Apps Script only grants Desde from explicit Tipo_comercial', async () => {
  const source = await fs.readFile(new URL('../apps-script/Code.gs', import.meta.url), 'utf8');
  const ctx = vm.createContext({}); vm.runInContext(source, ctx);
  assert.equal(ctx.commercialType_('', 'por habitación por noche'), 'TARIFA_DINAMICA');
  assert.equal(ctx.commercialType_('TARIFA_DINAMICA', 'promedio por noche'), 'TARIFA_DINAMICA');
  assert.equal(ctx.commercialType_('CAMPANA_DESDE', 'total por estancia'), 'CAMPANA_DESDE');
});
test('the actual home renderer uses one hierarchy, four CTAs and hides a fully visible carousel', async () => {
  const control = () => ({ addEventListener() {}, setAttribute() {}, hidden: false, textContent: '' });
  const controls = new Map();
  const toolbar = { hidden: false, querySelector(selector) { if (!controls.has(selector)) controls.set(selector, control()); return controls.get(selector); } };
  const grid = { innerHTML: '', classList: { add() {}, toggle() {} }, addEventListener() {}, querySelectorAll(selector) { return selector === '.promo-maker-card' ? [{}, {}, {}] : []; } };
  const section = { hidden: false, dataset: {}, querySelector() { return toolbar; } };
  const offers = cases.map(o => ({ ...o, hotel: o.id, title: o.id, _fromMaster: true }));
  offers.push({ ...offers[0], id: 'EXPIRED', expiresAt: '2000-01-01' });
  const ctx = vm.createContext({ Intl, Date, URL, console, clearInterval, setInterval, OFFERS: offers, DESTINATIONS: [], escapeHTML: value => String(value), publicSafeText: value => value, whatsappLink: () => 'https://wa.me/523329279412', document: { hidden: false, getElementById: id => id === 'promosCards' ? grid : section, querySelector: () => null, addEventListener() {} }, window: { innerWidth: 1440, location: { origin: 'https://example.test', href: 'https://example.test' }, matchMedia: () => ({ matches: true }), addEventListener() {} } });
  vm.runInContext(contract, ctx);
  ctx.isOfferVisible = offer => ctx.TravelCommercial.visible(offer);
  vm.runInContext(await fs.readFile(new URL('../assets/js/promo-maker-v1.js', import.meta.url), 'utf8'), ctx);
  ctx.window.renderOffers();
  assert.equal(toolbar.hidden, true);
  assert.doesNotMatch(grid.innerHTML, /EXPIRED|promo-maker-price|meses sin intereses/);
  for (const offer of cases) assert.ok(grid.innerHTML.includes(commercial.formatCents(offer.total)));
  const cards = grid.innerHTML.split('<article class="promo-maker-card">').slice(1);
  assert.equal(cards.length, 3);
  for (const html of cards) {
    assert.ok(html.indexOf('Total del viaje') < html.indexOf('Por persona'));
    assert.ok(html.indexOf('Por persona') < html.indexOf('Hasta 18 meses con tarjetas participantes'));
    assert.equal((html.match(/class="promo-maker-cta /g) || []).length, 4);
  }
});
test('concise notes preserve taxes and dates after removing repeated price sentences', () => {
  const offer = { ...cases[0], rooms: 1, occupancy: '2 adultos' };
  const note = commercial.shortNote(offer, 'Precio total por estancia para 2 adultos. Viaje del 14 al 16 de noviembre. Impuestos incluidos. Disponibilidad sujeta a reconfirmación.');
  assert.match(note, /1 habitación y 2 adultos/);
  assert.match(note, /Viaje del 14 al 16/);
  assert.match(note, /Impuestos incluidos/);
  assert.match(note, /reconfirmación/);
  assert.match(commercial.shortNote(offer, 'Precio total incluye transportación y desayuno.'), /incluye transportación y desayuno/);
});
test('offer and PDF routes reserve enough time for observed Apps Script latency', async () => {
  const config = JSON.parse(await fs.readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  for (const route of ['api/offer.js','api/offer-pdf.js','api/offer-pdf-v2.js']) {
    const source = await fs.readFile(new URL('../' + route, import.meta.url), 'utf8');
    assert.match(source, /setTimeout\([\s\S]{0,50}abort\(\),\s*30000\)/);
    assert.ok(config.functions[route].maxDuration >= 60);
  }
});
