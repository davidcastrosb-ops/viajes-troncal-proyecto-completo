const MASTER_ENDPOINT = process.env.TRHONCAL_MASTER_ENDPOINT ||
  'https://script.google.com/macros/s/AKfycbxq6OxUnMWH004OKyspo7eAbI0GvJvwwDgSnfffSzn9amtKzOWqaDmtWUnrk52rz7U8/exec';

const VALID = new Set(['verified','verified-initial','approved','published']);
const HOTEL_FALLBACK = {
  'OF-PA-PVR-REV26-001':'friendly-fun-vallarta',
  'OF-PA-PVR-SEP26-002':'barcelo-puerto-vallarta',
  'OF-PA-NAY-REV26-003':'grand-decameron-bucerias'
};
const SEGMENT_FALLBACK = [
  {offerId:'OF-PA-PVR-REV26-001',segmentKey:'pareja',publicText:'Opción calculada para 2 adultos.',priority:1},
  {offerId:'OF-PA-PVR-SEP26-002',segmentKey:'pareja',publicText:'Opción calculada para 2 adultos.',priority:2},
  {offerId:'OF-PA-NAY-REV26-003',segmentKey:'pareja',publicText:'Precio publicado por persona para una ocupación de 2 adultos.',priority:1}
];
const DEFINITIONS = [
  {key:'pareja', title:'', description:''},
  {key:'familia-beneficio', eyebrow:'Viajar en familia', title:'Familias con menores con beneficio', description:'Opciones reales donde la edad y ocupación de los menores generan un beneficio publicado.'},
  {key:'juniors', eyebrow:'Viajar en familia', title:'Familias con juniors', description:'Opciones donde hijos mayores todavía pueden tener tarifa junior o de menor según el proveedor.'}
];

function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function safe(v=''){try{const u=new URL(String(v));return /^https?:$/.test(u.protocol)?u.toString():'';}catch(_){return '';}}
function numberMx(v=''){const n=Number(String(v).replace(/[^0-9.-]/g,''));return Number.isFinite(n)?new Intl.NumberFormat('es-MX',{maximumFractionDigits:0}).format(n):'';}
function dateMx(v=''){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(v)))return String(v||'');return new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'short',year:'numeric'}).format(new Date(`${v}T12:00:00`));}
function list(a=[]){return Array.isArray(a)&&a.length?`<ul>${a.slice(0,8).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p>Información disponible durante la asesoría.</p>';}
function yes(v){return v===true||/^(si|sí|yes|true|1)$/i.test(String(v||'').trim());}
function previewBanner(){return process.env.VERCEL_ENV==='production'?'':'<div class="hub-preview">VISTA PREVIA · HUB COMERCIAL DE DESTINO V2 · producción actual sigue intacta</div>';}
function priceUnit(o){const raw=String(o.priceUnit||'').trim();if(/por\s*persona/i.test(raw))return 'Por persona';if(/total/i.test(raw))return 'Total publicado';if(/desde/i.test(raw))return 'Desde';return raw||'Precio publicado';}
async function master(){const sep=MASTER_ENDPOINT.includes('?')?'&':'?';const c=new AbortController(),t=setTimeout(()=>c.abort(),10000);try{const r=await fetch(`${MASTER_ENDPOINT}${sep}_ts=${Date.now()}`,{cache:'no-store',redirect:'follow',signal:c.signal,headers:{'User-Agent':'TrhoncalTravel-HubV2/2.0'}});if(!r.ok)throw new Error('master');return await r.json();}finally{clearTimeout(t);}}
function visibleOffer(o){
  if(!o)return false;
  if(o.showWeb===false||/^(no|false|0)$/i.test(String(o.showWeb||'').trim()))return false;
  const exp=o.expirationDate||o.expiresAt||o.fechaExpiracionWeb||'';
  if(/^\d{4}-\d{2}-\d{2}$/.test(String(exp))&&new Date(`${exp}T23:59:59`)<new Date())return false;
  return true;
}
function hotelTarget(o,hotels){
  const h=hotels.find(x=>x&&o.hotelId&&x.id===o.hotelId);
  const slug=h?.slug||(o.hotelId?HOTEL_FALLBACK[o.id]:'')||'';
  return slug?{href:`/hotel-v2/${encodeURIComponent(slug)}?oferta=${encodeURIComponent(o.id)}`,label:'Conocer hotel y oferta →'}:{href:`/oferta/${encodeURIComponent(o.id)}`,label:'Ver promoción →'};
}
function familyEvidence(s){
  if(!s)return false;
  const children=Number(s.children||s.minors||0);
  const ages=Array.isArray(s.childAges)?s.childAges.filter(x=>String(x)!==''):[];
  const evidence=String(s.childBenefit||s.childFareType||s.publicText||'').trim();
  return children>0&&(ages.length>0||Boolean(evidence));
}
function validSegment(s){
  if(!s||!DEFINITIONS.some(d=>d.key===s.segmentKey))return false;
  if(s.segmentKey==='pareja')return true;
  return familyEvidence(s);
}
function segText(s){
  if(s.publicText)return s.publicText;
  const ages=Array.isArray(s.childAges)?s.childAges.filter(Boolean):[];
  if(s.segmentKey==='familia-beneficio')return `${s.adults||2} adultos + ${s.children||0} menores${ages.length?` de ${ages.join(', ')} años`:''}. ${s.childBenefit||'Beneficio infantil según condiciones publicadas.'}`;
  if(s.segmentKey==='juniors')return `${s.adults||2} adultos + ${s.children||0} juniors${ages.length?` de ${ages.join(', ')} años`:''}. ${s.childFareType||'Tarifa junior/de menor según proveedor.'}`;
  return '';
}
function grouping(offers,segments){
  const groups=new Map(DEFINITIONS.map(d=>[d.key,[]]));
  const byOffer=new Map();
  segments.filter(validSegment).forEach(s=>{if(!byOffer.has(s.offerId))byOffer.set(s.offerId,[]);byOffer.get(s.offerId).push(s);});
  offers.filter(visibleOffer).forEach(o=>{
    let rows=(byOffer.get(o.id)||[]).slice();
    if(!rows.length){
      const fb=SEGMENT_FALLBACK.find(x=>x.offerId===o.id);
      if(fb)rows=[fb];
      else if(/2\s*adult/i.test(o.occupancy||'')&&!/(menor|niñ|junior)/i.test(o.occupancy||''))rows=[{offerId:o.id,segmentKey:'pareja',publicText:'',priority:99}];
    }
    rows.sort((a,b)=>(Number(a.priority)||999)-(Number(b.priority)||999));
    const selected=[];
    if(rows[0])selected.push(rows[0]);
    rows.slice(1).filter(s=>yes(s.allowDuplicate)).forEach(s=>selected.push(s));
    selected.forEach(s=>groups.get(s.segmentKey)?.push({o,s}));
  });
  for(const [key,rows] of groups){
    rows.sort((a,b)=>Number(Boolean(b.o.featuredHome))-Number(Boolean(a.o.featuredHome))||((Number(a.s.priority)||999)-(Number(b.s.priority)||999))||((Number(a.o.ordenWeb)||999)-(Number(b.o.ordenWeb)||999)));
    groups.set(key,rows.slice(0,2));
  }
  return groups;
}
function card(o,s,hotels){
  const img=safe(o.image),dates=[o.travelStart?dateMx(o.travelStart):'',o.travelEnd?dateMx(o.travelEnd):''].filter(Boolean).join(' – ');
  const duration=[o.days?`${o.days} días`:'',o.nights?`${o.nights} noches`:''].filter(Boolean).join(' · ');
  const price=numberMx(o.price||''),target=hotelTarget(o,hotels),note=segText(s);
  const title=o.hotel||o.title||'Opción de viaje';
  return `<article class="hub-offer-card">
    <a class="hub-offer-image" href="${esc(target.href)}">${img?`<img src="${esc(img)}" alt="${esc(title)}" loading="lazy">`:'<div class="hub-image-placeholder"><strong>Conoce esta opción</strong><span>Las fotografías se muestran únicamente cuando están aprobadas para uso web.</span></div>'}</a>
    <div class="hub-offer-body">
      <div class="hub-offer-meta"><span>${esc(o.plan||'Viaje')}</span>${dates?`<small>${esc(dates)}</small>`:''}</div>
      <h3 translate="no" class="notranslate">${esc(title)}</h3>
      ${o.title&&o.title!==o.hotel?`<p class="hub-offer-title">${esc(o.title)}</p>`:''}
      <div class="hub-offer-facts">${duration?`<span>${esc(duration)}</span>`:''}${o.occupancy?`<span>${esc(o.occupancy)}</span>`:''}</div>
      ${note?`<p class="hub-segment-note">${esc(note)}</p>`:''}
      <div class="hub-offer-bottom"><div>${price?`<small>${esc(priceUnit(o))}</small><strong>$${esc(price)}</strong><span> MXN</span>`:'<strong>Consultar precio</strong>'}</div><a class="hub-offer-cta" href="${esc(target.href)}">${esc(target.label)}</a></div>
    </div>
  </article>`;
}
function guideHtml(d){return `<div class="hub-guide-grid">
  <section><h3>Por qué ir</h3><p>${esc(d.whyGo||'')}</p></section><section><h3>¿Es para ti?</h3><p>${esc(d.travelerProfile||'')}</p></section>
  <section><h3>Historia y contexto</h3><p>${esc(d.history||'')}</p></section><section><h3>Clima y temporadas</h3><p>${esc(d.climateSeasons||'')}</p></section>
  <section><h3>Atractivos clave</h3>${list(d.attractions)}</section><section><h3>Cómo llegar y moverse</h3><p>${esc(d.connectivity||'')}</p></section>
  <section><h3>Experiencias</h3>${list(d.experiences)}</section><section><h3>Qué combinar</h3>${list(d.combinations)}</section>
  <section class="hub-guide-wide"><h3>Gastronomía</h3><p>${esc(d.gastronomy||'')}</p></section><section class="hub-guide-wide"><h3>Patrimonio y reconocimientos</h3><p>${esc(d.sustainabilityHeritage||'')}</p></section>
</div>`;}

export default async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).send('Method not allowed');}
  const slug=String(req.query.slug||'').trim().toLowerCase();
  if(!slug||!/^[a-z0-9-]+$/.test(slug))return res.status(404).send('Destino no disponible');
  let p;try{p=await master();}catch(_){return res.status(503).send('No pudimos cargar esta vista.');}
  const destinations=Array.isArray(p.destinations)?p.destinations:[],offers=Array.isArray(p.offers)?p.offers:[],sources=Array.isArray(p.sources)?p.sources:[],hotels=Array.isArray(p.hotels)?p.hotels:[],segments=Array.isArray(p.offerSegments)?p.offerSegments:[];
  const d=destinations.find(x=>x&&x.slug===slug&&VALID.has(x.status));if(!d)return res.status(404).send('Destino no disponible');
  const rows=offers.filter(o=>o&&o.destinationId===d.id&&visibleOffer(o)),groups=grouping(rows,segments);
  const uniqueOffers=new Set([...groups.values()].flat().map(x=>x.o.id));
  const total=uniqueOffers.size,hasAny=total>0,img=safe(d.mainImage),countLabel=total===1?'1 viaje disponible':`${total} viajes disponibles`;
  const quote=`/cotizar-v2/${encodeURIComponent(d.slug)}?cta=destination_hub_v2`;
  const wa=`https://wa.me/523329335952?text=${encodeURIComponent(`Hola, quiero opciones para viajar a ${d.name} con Trhoncal Travel.`)}`;
  const ids=new Set(Array.isArray(d.sourceIds)?d.sourceIds:[]),sourceRows=sources.filter(s=>s&&ids.has(s.id));
  const segmentHtml=DEFINITIONS.map(def=>{const r=groups.get(def.key)||[];if(!r.length)return '';const head=def.key==='pareja'?'':`<div class="hub-segment-head"><div><span class="eyebrow">${esc(def.eyebrow)}</span><h2>${esc(def.title)}</h2></div><p>${esc(def.description)}</p></div>`;return `<section class="hub-segment ${def.key==='pareja'?'hub-segment-plain':''}">${head}<div class="hub-offer-grid">${r.map(x=>card(x.o,x.s,hotels)).join('')}</div></section>`;}).join('');
  const sourceHtml=sourceRows.length?sourceRows.slice(0,6).map(s=>`<div class="hub-source"><div><strong>${esc(s.organization||'Fuente')}</strong><span>${esc(s.title||'')}</span></div>${safe(s.url)?`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Fuente oficial ↗</a>`:''}</div>`).join(''):'<p>La ficha conserva las fuentes verificadas del destino.</p>';
  res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('X-Robots-Tag','noindex,nofollow');res.setHeader('Cache-Control','public, s-maxage=60, stale-while-revalidate=180');
  return res.status(200).send(`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(d.name)} · Viajes | Trhoncal Travel</title><meta name="robots" content="noindex,nofollow"><link rel="icon" type="image/svg+xml" href="/assets/images/trhoncal-travel-logo.svg"><link rel="stylesheet" href="/assets/css/styles.css"><link rel="stylesheet" href="/assets/css/brand-v2.css"><link rel="stylesheet" href="/assets/css/destination-hub-v2.css"><link rel="stylesheet" href="/assets/css/v2-polish.css"></head><body class="destination-hub-v2">
<header class="site-header"><div class="container header-inner"><a class="brand" href="/"><img class="brand-logo" src="/assets/images/trhoncal-travel-logo.svg" alt="Trhoncal Travel"></a><nav class="nav"><a href="/destinos-v2/">Destinos</a><a href="/cuando-viajar/">Cuándo viajar</a><a href="/ofertas-v2/">Ofertas</a></nav><a class="btn btn-outline" href="${wa}" target="_blank" rel="noopener">WhatsApp</a></div></header>
${previewBanner()}
<nav class="v2-context-nav" aria-label="Navegación del destino"><div class="container v2-context-nav-inner"><a href="/destinos-v2/">← Todos los destinos</a><div class="v2-context-group"><a href="/ofertas-v2/">Ver todas las ofertas</a><a href="${esc(quote)}">Cotizar este destino →</a></div></div></nav>
<main>
<section class="hub-hero"><div class="container hub-hero-grid"><div class="hub-hero-copy"><span class="eyebrow">${esc(d.state||'')} · ${esc(d.country||'México')}</span><h1>${esc(d.name)}</h1><p>${esc(d.summary||'')}</p><div class="hub-hero-actions"><a class="btn btn-primary" href="${hasAny?'#opciones':esc(quote)}">${hasAny?`Descubrir ${esc(countLabel)} ↓`:`Cotizar mi viaje a ${esc(d.name)} →`}</a></div></div><div class="hub-hero-image">${img?`<img src="${esc(img)}" alt="${esc(d.imageAlt||d.name)}">`:'<div class="hub-image-placeholder">Descubre este destino con asesoría de Trhoncal Travel.</div>'}</div></div></section>
<section class="hub-products" id="opciones"><div class="container"><div class="hub-products-intro"><div><span class="eyebrow">Viajes reales para este destino</span><h2>${hasAny?`${esc(countLabel)} para ${esc(d.name)}`:`Tu próximo viaje a ${esc(d.name)}`}</h2></div>${hasAny?`<p>${total===1?'Encontramos una opción publicada para empezar. Puedes verla o pedirnos una alternativa a tu medida.':'Compara hotel, fechas, plan y precio. Entra a cada opción para conocerla sin salir de Trhoncal.'}</p>`:''}</div>${hasAny?segmentHtml:`<div class="hub-no-offers"><span class="eyebrow">Te ayudamos a encontrarlo</span><h2>¿Quieres viajar a ${esc(d.name)}?</h2><p>No mostramos promociones inventadas ni vencidas. Cuéntanos fechas, adultos, menores o juniors y sus edades; buscamos opciones reales para ti.</p><a class="btn btn-primary" href="${esc(quote)}">Cotizar mi viaje a ${esc(d.name)} →</a></div>`}</div></section>
${hasAny?`<section class="hub-custom"><div class="container"><div class="hub-custom-card"><div><span class="eyebrow">¿No encontraste el viaje que tenías en mente?</span><h2>Tu viaje puede ser diferente</h2><p>Dinos cómo quieres viajar y buscamos una opción que encaje contigo. ${esc(d.name)} ya queda seleccionado.</p></div><a class="btn btn-primary" href="${esc(quote)}">Crear mi viaje →</a></div></div></section>`:''}
<section class="hub-guide"><div class="container"><div class="hub-guide-head"><div><span class="eyebrow">Conoce el destino</span><h2>Lo esencial de ${esc(d.name)}</h2></div></div>${guideHtml(d)}</div></section>
<section class="v2-explore-more"><div class="container"><div class="v2-explore-card"><div><span class="eyebrow">Sigue explorando</span><h2>Compara antes de decidir</h2><p>Revisa otros destinos o todas las ofertas vigentes de Trhoncal Travel.</p></div><div class="v2-explore-actions"><a class="btn btn-outline" href="/destinos-v2/">Explorar destinos →</a><a class="btn btn-primary" href="/ofertas-v2/">Ver ofertas vigentes →</a></div></div></div></section>
<section class="hub-sources"><div class="container"><span class="eyebrow">Información verificable</span><h2>Fuentes del destino</h2>${sourceHtml}</div></section>
</main><footer class="footer"><div class="container footer-grid"><div><img class="footer-logo" src="/assets/images/trhoncal-travel-logo.svg" alt="Trhoncal Travel"><p>Opciones reales, información útil y asesoría humana para convertir la idea en viaje.</p></div><div><h3>Explora</h3><p><a href="/destinos-v2/">Destinos</a></p><p><a href="/ofertas-v2/">Ofertas</a></p></div><div><h3>Contacto</h3><p><a href="${wa}" target="_blank" rel="noopener">WhatsApp</a></p><p><a href="mailto:viajestroncal@gmail.com">viajestroncal@gmail.com</a></p></div></div></footer></body></html>`);
}
