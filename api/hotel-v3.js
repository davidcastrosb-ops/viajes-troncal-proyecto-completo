const MASTER_ENDPOINT = process.env.TRHONCAL_MASTER_ENDPOINT ||
  'https://script.google.com/macros/s/AKfycbxq6OxUnMWH004OKyspo7eAbI0GvJvwwDgSnfffSzn9amtKzOWqaDmtWUnrk52rz7U8/exec';
const FALLBACK_HOST = 'viajes.trhoncalhomes.com.mx';

const FALLBACK = {
  'friendly-fun-vallarta': {
    id:'HOT-PVR-FRIENDLY-001', name:'Friendly Fun Vallarta', destinationName:'Puerto Vallarta', destinationSlug:'puerto-vallarta',
    address:'Zona Hotelera Norte, CP 48333 Puerto Vallarta, Jalisco, México',
    description:'Hotel todo incluido en la zona hotelera de Puerto Vallarta, con acceso a playa, actividades y espacios para familias, parejas y amigos.',
    offerIds:['OF-PA-PVR-REV26-001'],
    features:['Todo incluido','Acceso a playa','Beach Club','Actividades recreativas','Wi-Fi','Gimnasio y SPA'],
    room:{name:'Habitación Estándar',details:['Categoría exacta según promoción','La habitación se reconfirma antes de reservar']},
    images:[
      ['https://hotelfriendlyfun.com/wp-content/uploads/elementor/thumbs/Nuestro-Hotel-1-scaled-rkpk2mkfr6ub38b0at452nihyyvtpleyvscw855o6w.jpg','Vista del hotel'],
      ['https://hotelfriendlyfun.com/wp-content/uploads/elementor/thumbs/Chica-2-scaled-rkpk1z2h0by50z9540ygubfz4c3nd5togk1r884iig.jpg','Amenidad'],
      ['https://hotelfriendlyfun.com/wp-content/uploads/elementor/thumbs/Columpio-3-scaled-rkpk1amo2n0on48n2qe61hlzobg3t14np734r14r08.jpg','Área exterior'],
      ['https://hotelfriendlyfun.com/wp-content/uploads/2026/03/HAB-2423-06-02-2026-10.jpg','Habitación'],
      ['https://hotelfriendlyfun.com/wp-content/uploads/2023/06/hotel-friendly-fun-puerto-vallarta-todo-incluido-nueva-26-1024x683.jpeg','Hotel']
    ]
  },
  'barcelo-puerto-vallarta': {
    id:'HOT-PVR-BARCELO-001', name:'Barceló Puerto Vallarta', destinationName:'Puerto Vallarta', destinationSlug:'puerto-vallarta',
    address:'Zona Hotelera Sur Km 11.5, 48294, Puerto Vallarta, Jalisco, México',
    description:'Resort todo incluido junto a Playa Mismaloya, rodeado de montañas y con vistas a la Bahía de Banderas.',
    offerIds:['OF-PA-PVR-SEP26-002'],
    features:['Playa Mismaloya','4 albercas','Restaurantes','Spa','Servicios para familias','Habitaciones tipo suite'],
    room:{name:'Habitación según promoción',details:['La categoría exacta depende de la promoción vigente']},
    images:[['https://raw.githubusercontent.com/davidcastrosb-ops/viajes-troncal-proyecto-completo/main/assets/images/promos/barcelo-puerto-vallarta.jpg','Barceló Puerto Vallarta']]
  },
  'grand-decameron-bucerias': {
    id:'HOT-NAY-DECAMERON-001', name:'Grand Decameron Complex, A Trademark All Inclusive', destinationName:'Bucerías', destinationSlug:'nuevo-nayarit-bahia-de-banderas',
    address:'Av. Lázaro Cárdenas #150, Bucerías, Nayarit, México',
    description:'Complejo todo incluido en Bucerías con playa, piscinas, restaurantes, bares y entretenimiento.',
    offerIds:['OF-PA-NAY-REV26-003'],
    features:['5 piscinas','Playa','Restaurantes','Bares','Gimnasio y SPA','Entretenimiento'],
    room:{name:'Habitación Estándar',details:['Promoción actual: Estándar 2 queens','Check-in 15:00','Check-out 12:00']},
    images:[['https://www.decameron.com/media/uploads/cms_apps/imagenes/complex-2026_7M6lI68.webp?q=pr%3Asharp%2Frs%3Afill%2Fw%3A1920%2Fh%3A600%2Fg%3Ace%2Ff%3Ajpg','Grand Decameron Complex']]
  }
};

function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function safe(v=''){try{const u=new URL(String(v));return /^https?:$/.test(u.protocol)?u.toString():'';}catch(_){return '';}}
function money(v=''){const n=Number(String(v).replace(/[^0-9.-]/g,''));return Number.isFinite(n)?new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(n):String(v||'');}
function dateMx(v=''){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(v)))return String(v||'');return new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'short',year:'numeric'}).format(new Date(`${v}T12:00:00`));}
function visibleOffer(o){if(!o)return false;if(o.showWeb===false||String(o.showWeb||'').toLowerCase()==='no')return false;const exp=o.expirationDate||o.expiresAt||o.fechaExpiracionWeb||'';if(/^\d{4}-\d{2}-\d{2}$/.test(String(exp))&&new Date(`${exp}T23:59:59`)<new Date())return false;return true;}
function requestBase(req){const host=String(req.headers['x-forwarded-host']||req.headers.host||'').toLowerCase();const allowed=host===FALLBACK_HOST||host.endsWith('.vercel.app');const proto=String(req.headers['x-forwarded-proto']||'https').split(',')[0];return `${proto==='http'?'http':'https'}://${allowed?host:FALLBACK_HOST}`;}
async function loadMaster(){const sep=MASTER_ENDPOINT.includes('?')?'&':'?';const c=new AbortController();const t=setTimeout(()=>c.abort(),10000);try{const r=await fetch(`${MASTER_ENDPOINT}${sep}_ts=${Date.now()}`,{cache:'no-store',redirect:'follow',signal:c.signal,headers:{'User-Agent':'TrhoncalTravel-HotelV3/1.0'}});if(!r.ok)throw new Error('master');return await r.json();}finally{clearTimeout(t);}}
function mergeHotel(base,payload){const masterHotel=(Array.isArray(payload.hotels)?payload.hotels:[]).find(h=>h&&h.id===base.id)||{};const profile={...base,...masterHotel};profile.features=Array.isArray(masterHotel.features)&&masterHotel.features.length?masterHotel.features:base.features;profile.room=masterHotel.room&&typeof masterHotel.room==='object'?{...base.room,...masterHotel.room}:base.room;const masterImages=(Array.isArray(payload.hotelImages)?payload.hotelImages:[]).filter(i=>i&&i.hotelId===base.id&&i.showWeb!==false&&String(i.showWeb||'').toLowerCase()!=='no'&&safe(i.url)).sort((a,b)=>(Number(a.order)||999)-(Number(b.order)||999)).map(i=>[i.url,i.alt||profile.name]);profile.images=masterImages.length?masterImages:base.images;return profile;}

export default async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).send('Method not allowed');}
  const slug=String(req.query.slug||'').trim().toLowerCase(),base=FALLBACK[slug];
  if(!base){res.setHeader('X-Robots-Tag','noindex,nofollow');return res.status(404).send('Hotel no disponible');}
  let payload={offers:[],hotels:[],hotelImages:[]};try{payload=await loadMaster();}catch(_){}
  const hotel=mergeHotel(base,payload),offers=(Array.isArray(payload.offers)?payload.offers:[]).filter(visibleOffer),requested=String(req.query.oferta||'').trim();
  const validIds=new Set([...(Array.isArray(hotel.offerIds)?hotel.offerIds:[]),...base.offerIds]);
  const active=offers.filter(o=>o&&validIds.has(o.id));
  const offer=requested?active.find(o=>o.id===requested)||null:active[0]||null;
  const requestedUnavailable=Boolean(requested&&!offer);
  const destinationName=offer?.leadDestinationVerified||hotel.destinationName,destinationSlug=hotel.destinationSlug;
  const images=(Array.isArray(hotel.images)?hotel.images:[]).filter(x=>Array.isArray(x)&&safe(x[0])),hero=images[0]||null;
  const qs=new URLSearchParams({cta:'hotel_minisite_v3',destino:destinationName,hotel:hotel.name});
  if(offer?.travelStart)qs.set('salida',offer.travelStart);if(offer?.travelEnd)qs.set('regreso',offer.travelEnd);if(offer?.occasionId)qs.set('ocasion',offer.occasionId);if(offer?.id)qs.set('oferta',offer.id);if(offer?.plan)qs.set('plan',offer.plan);
  const quoteUrl=`/cotizar-v2?${qs.toString()}`,pdfUrl=offer?`/oferta-v2/${encodeURIComponent(offer.id)}.pdf`:'';
  const backUrl=`/destino-v2/${encodeURIComponent(destinationSlug)}#opciones`,baseUrl=requestBase(req),shareUrl=`${baseUrl}/hotel-v2/${encodeURIComponent(slug)}${offer?`?oferta=${encodeURIComponent(offer.id)}`:''}`;
  const shareText=`${offer?.title||hotel.name}. Conoce el hotel y consulta opciones con Trhoncal Travel.`;
  const shareWa=`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,mail=`mailto:?subject=${encodeURIComponent(`Mira esta opción: ${hotel.name}`)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
  const price=offer?.price?money(offer.price):'',dates=[offer?.travelStart?dateMx(offer.travelStart):'',offer?.travelEnd?dateMx(offer.travelEnd):''].filter(Boolean).join(' – '),duration=[offer?.days?`${offer.days} días`:'',offer?.nights?`${offer.nights} noches`:''].filter(Boolean).join(' · ');
  const gallery=images.slice(0,5).map((img,i)=>`<button type="button" data-gallery-index="${i}" aria-label="Abrir foto ${i+1} de ${images.length}"><img src="${esc(img[0])}" alt="${esc(img[1])}" loading="${i?'lazy':'eager'}">${i===4&&images.length>5?`<span class="hotel-v2-gallery-more">Ver ${images.length} fotos</span>`:''}</button>`).join('');
  const features=(Array.isArray(hotel.features)?hotel.features:[]).map(x=>`<div class="hotel-v2-feature">${esc(x)}</div>`).join(''),roomDetails=(Array.isArray(hotel.room?.details)?hotel.room.details:[]).map(x=>`<li>${esc(x)}</li>`).join('');
  const essentials=[offer?.hotel?`Hotel: ${offer.hotel}`:`Hotel: ${hotel.name}`,duration,offer?.plan||'',offer?.occupancy||''].filter(Boolean).map(x=>`<li>${esc(x)}</li>`).join('');
  const galleryData=JSON.stringify(images.map(x=>({url:x[0],alt:x[1]}))).replace(/</g,'\\u003c');
  const mapQuery=encodeURIComponent(hotel.address||destinationName);
  res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('X-Robots-Tag','noindex,nofollow');res.setHeader('Cache-Control','public, s-maxage=60, stale-while-revalidate=180');
  return res.status(200).send(`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(offer?.title||hotel.name)} | Trhoncal Travel</title><meta name="robots" content="noindex,nofollow"><link rel="icon" type="image/svg+xml" href="/assets/images/trhoncal-travel-logo.svg"><link rel="stylesheet" href="/assets/css/styles.css"><link rel="stylesheet" href="/assets/css/brand-v2.css"><link rel="stylesheet" href="/assets/css/hotel-v2.css"><style>.hotel-v3-alert{margin:18px auto 0;padding:14px 18px;border:1px solid #e3c97c;background:#fff7dc;border-radius:16px;color:#6c4d09;font-weight:800}.hotel-v3-back{font-weight:900;color:#063f53;text-decoration:none}.hotel-v3-back:hover{text-decoration:underline}</style></head><body class="hotel-v2-page">
<header class="site-header"><div class="container header-inner"><a class="brand" href="/"><img class="brand-logo" src="/assets/images/trhoncal-travel-logo.svg" alt="Trhoncal Travel"></a><nav class="nav"><a href="/#destinos">Destinos</a><a href="/cuando-viajar/">Cuándo viajar</a><a href="/#promociones">Ofertas</a><a href="/cotizar-v2">Solicita tu viaje</a></nav><a class="btn btn-outline" href="https://wa.me/523329335952">WhatsApp</a></div></header>
<div class="hotel-v2-preview">VISTA PREVIA · MINI SITIO DE HOTEL · producción actual sigue intacta</div>
<nav class="v2-context-nav" aria-label="Navegación del hotel"><div class="container v2-context-nav-inner"><div class="v2-context-group"><a href="${esc(backUrl)}">← Viajes para ${esc(destinationName)}</a><a href="/#destinos">Todos los destinos</a></div><a href="/#promociones">Ver todas las ofertas →</a></div></nav>
${requestedUnavailable?`<div class="container"><div class="hotel-v3-alert">La promoción que abriste ya no está disponible. Puedes conocer el hotel y solicitar una cotización actualizada.</div></div>`:''}
<main class="hotel-v2-main">
<section class="hotel-v2-hero"><div class="container hotel-v2-hero-grid"><div class="hotel-v2-copy"><span class="eyebrow">${offer?'Promoción disponible':'Conoce el hotel'}</span><h1 translate="no" class="notranslate">${esc(offer?.title||hotel.name)}</h1><p class="hotel-v2-hotel notranslate" translate="no">Hotel: ${esc(hotel.name)}</p><p>${esc(hotel.description||'')}</p>${offer?`<div class="hotel-v2-tags">${dates?`<span>${esc(dates)}</span>`:''}${duration?`<span>${esc(duration)}</span>`:''}${offer.occupancy?`<span>${esc(offer.occupancy)}</span>`:''}${offer.plan?`<span>${esc(offer.plan)}</span>`:''}</div><div class="hotel-v2-price-row">${price?`<div class="hotel-v2-price"><small>${esc(offer.priceUnit||'Precio publicado')}</small><strong>${esc(price)}</strong><span>MXN</span></div>`:''}<a class="btn btn-primary" href="${esc(quoteUrl)}">Quiero este viaje →</a></div>`:`<div class="hotel-v2-price-row"><a class="btn btn-primary" href="${esc(quoteUrl)}">Cotizar este hotel →</a></div>`}</div><div class="hotel-v2-hero-image">${hero?`<img src="${esc(hero[0])}" alt="${esc(hero[1])}">`:'<div class="offer-image-fallback">Estamos preparando la galería de este hotel.</div>'}</div></div></section>
${offer?`<section class="hotel-v2-actions"><div class="container"><div class="hotel-v2-action-card"><strong>Guárdala, compártela o envíala a quien viaje contigo.</strong><div class="hotel-v2-action-buttons"><button class="hotel-v2-mini primary" type="button" data-native-share>Compartir promoción</button><a class="hotel-v2-mini gold" href="${esc(pdfUrl)}">Descargar PDF</a><a class="hotel-v2-mini" href="${esc(shareWa)}" target="_blank" rel="noopener">WhatsApp</a><a class="hotel-v2-mini" href="${esc(mail)}">Correo</a><button class="hotel-v2-mini" type="button" data-copy>Copiar enlace</button></div></div></div></section>`:''}
<div class="container hotel-v2-nav-wrap"><nav class="hotel-v2-nav" aria-label="Secciones del hotel"><a href="#fotos">Fotos</a><a href="#habitacion">Habitación</a><a href="#hotel">Acerca del hotel</a><a href="#servicios">Servicios</a><a href="#ubicacion">Ubicación</a></nav></div>
<section class="hotel-v2-section" id="fotos"><div class="container"><span class="eyebrow">Conócelo sin salir de Trhoncal</span><h2>Fotos del hotel</h2>${gallery?`<div class="hotel-v2-gallery">${gallery}</div>`:'<div class="hotel-v2-gallery-empty">Estamos preparando más imágenes reales de este hotel.</div>'}</div></section>
<section class="hotel-v2-section" id="hotel"><div class="container hotel-v2-grid">${offer?`<article class="hotel-v2-card"><span class="eyebrow">Lo esencial de esta promoción</span><h3>Tu opción</h3><ul class="hotel-v2-list">${essentials}</ul></article>`:''}<article class="hotel-v2-card" id="servicios"><span class="eyebrow">Conoce el hotel</span><h3 translate="no" class="notranslate">${esc(hotel.name)}</h3><p class="hotel-v2-section-copy">${esc(hotel.description||'')}</p><div class="hotel-v2-features">${features}</div></article></div></section>
<section class="hotel-v2-section" id="habitacion"><div class="container"><article class="hotel-v2-card"><span class="eyebrow">Tu habitación</span><h3>${esc(hotel.room?.name||'Habitación según promoción')}</h3><ul class="hotel-v2-list">${roomDetails}</ul><p class="hotel-v2-room-note">La categoría exacta incluida se confirma con la promoción vigente.</p></article></div></section>
<section class="hotel-v2-section" id="ubicacion"><div class="container hotel-v2-map-grid"><div class="hotel-v2-map-copy"><span class="eyebrow">Ubicación</span><h2>${esc(destinationName)}</h2><p>${esc(hotel.address||'')}</p><a href="https://www.google.com/maps/search/?api=1&query=${mapQuery}" target="_blank" rel="noopener noreferrer">Abrir mapa ↗</a></div><iframe class="hotel-v2-map-frame" loading="lazy" src="https://www.google.com/maps?q=${mapQuery}&output=embed" title="Mapa de ${esc(hotel.name)}"></iframe></div></section>
<section class="hotel-v2-final"><div class="container hotel-v2-final-card"><div><span class="eyebrow">Siguiente paso</span><h2>${offer?'¿Te gustaría viajar con esta opción?':'¿Te gustaría cotizar este hotel?'}</h2><p>${offer?'Destino, fechas, hotel y promoción pasan precargados al formulario.':'El destino y hotel quedan precargados para buscar una opción vigente.'}</p></div><a class="btn btn-primary" href="${esc(quoteUrl)}">${offer?'Solicitar esta opción':'Cotizar este hotel'} →</a></div></section>
<section class="v2-explore-more"><div class="container"><div class="v2-explore-card"><div><span class="eyebrow">Sigue explorando</span><h2>¿Quieres comparar antes de decidir?</h2><p>Regresa a ${esc(destinationName)} o conoce otras opciones sin salir de Trhoncal Travel.</p></div><div class="v2-explore-actions"><a class="btn btn-outline" href="${esc(backUrl)}">Viajes para ${esc(destinationName)}</a><a class="btn btn-outline" href="/#destinos">Otros destinos</a><a class="btn btn-primary" href="/#promociones">Todas las ofertas →</a></div></div></div></section>
</main>
${offer?`<div class="hotel-v2-mobile-cta"><strong>${esc(price||'Consultar')}</strong><a class="btn" href="${esc(quoteUrl)}">Quiero este viaje</a></div>`:''}
<div class="hotel-v2-lightbox" role="dialog" aria-modal="true" aria-label="Galería del hotel" aria-hidden="true" tabindex="-1"><div class="hotel-v2-lightbox-inner"><div class="hotel-v2-lightbox-stage"><button type="button" class="hotel-v2-lightbox-close" aria-label="Cerrar galería">×</button><button type="button" class="hotel-v2-lightbox-prev" aria-label="Foto anterior">‹</button><img alt=""><button type="button" class="hotel-v2-lightbox-next" aria-label="Foto siguiente">›</button></div><div class="hotel-v2-lightbox-strip"></div></div></div>
<script>
const GALLERY=${galleryData},lb=document.querySelector('.hotel-v2-lightbox'),stage=lb?.querySelector('.hotel-v2-lightbox-stage img'),strip=lb?.querySelector('.hotel-v2-lightbox-strip');let gi=0,lastFocus=null;
function paint(){if(!GALLERY.length)return;stage.src=GALLERY[gi].url;stage.alt=GALLERY[gi].alt||'';strip.innerHTML=GALLERY.map((x,i)=>'<button type="button" class="'+(i===gi?'active':'')+'" data-thumb="'+i+'" aria-label="Ver foto '+(i+1)+'"><img src="'+x.url+'" alt=""></button>').join('');}
function openGallery(i){if(!GALLERY.length)return;lastFocus=document.activeElement;gi=i;paint();lb.classList.add('is-open');lb.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';lb.querySelector('.hotel-v2-lightbox-close')?.focus();}
function closeGallery(){lb.classList.remove('is-open');lb.setAttribute('aria-hidden','true');document.body.style.overflow='';lastFocus?.focus?.();}
document.querySelectorAll('[data-gallery-index]').forEach(b=>b.addEventListener('click',()=>openGallery(Number(b.dataset.galleryIndex))));lb?.querySelector('.hotel-v2-lightbox-close')?.addEventListener('click',closeGallery);lb?.querySelector('.hotel-v2-lightbox-prev')?.addEventListener('click',()=>{gi=(gi-1+GALLERY.length)%GALLERY.length;paint();});lb?.querySelector('.hotel-v2-lightbox-next')?.addEventListener('click',()=>{gi=(gi+1)%GALLERY.length;paint();});strip?.addEventListener('click',e=>{const b=e.target.closest('[data-thumb]');if(b){gi=Number(b.dataset.thumb);paint();}});document.addEventListener('keydown',e=>{if(!lb?.classList.contains('is-open'))return;if(e.key==='Escape')closeGallery();if(e.key==='ArrowLeft'){gi=(gi-1+GALLERY.length)%GALLERY.length;paint();}if(e.key==='ArrowRight'){gi=(gi+1)%GALLERY.length;paint();}});
document.querySelector('[data-native-share]')?.addEventListener('click',async()=>{try{if(navigator.share)await navigator.share({title:${JSON.stringify(offer?.title||hotel.name)},text:${JSON.stringify(shareText)},url:${JSON.stringify(shareUrl)}});else{await navigator.clipboard.writeText(${JSON.stringify(shareUrl)});alert('Enlace copiado');}}catch(_){}});document.querySelector('[data-copy]')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(${JSON.stringify(shareUrl)});alert('Enlace copiado');}catch(_){}});
</script></body></html>`);
}
