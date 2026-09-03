const PUBLIC_HOST = 'viajes.trhoncalhomes.com.mx';
const SHARE_VERSION = 'wa-20260902b';
const MASTER_ENDPOINT = process.env.TRHONCAL_MASTER_ENDPOINT ||
  'https://script.google.com/macros/s/AKfycbxq6OxUnMWH004OKyspo7eAbI0GvJvwwDgSnfffSzn9amtKzOWqaDmtWUnrk52rz7U8/exec';

const FALLBACK_HOTELS = {
  'friendly-fun-vallarta': {
    id:'HOT-PVR-FRIENDLY-001', name:'Friendly Fun Vallarta', destinationName:'Puerto Vallarta', destinationSlug:'puerto-vallarta',
    address:'Zona Hotelera Norte, CP 48333 Puerto Vallarta, Jalisco, México',
    description:'Hotel todo incluido en la zona hotelera de Puerto Vallarta, con acceso a playa, actividades y espacios para familias, parejas y amigos.',
    offerIds:['OF-PA-PVR-REV26-001'], features:['Todo incluido','Acceso a playa','Beach Club','Actividades recreativas','Wi-Fi','Gimnasio y SPA'],
    room:{name:'Habitación Estándar',details:['Categoría exacta según promoción','La habitación se reconfirma antes de reservar']}
  },
  'barcelo-puerto-vallarta': {
    id:'HOT-PVR-BARCELO-001', name:'Barceló Puerto Vallarta', destinationName:'Puerto Vallarta', destinationSlug:'puerto-vallarta',
    address:'Zona Hotelera Sur Km 11.5, 48294, Puerto Vallarta, Jalisco, México',
    description:'Resort todo incluido junto a Playa Mismaloya, rodeado de montañas y con vistas a la Bahía de Banderas.',
    offerIds:['OF-PA-PVR-SEP26-002'], features:['Playa Mismaloya','Albercas','Restaurantes','Spa','Servicios para familias','Habitaciones tipo suite'],
    room:{name:'Habitación según promoción',details:['La categoría exacta depende de la promoción vigente']}
  },
  'grand-decameron-bucerias': {
    id:'HOT-NAY-DECAMERON-001', name:'Grand Decameron Complex, A Trademark All Inclusive', destinationName:'Bucerías', destinationSlug:'nuevo-nayarit-bahia-de-banderas',
    address:'Av. Lázaro Cárdenas #150, Bucerías, Nayarit, México',
    description:'Complejo todo incluido en Bucerías con playa, piscinas, restaurantes, bares y entretenimiento.',
    offerIds:['OF-PA-NAY-REV26-003'], features:['Piscinas','Playa','Restaurantes','Bares','Gimnasio y SPA','Entretenimiento'],
    room:{name:'Habitación Estándar',details:['La categoría exacta se confirma con la promoción vigente']}
  }
};

function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function scriptJson(value){return JSON.stringify(value).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');}
function safeUrl(v=''){try{const u=new URL(String(v));return /^https?:$/.test(u.protocol)?u.toString():'';}catch(_){return '';}}
function normalizeHotelImageUrl(v=''){
  const absolute=safeUrl(v);if(!absolute)return '';
  try{
    const u=new URL(absolute);
    if(/^\/assets\/images\/hoteles\/[A-Za-z0-9._~%/-]+\.(?:jpe?g|png|webp)$/i.test(u.pathname))return u.pathname;
    return u.toString();
  }catch(_){return '';}
}
function numberMx(v=''){const n=Number(String(v).replace(/[^0-9.-]/g,''));return Number.isFinite(n)?new Intl.NumberFormat('es-MX',{maximumFractionDigits:0}).format(n):'';}
function dateMx(v=''){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(v)))return String(v||'');return new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'short',year:'numeric'}).format(new Date(`${v}T12:00:00`));}
function requestHost(req){const raw=String(req.headers?.['x-forwarded-host']||req.headers?.host||PUBLIC_HOST).split(',')[0].trim();return /^[A-Za-z0-9.-]+(?::\d+)?$/.test(raw)?raw:PUBLIC_HOST;}
function requestProto(req){return String(req.headers?.['x-forwarded-proto']||'https').split(',')[0].trim()==='http'?'http':'https';}
function priceUnit(o){const raw=String(o?.priceUnit||'').trim();if(/por\s*persona/i.test(raw))return 'Por persona';if(/total/i.test(raw))return 'Total publicado';if(/desde/i.test(raw))return 'Desde';return raw||'Precio publicado';}
function previewBanner(){return process.env.VERCEL_ENV==='production'?'':'<div class="hotel-v2-preview">VISTA PREVIA · MINI SITIO DE HOTEL V2 · producción actual sigue intacta</div>';}
async function loadMaster(){const sep=MASTER_ENDPOINT.includes('?')?'&':'?';const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);try{const r=await fetch(`${MASTER_ENDPOINT}${sep}_ts=${Date.now()}`,{cache:'no-store',redirect:'follow',signal:controller.signal,headers:{'User-Agent':'TrhoncalTravel-HotelV2/2.0'}});if(!r.ok)throw new Error(`Master ${r.status}`);return await r.json();}finally{clearTimeout(timeout);}}
function mergeHotel(slug,payload){
  const fallback=FALLBACK_HOTELS[slug];
  const dynamic=(Array.isArray(payload.hotels)?payload.hotels:[]).find(h=>h&&h.slug===slug);
  if(!fallback&&!dynamic)return null;
  const base={...(fallback||{}),...(dynamic||{})};
  base.slug=slug;
  const dest=(Array.isArray(payload.destinations)?payload.destinations:[]).find(d=>d&&d.id===base.destinationId);
  base.destinationSlug=base.destinationSlug||dest?.slug||FALLBACK_HOTELS[slug]?.destinationSlug||'';
  base.destinationName=base.destinationName||dest?.name||FALLBACK_HOTELS[slug]?.destinationName||'';
  base.offerIds=Array.from(new Set([...(fallback?.offerIds||[]),...((Array.isArray(base.offerIds)?base.offerIds:[]))]));
  base.features=Array.isArray(base.features)&&base.features.length?base.features:(fallback?.features||[]);
  base.room=base.room||fallback?.room||{name:'Habitación según promoción',details:['La categoría exacta se confirma antes de reservar']};
  if(!Array.isArray(base.room.details))base.room.details=[];
  return base;
}
function approvedImages(hotelId,payload){
  return (Array.isArray(payload.hotelImages)?payload.hotelImages:[])
    .filter(x=>x&&x.hotelId===hotelId&&normalizeHotelImageUrl(x.url))
    .sort((a,b)=>(Number(a.order)||999)-(Number(b.order)||999))
    .map(x=>[normalizeHotelImageUrl(x.url),String(x.alt||'Fotografía del hotel')]);
}
function offerVisible(o){if(!o)return false;if(o.showWeb===false)return false;const exp=o.expirationDate||o.expiresAt||'';return !(/^\d{4}-\d{2}-\d{2}$/.test(String(exp))&&new Date(`${exp}T23:59:59`)<new Date());}

export default async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).send('Method not allowed');}
  const slug=String(req.query.slug||'').trim().toLowerCase();
  let payload={offers:[],hotels:[],hotelImages:[]};try{payload=await loadMaster();}catch(_){}
  const hotel=mergeHotel(slug,payload);
  if(!hotel){res.setHeader('X-Robots-Tag','noindex,nofollow');return res.status(404).send('Hotel no disponible');}

  const offers=(Array.isArray(payload.offers)?payload.offers:[]).filter(offerVisible);
  const requested=String(req.query.oferta||'').trim();
  const validIds=new Set([...(hotel.offerIds||[]),...offers.filter(o=>o?.hotelId===hotel.id).map(o=>o.id)]);
  const offer=offers.find(o=>o&&validIds.has(o.id)&&requested&&o.id===requested)||offers.find(o=>o&&validIds.has(o.id))||null;
  const images=approvedImages(hotel.id,payload),hero=images[0]||null;
  const destinationName=offer?.leadDestinationVerified||hotel.destinationName||'este destino';
  const destinationSlug=hotel.destinationSlug||'';

  const quote=new URLSearchParams({cta:'hotel_minisite_v2',destino:destinationName});
  if(offer?.travelStart)quote.set('salida',offer.travelStart);if(offer?.travelEnd)quote.set('regreso',offer.travelEnd);
  if(offer?.occasionId)quote.set('ocasion',offer.occasionId);if(offer?.id)quote.set('oferta',offer.id);if(offer?.plan)quote.set('plan',offer.plan);
  const quoteUrl=`/cotizar-v2${destinationSlug?`/${encodeURIComponent(destinationSlug)}`:''}?${quote.toString()}`;
  const pdfUrl=offer?`/oferta-v2/${encodeURIComponent(offer.id)}.pdf`:'';
  const backUrl=destinationSlug?`/destino-v2/${encodeURIComponent(destinationSlug)}#opciones`:'/destinos-v2/';
  const price=offer?.price?numberMx(offer.price):'';
  const dates=[offer?.travelStart?dateMx(offer.travelStart):'',offer?.travelEnd?dateMx(offer.travelEnd):''].filter(Boolean).join(' – ');
  const canonicalShareUrl=`${requestProto(req)}://${requestHost(req)}/hotel-v2/${encodeURIComponent(slug)}${offer?`?oferta=${encodeURIComponent(offer.id)}`:''}`;
  const previewUrl=`${canonicalShareUrl}${canonicalShareUrl.includes('?')?'&':'?'}share=${encodeURIComponent(SHARE_VERSION)}`;
  const shareText=`${offer?.title||hotel.name}. Conoce el hotel y consulta la promoción con Trhoncal Travel.`;
  const waShare=`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${previewUrl}`)}`;
  const mail=`mailto:?subject=${encodeURIComponent(`Mira esta opción: ${hotel.name}`)}&body=${encodeURIComponent(`${shareText}\n\n${previewUrl}`)}`;
  const gallery=images.slice(0,5).map((img,i)=>`<button type="button" data-gallery-index="${i}" aria-label="Abrir fotografía ${i+1}"><img src="${esc(img[0])}" alt="${esc(img[1])}" loading="${i?'lazy':'eager'}">${i===4&&images.length>5?`<span class="hotel-v2-gallery-more">Ver ${images.length} fotos</span>`:''}</button>`).join('');
  const features=(hotel.features||[]).map(x=>`<div class="hotel-v2-feature">${esc(x)}</div>`).join('');
  const roomDetails=(hotel.room?.details||[]).map(x=>`<li>${esc(x)}</li>`).join('');
  const essentials=[offer?.hotel?`Hotel: ${offer.hotel}`:`Hotel: ${hotel.name}`,offer?.days&&offer?.nights?`${offer.days} días / ${offer.nights} noches`:'',offer?.plan||'',offer?.occupancy||''].filter(Boolean).map(x=>`<li>${esc(x)}</li>`).join('');
  const galleryData=scriptJson(images.map(x=>({url:x[0],alt:x[1]})));

  res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('X-Robots-Tag','noindex,nofollow');res.setHeader('Cache-Control','public, s-maxage=60, stale-while-revalidate=180');
  return res.status(200).send(`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(offer?.title||hotel.name)} | Trhoncal Travel</title><meta name="robots" content="noindex,nofollow"><link rel="icon" type="image/svg+xml" href="/assets/images/trhoncal-travel-logo.svg"><link rel="stylesheet" href="/assets/css/styles.css"><link rel="stylesheet" href="/assets/css/brand-v2.css"><link rel="stylesheet" href="/assets/css/hotel-v2.css"><link rel="stylesheet" href="/assets/css/v2-polish.css"></head><body class="hotel-v2-page">
<header class="site-header"><div class="container header-inner"><a class="brand" href="/"><img class="brand-logo" src="/assets/images/trhoncal-travel-logo.svg" alt="Trhoncal Travel"></a><nav class="nav"><a href="/destinos-v2/">Destinos</a><a href="/cuando-viajar/">Cuándo viajar</a><a href="/ofertas-v2/">Ofertas</a><a href="/cotizar-v2">Solicita tu viaje</a></nav><a class="btn btn-outline" href="https://wa.me/523329335952">WhatsApp</a></div></header>
${previewBanner()}
<nav class="v2-context-nav" aria-label="Navegación del hotel"><div class="container v2-context-nav-inner"><a href="${esc(backUrl)}">← Volver a viajes para ${esc(destinationName)}</a><div class="v2-context-group"><a href="/destinos-v2/">Todos los destinos</a><a href="/ofertas-v2/">Ver todas las ofertas →</a></div></div></nav>
<main class="hotel-v2-main">
<section class="hotel-v2-hero"><div class="container hotel-v2-hero-grid"><div class="hotel-v2-copy"><span class="eyebrow">${offer?'Promoción disponible':'Conoce el hotel'}</span><h1 translate="no" class="notranslate">${esc(offer?.title||hotel.name)}</h1><p class="hotel-v2-hotel notranslate" translate="no">Hotel: ${esc(hotel.name)}${hotel.category?` · ${esc(hotel.category)}`:''}</p><p>${esc(hotel.description||'Conoce esta opción y solicita disponibilidad con Trhoncal Travel.')}</p>${offer?`<div class="hotel-v2-tags">${dates?`<span>${esc(dates)}</span>`:''}${offer.days&&offer.nights?`<span>${offer.days} días · ${offer.nights} noches</span>`:''}${offer.occupancy?`<span>${esc(offer.occupancy)}</span>`:''}${offer.plan?`<span>${esc(offer.plan)}</span>`:''}</div><div class="hotel-v2-price-row">${price?`<div class="hotel-v2-price"><small>${esc(priceUnit(offer))}</small><strong>$${esc(price)}</strong><span> MXN</span></div>`:''}<a class="btn btn-primary" href="${esc(quoteUrl)}">Solicitar esta opción →</a></div>`:`<div class="hotel-v2-price-row"><a class="btn btn-primary" href="${esc(quoteUrl)}">Cotizar este hotel →</a></div>`}</div><div class="hotel-v2-hero-image">${hero?`<img src="${esc(hero[0])}" alt="${esc(hero[1])}">`:'<div class="hotel-v2-gallery-empty"><strong>Galería en preparación</strong><p>Mostramos fotografías únicamente cuando su permiso de uso web está verificado.</p></div>'}</div></div></section>
${offer?`<section class="hotel-v2-actions"><div class="container"><div class="hotel-v2-action-card"><strong>Guárdala o compártela con quien viaje contigo.</strong><div class="hotel-v2-action-buttons"><button class="hotel-v2-mini primary" type="button" data-native-share>Compartir promoción</button>${pdfUrl?`<a class="hotel-v2-mini gold" href="${esc(pdfUrl)}">Descargar PDF</a>`:''}<a class="hotel-v2-mini" href="${esc(waShare)}" target="_blank" rel="noopener">WhatsApp</a><a class="hotel-v2-mini" href="${esc(mail)}">Correo</a><button class="hotel-v2-mini" type="button" data-copy>Copiar enlace</button></div></div></div></section>`:''}
<div class="container hotel-v2-nav-wrap"><nav class="hotel-v2-nav" aria-label="Secciones del hotel"><a href="#fotos">Fotos</a><a href="#habitacion">Habitación</a><a href="#hotel">Acerca del hotel</a><a href="#servicios">Servicios</a><a href="#ubicacion">Ubicación</a></nav></div>
<section class="hotel-v2-section" id="fotos"><div class="container"><span class="eyebrow">Conócelo sin salir de Trhoncal</span><h2>Fotos del hotel</h2>${gallery?`<div class="hotel-v2-gallery">${gallery}</div>`:'<div class="hotel-v2-gallery-empty"><strong>Galería en preparación</strong><p>Las imágenes aparecerán en cuanto sus derechos estén aprobados para uso web.</p></div>'}</div></section>
<section class="hotel-v2-section" id="hotel"><div class="container hotel-v2-grid">${offer?`<article class="hotel-v2-card"><span class="eyebrow">Lo esencial de esta promoción</span><h3>Tu opción</h3><ul class="hotel-v2-list">${essentials}</ul></article>`:''}<article class="hotel-v2-card" id="servicios"><span class="eyebrow">Conoce el hotel</span><h3 translate="no" class="notranslate">${esc(hotel.name)}</h3><p class="hotel-v2-section-copy">${esc(hotel.description||'')}</p>${features?`<div class="hotel-v2-features">${features}</div>`:''}</article></div></section>
<section class="hotel-v2-section" id="habitacion"><div class="container"><article class="hotel-v2-card"><span class="eyebrow">Tu habitación</span><h3>${esc(hotel.room?.name||'Habitación según promoción')}</h3>${roomDetails?`<ul class="hotel-v2-list">${roomDetails}</ul>`:''}<p class="hotel-v2-room-note">La categoría exacta incluida se confirma antes de reservar.</p></article></div></section>
<section class="hotel-v2-section" id="ubicacion"><div class="container hotel-v2-map-grid"><div class="hotel-v2-map-copy"><span class="eyebrow">Ubicación</span><h2>${esc(destinationName)}</h2><p>${esc(hotel.address||'Ubicación disponible durante la asesoría.')}</p>${hotel.address?`<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.address)}" target="_blank" rel="noopener noreferrer">Abrir mapa ↗</a>`:''}</div>${hotel.address?`<iframe class="hotel-v2-map-frame" loading="lazy" src="https://www.google.com/maps?q=${encodeURIComponent(hotel.address)}&output=embed" title="Mapa de ${esc(hotel.name)}"></iframe>`:''}</div></section>
<section class="hotel-v2-final"><div class="container hotel-v2-final-card"><div><span class="eyebrow">Siguiente paso</span><h2>${offer?'¿Te gustaría viajar con esta opción?':'¿Quieres cotizar este hotel?'}</h2><p>${offer?'Destino, fechas, hotel y promoción pasan precargados al formulario.':'Cuéntanos fechas y viajeros para buscar una opción vigente.'}</p></div><a class="btn btn-primary" href="${esc(quoteUrl)}">${offer?'Solicitar esta opción →':'Cotizar este hotel →'}</a></div></section>
<section class="v2-explore-more"><div class="container"><div class="v2-explore-card"><div><span class="eyebrow">Sigue explorando</span><h2>Compara antes de decidir</h2><p>Regresa al destino, revisa todas las ofertas o explora otros lugares.</p></div><div class="v2-explore-actions"><a class="btn btn-outline" href="${esc(backUrl)}">Volver al destino</a><a class="btn btn-outline" href="/destinos-v2/">Todos los destinos</a><a class="btn btn-primary" href="/ofertas-v2/">Ver ofertas →</a></div></div></div></section>
</main>${offer?`<div class="hotel-v2-mobile-cta"><strong>${price?`$${esc(price)} MXN`:'Consultar'}</strong><a class="btn" href="${esc(quoteUrl)}">Solicitar</a></div>`:''}
<div class="hotel-v2-lightbox" aria-hidden="true"><div class="hotel-v2-lightbox-inner"><div class="hotel-v2-lightbox-stage"><button class="hotel-v2-lightbox-close" aria-label="Cerrar">×</button><button class="hotel-v2-lightbox-prev" aria-label="Anterior">‹</button><img alt=""><button class="hotel-v2-lightbox-next" aria-label="Siguiente">›</button></div><div class="hotel-v2-lightbox-strip"></div></div></div>
<script>const GALLERY=${galleryData},lb=document.querySelector('.hotel-v2-lightbox'),stage=lb?.querySelector('.hotel-v2-lightbox-stage img'),strip=lb?.querySelector('.hotel-v2-lightbox-strip');let gi=0,lastTrigger=null;function paint(){if(!GALLERY.length||!lb)return;stage.src=GALLERY[gi].url;stage.alt=GALLERY[gi].alt||'';strip.innerHTML=GALLERY.map((x,i)=>'<button class="'+(i===gi?'active':'')+'" data-thumb="'+i+'"><img src="'+x.url+'" alt=""></button>').join('');}function openGallery(i,trigger){if(!GALLERY.length||!lb)return;lastTrigger=trigger||document.activeElement;gi=i;paint();lb.classList.add('is-open');lb.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}function closeGallery(){if(!lb)return;lb.classList.remove('is-open');lb.setAttribute('aria-hidden','true');document.body.style.overflow='';lastTrigger?.focus?.();}document.querySelectorAll('[data-gallery-index]').forEach(b=>b.addEventListener('click',()=>openGallery(Number(b.dataset.galleryIndex),b)));lb?.querySelector('.hotel-v2-lightbox-close')?.addEventListener('click',closeGallery);lb?.querySelector('.hotel-v2-lightbox-prev')?.addEventListener('click',()=>{gi=(gi-1+GALLERY.length)%GALLERY.length;paint();});lb?.querySelector('.hotel-v2-lightbox-next')?.addEventListener('click',()=>{gi=(gi+1)%GALLERY.length;paint();});strip?.addEventListener('click',e=>{const b=e.target.closest('[data-thumb]');if(b){gi=Number(b.dataset.thumb);paint();}});lb?.addEventListener('click',e=>{if(e.target===lb)closeGallery();});document.addEventListener('keydown',e=>{if(!lb?.classList.contains('is-open'))return;if(e.key==='Escape')closeGallery();if(e.key==='ArrowRight'){gi=(gi+1)%GALLERY.length;paint();}if(e.key==='ArrowLeft'){gi=(gi-1+GALLERY.length)%GALLERY.length;paint();}});document.querySelector('[data-native-share]')?.addEventListener('click',async()=>{try{if(navigator.share)await navigator.share({title:${scriptJson(offer?.title||hotel.name)},text:${scriptJson(shareText)},url:${scriptJson(previewUrl)}});else{await navigator.clipboard.writeText(${scriptJson(previewUrl)});alert('Enlace copiado');}}catch(_){}});document.querySelector('[data-copy]')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(${scriptJson(previewUrl)});alert('Enlace copiado');}catch(_){}});</script></body></html>`);
}
