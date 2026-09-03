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
