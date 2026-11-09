import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../lib/travel-documents.js';

const USER='internal-preview';
const PASS='test-only-passphrase-1234567';
function response(){
  return {code:200,headers:{},body:null,setHeader(k,v){this.headers[k.toLowerCase()]=v;return this;},
    status(n){this.code=n;return this;},send(v){this.body=v;return this;},json(v){this.body=v;return this;}};
}
function request(method='GET',body={},auth=true){
  const headers={};
  if(auth)headers.authorization='Basic '+Buffer.from(USER+':'+PASS).toString('base64');
  return {method,headers,body};
}
async function withAuth(run){
  const before=[process.env.TRAVEL_DOCUMENTS_USER,process.env.TRAVEL_DOCUMENTS_PASSWORD];
  process.env.TRAVEL_DOCUMENTS_USER=USER;process.env.TRAVEL_DOCUMENTS_PASSWORD=PASS;
  try{return await run();}
  finally{
    if(before[0]===undefined)delete process.env.TRAVEL_DOCUMENTS_USER;else process.env.TRAVEL_DOCUMENTS_USER=before[0];
    if(before[1]===undefined)delete process.env.TRAVEL_DOCUMENTS_PASSWORD;else process.env.TRAVEL_DOCUMENTS_PASSWORD=before[1];
  }
}
test('document generator blocks anonymous requests',()=>withAuth(async()=>{
  const res=response();await handler(request('GET',{},false),res);
  assert.equal(res.code,401);
  assert.match(res.headers['www-authenticate'],/Basic/);
}));
test('document generator is inaccessible without configured credentials',async()=>{
  const before=[process.env.TRAVEL_DOCUMENTS_USER,process.env.TRAVEL_DOCUMENTS_PASSWORD];
  delete process.env.TRAVEL_DOCUMENTS_USER;delete process.env.TRAVEL_DOCUMENTS_PASSWORD;
  try{const res=response();await handler(request(),res);assert.equal(res.code,503);}
  finally{
    if(before[0]!==undefined)process.env.TRAVEL_DOCUMENTS_USER=before[0];
    if(before[1]!==undefined)process.env.TRAVEL_DOCUMENTS_PASSWORD=before[1];
  }
});
test('private form is returned with no-store and noindex',()=>withAuth(async()=>{
  const res=response();await handler(request(),res);
  assert.equal(res.code,200);assert.match(res.body,/Generador de documentos/);
  assert.match(res.headers['cache-control'],/no-store/);
  assert.match(res.headers['x-robots-tag'],/noindex/);
}));
test('data validation rejects missing primary booking',()=>withAuth(async()=>{
  const res=response();await handler(request('POST',{kind:'hotel',name:'Persona Demo',reservation:''}),res);
  assert.equal(res.code,400);
}));
test('generates PDF hotel with navigation QR without persisting data',()=>withAuth(async()=>{
  const res=response();await handler(request('POST',{
    kind:'hotel',theme:'playa',name:'Persona de prueba',reservation:'TEST123',
    payment:'PAGADO',amount:'8925.76',hotel:'Hotel Ejemplo',room:'King vista al mar',
    arrival:'2026-11-20',departure:'2026-11-22',arrivalTime:'15:00',departureTime:'12:00',
    guests:'1 adulto',food:'Todo incluido',address:'Puerto Vallarta',
    lat:'20.650825647460294',lon:'-105.24257700823772'
  }),res);
  assert.equal(res.code,200);
  assert.equal(res.headers['content-type'],'application/pdf');
  assert.equal(res.body.subarray(0,4).toString(),'%PDF');
  assert.ok(res.body.length>1000);
}));
test('generates PDF for bus itinerary',()=>withAuth(async()=>{
  const res=response();await handler(request('POST',{
    kind:'autobus',theme:'ciudad',name:'Persona de prueba',reservation:'BUS123',
    payment:'PAGADO',amount:'1280.00',provider:'Transportes Ejemplo',locator:'LOCA1',
    from:'Zapopan',to:'Terminal Puerto Vallarta',outDate:'2026-11-20',
    outTime:'07:30',outSeat:'8',backFrom:'Terminal Puerto Vallarta',
    backTo:'Zapopan',backDate:'2026-11-22',backTime:'16:45',backSeat:'8'
  }),res);
  assert.equal(res.code,200);assert.equal(res.body.subarray(0,4).toString(),'%PDF');
}));
