import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

async function loadHandler(path, fetchImpl) {
  const source = await fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8');
  const context = vm.createContext({
    console,
    URL,
    URLSearchParams,
    Intl,
    Date,
    AbortController,
    setTimeout,
    clearTimeout,
    fetch: fetchImpl,
    process: { env: { VERCEL_ENV: 'preview' } }
  });
  const mod = new vm.SourceTextModule(source, { context });
  await mod.link(() => { throw new Error('Unexpected import'); });
  await mod.evaluate();
  return mod.namespace.default;
}

function mockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    send(body) { this.body = String(body); return this; }
  };
}

const emptyMaster = { destinations: [], offers: [], hotels: [], hotelImages: [] };
const jsonResponse = value => ({
  ok: true,
  status: 200,
  async json() { return value; }
});

test('quote-v2 neutraliza cierre de script en parámetros URL', async () => {
  const handler = await loadHandler('api/quote-v2.js', async () => jsonResponse(emptyMaster));
  const marker = "</script><script>globalThis.__TRHONCAL_XSS__=1</script>";
  const req = {
    method: 'GET',
    query: { cta: marker, destino: 'Puerto Vallarta' },
    headers: { host: 'preview.example.test' }
  };
  const res = mockRes();
  await handler(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.includes(marker), false, 'No debe conservar un </script> inyectado');
  assert.match(res.body, /\\u003c\/script>/, 'Debe neutralizar < dentro del JSON insertado en script');
  assert.match(res.body, /<form id="qv2"/, 'El formulario debe seguir renderizando');
});

test('hotel-v2 convierte assets conocidos del Preview a rutas del mismo origen', async () => {
  const preview = 'https://viajes-troncal-proye-git-2116d4-david-castros-projects-75de0086.vercel.app/assets/images/hoteles/barcelo-puerto-vallarta/01.jpg';
  const payload = {
    destinations: [{ id: 'MX-JAL-PVR-001', slug: 'puerto-vallarta', name: 'Puerto Vallarta' }],
    offers: [{
      id: 'OF-PA-PVR-SEP26-002', destinationId: 'MX-JAL-PVR-001', hotelId: 'HOT-PVR-BARCELO-001',
      title: 'Puerto Vallarta · Barceló Puerto Vallarta · Todo incluido', hotel: 'Barceló Puerto Vallarta',
      showWeb: true, price: 9948, priceUnit: 'precio total', occupancy: '2 adultos', plan: 'Todo incluido',
      travelStart: '2026-09-25', travelEnd: '2026-09-27', days: 3, nights: 2, leadDestinationVerified: 'Puerto Vallarta'
    }],
    hotels: [{ id: 'HOT-PVR-BARCELO-001', slug: 'barcelo-puerto-vallarta', name: 'Barceló Puerto Vallarta', destinationId: 'MX-JAL-PVR-001' }],
    hotelImages: [
      { hotelId: 'HOT-PVR-BARCELO-001', order: 1, url: preview, alt: 'Vista general de Barceló Puerto Vallarta' },
      { hotelId: 'HOT-PVR-BARCELO-001', order: 2, url: preview.replace('01.jpg','02.jpg'), alt: 'Exterior de Barceló Puerto Vallarta' }
    ]
  };
  const handler = await loadHandler('api/hotel-v2.js', async () => jsonResponse(payload));
  const req = {
    method: 'GET',
    query: { slug: 'barcelo-puerto-vallarta', oferta: 'OF-PA-PVR-SEP26-002' },
    headers: { host: 'preview.example.test', 'x-forwarded-host': 'preview.example.test', 'x-forwarded-proto': 'https' }
  };
  const res = mockRes();
  await handler(req, res);

  assert.equal(res.statusCode, 200);
  assert.match(res.body, /src="\/assets\/images\/hoteles\/barcelo-puerto-vallarta\/01\.jpg"/);
  assert.match(res.body, /const GALLERY=\[\{"url":"\/assets\/images\/hoteles\/barcelo-puerto-vallarta\/01\.jpg"/);
  assert.equal(res.body.includes('viajes-troncal-proye-git-2116d4-david-castros-projects-75de0086.vercel.app/assets/images/hoteles'), false,
    'El HTML no debe depender del host protegido del Preview para assets propios');
});

test('lead reserva tiempo suficiente para la latencia observada de Apps Script', async () => {
  const leadSource = await fs.readFile(new URL('../api/lead.js', import.meta.url), 'utf8');
  const vercel = JSON.parse(await fs.readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  const timeoutMatch = leadSource.match(/const\s+UPSTREAM_TIMEOUT_MS\s*=\s*(\d+)/);
  assert.ok(timeoutMatch, 'api/lead.js debe declarar un timeout explícito');
  assert.ok(Number(timeoutMatch[1]) >= 30000, 'El timeout upstream debe ser >= 30 s');
  assert.ok(Number(vercel?.functions?.['api/lead.js']?.maxDuration) >= 60, 'Vercel debe reservar al menos 60 s para api/lead.js');
});


test('Decameron conserva base por habitación por noche con habitaciones y personas explícitas', async () => {
  const payload = {
    destinations: [{ id: 'MX-NAY-NN-001', slug: 'nuevo-nayarit-bahia-de-banderas', name: 'Bucerías' }],
    offers: [{
      id: 'OF-PA-NAY-REV26-003',
      destinationId: 'MX-NAY-NN-001',
      hotelId: 'HOT-NAY-DECAMERON-001',
      title: 'Grand Decameron Complex · Todo incluido',
      hotel: 'Grand Decameron Complex, A Trademark All Inclusive',
      showWeb: true,
      price: 4511,
      priceUnit: 'por habitación por noche',
      commercialType: 'TARIFA_DINAMICA',
      rooms: 2,
      persons: 2,
      occupancy: '2 adultos',
      plan: 'Todo incluido',
      travelStart: '2026-11-14',
      travelEnd: '2026-11-16',
      days: 3,
      nights: 2
    }],
    hotels: [{
      id: 'HOT-NAY-DECAMERON-001',
      slug: 'grand-decameron-bucerias',
      name: 'Grand Decameron Complex, A Trademark All Inclusive',
      destinationId: 'MX-NAY-NN-001'
    }],
    hotelImages: []
  };
  const handler = await loadHandler('api/hotel-v2.js', async () => jsonResponse(payload));
  const req = {
    method: 'GET',
    query: { slug: 'grand-decameron-bucerias', oferta: 'OF-PA-NAY-REV26-003' },
    headers: { host: 'preview.example.test', 'x-forwarded-host': 'preview.example.test', 'x-forwarded-proto': 'https' }
  };
  const res = mockRes();
  await handler(req, res);

  assert.equal(res.statusCode, 200);
  assert.match(res.body, /Desde · Por habitación · por noche/);
  assert.match(res.body, />2 habitaciones</);
  assert.match(res.body, />2 personas</);
  assert.doesNotMatch(res.body, /Por persona · estancia completa/);
});


test('oferta compartida oculta referencias internas del proveedor', async () => {
  const payload = {
    destinations: [{ id: 'MX-NAY-NN-001', name: 'Bucerías' }],
    offers: [{
      id: 'OF-PA-NAY-REV26-003',
      destinationId: 'MX-NAY-NN-001',
      title: 'Grand Decameron Complex · Todo incluido',
      hotel: 'Grand Decameron Complex, A Trademark All Inclusive',
      showWeb: true,
      price: 4511,
      priceUnit: 'por habitación por noche',
      commercialType: 'TARIFA_DINAMICA',
      rooms: 2,
      persons: 2,
      note: 'En la captura directa de PriceAgencies el total mostrado por el proveedor fue distinto.'
    }]
  };
  const handler = await loadHandler('api/offer.js', async () => jsonResponse(payload));
  const req = { method: 'GET', query: { id: 'OF-PA-NAY-REV26-003' }, headers: { host: 'preview.example.test' } };
  const res = mockRes();
  await handler(req, res);
  assert.equal(res.statusCode, 200);
  assert.doesNotMatch(res.body, /PriceAgencies/i);
  assert.doesNotMatch(res.body, /mostrado por el proveedor/i);
  assert.match(res.body, /reconfirmaci[oó]n|reconfirmamos|reconfirmar/i);
});


test('Trhoncal Travel no publica el número de Homes', async () => {
  const files = [
    '../api/offer.js',
    '../api/offer-pdf.js',
    '../api/offer-pdf-v2.js',
    '../api/hotel-v2.js',
    '../assets/data/site.json',
    '../index.html'
  ];
  for (const path of files) {
    const source = await fs.readFile(new URL(path, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /33\s*2933\s*5952|523329335952/, path + ' no debe contener el WhatsApp de Trhoncal Homes');
  }
});


test('oferta no repite el hotel cuando ya viene en el título', async () => {
  const payload = {
    destinations: [{ id: 'MX-NAY-NN-001', name: 'Bucerías' }],
    offers: [{
      id: 'OF-PA-NAY-REV26-003',
      destinationId: 'MX-NAY-NN-001',
      title: 'Puente de la Revolución · Grand Decameron Complex · Bucerías · Todo incluido',
      hotel: 'Grand Decameron Complex',
      showWeb: true,
      price: 4511,
      priceUnit: 'por habitación por noche',
      commercialType: 'TARIFA_DINAMICA',
      rooms: 2,
      persons: 2,
      occupancy: '2 adultos',
      plan: 'Todo incluido'
    }]
  };
  const handler = await loadHandler('api/offer.js', async () => jsonResponse(payload));
  const req = { method: 'GET', query: { id: 'OF-PA-NAY-REV26-003' }, headers: { host: 'preview.example.test' } };
  const res = mockRes();
  await handler(req, res);
  assert.equal(res.statusCode, 200);
  assert.doesNotMatch(res.body, /class="offer-hotel"[^>]*><strong>Hotel:/);
});


test('promo maker usa cuatro CTA simétricos y sin flechas ambiguas', async () => {
  const source = await fs.readFile(new URL('../assets/js/promo-maker-v1.js', import.meta.url), 'utf8');
  assert.match(source, />Ver promoción</);
  assert.match(source, />Quiero este viaje</);
  assert.match(source, />Compartir promoción</);
  assert.match(source, />Prefiero WhatsApp</);
  assert.doesNotMatch(source, /Ver promoción →/);
  assert.doesNotMatch(source, /Quiero este viaje →/);
  assert.match(source, /promo-maker-whatsapp/);
});


test('offer-share no inyecta hotel duplicado', async () => {
  const source = await fs.readFile(new URL('../assets/js/offer-share-v1.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /createElement\(['"]p['"]\)[\s\S]{0,600}Hotel:/);
  assert.doesNotMatch(source, /dataset\.hotelBrand/);
  assert.match(source, /no debe crear subtítulos ni filas nuevas/i);
});


test('api master oculta datos internos de proveedor', async () => {
  const payload = {
    offers: [{
      id: 'OF-1',
      providerId: 'PROV-PA-001',
      Proveedor_ID: 'PROV-PA-001',
      URL_proveedor_interna: 'https://example.test/internal',
      publicPromoUrl: 'https://example.test/promotion/1',
      sharePromoUrl: 'https://example.test/promotion/1',
      note: 'Captura directa de PriceAgencies mostrada por el proveedor.'
    }],
    sources: [
      { id: 'SRC-1', level: 'Interna', organization: 'PriceAgencies' },
      { id: 'SRC-2', level: 'Pública', organization: 'Secretaría de Turismo' }
    ]
  };
  const handler = await loadHandler('api/master.js', async () => ({
    ok: true,
    status: 200,
    async text() { return JSON.stringify(payload); }
  }));
  const req = { method: 'GET', query: {}, headers: {} };
  const res = {
    statusCode: 200, headers: {}, body: null,
    setHeader(k,v){this.headers[k]=v;},
    status(code){this.statusCode=code;return this;},
    json(value){this.body=value;return this;}
  };
  await handler(req,res);
  assert.equal(res.statusCode,200);
  assert.equal(res.body.offers[0].providerId,undefined);
  assert.equal(res.body.offers[0].Proveedor_ID,undefined);
  assert.equal(res.body.offers[0].URL_proveedor_interna,undefined);
  assert.equal(res.body.offers[0].publicPromoUrl,undefined);
  assert.equal(res.body.offers[0].sharePromoUrl,undefined);
  assert.doesNotMatch(res.body.offers[0].note,/PriceAgencies|proveedor/i);
  assert.equal(res.body.sources.length,1);
  assert.equal(res.body.sources[0].id,'SRC-2');
});
