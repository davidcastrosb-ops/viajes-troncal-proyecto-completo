const PUBLIC_HOST = 'viajes.trhoncalhomes.com.mx';
const MASTER_ENDPOINT = process.env.TRHONCAL_MASTER_ENDPOINT ||
  'https://script.google.com/macros/s/AKfycbxq6OxUnMWH004OKyspo7eAbI0GvJvwwDgSnfffSzn9amtKzOWqaDmtWUnrk52rz7U8/exec';

const HOTELS = {
  'friendly-fun-vallarta': {
    id:'HOT-PVR-FRIENDLY-001', name:'Friendly Fun Vallarta', destinationName:'Puerto Vallarta',
    address:'Zona Hotelera Norte, CP 48333 Puerto Vallarta, Jalisco, México', category:'',
    officialUrl:'https://hotelfriendlyfun.com/',
    description:'Hotel todo incluido en la zona hotelera de Puerto Vallarta, con acceso a playa, habitaciones con vistas parciales o totales al mar y actividades para familias, parejas y amigos.',
    features:['Alimentos y bebidas 24 horas','Acceso a playa y Beach Club','Actividades recreativas','Wi-Fi','Gimnasio y SPA','Kids Club'],
    room:{name:'Habitación Estándar',note:'Referencia del hotel; la categoría exacta incluida depende de cada promoción.',details:['1 o 2 camas','Vista parcial al mar o alberca','Balcón o terraza']},
    offerIds:['OF-PA-PVR-REV26-001'],
    images:[
      ['https://hotelfriendlyfun.com/wp-content/uploads/elementor/thumbs/Nuestro-Hotel-1-scaled-rkpk2mkfr6ub38b0at452nihyyvtpleyvscw855o6w.jpg','Vista del hotel Friendly Fun Vallarta','hotel'],
      ['https://hotelfriendlyfun.com/wp-content/uploads/elementor/thumbs/Chica-2-scaled-rkpk1z2h0by50z9540ygubfz4c3nd5togk1r884iig.jpg','Área recreativa de Friendly Fun Vallarta','amenidad'],
      ['https://hotelfriendlyfun.com/wp-content/uploads/elementor/thumbs/Columpio-3-scaled-rkpk1amo2n0on48n2qe61hlzobg3t14np734r14r08.jpg','Espacio exterior de Friendly Fun Vallarta','amenidad'],
      ['https://hotelfriendlyfun.com/wp-content/uploads/2026/03/HAB-2423-06-02-2026-10.jpg','Habitación de Friendly Fun Vallarta','habitacion'],
      ['https://hotelfriendlyfun.com/wp-content/uploads/2023/06/hotel-friendly-fun-puerto-vallarta-todo-incluido-nueva-26-1024x683.jpeg','Hotel Friendly Fun Vallarta','hotel']
    ],
    sources:['https://hotelfriendlyfun.com/nuestro-hotel/','https://hotelfriendlyfun.com/estandar/','https://hotelfriendlyfun.com/faqs/']
  },
  'barcelo-puerto-vallarta': {
    id:'HOT-PVR-BARCELO-001', name:'Barceló Puerto Vallarta', destinationName:'Puerto Vallarta', category:'5 estrellas',
    address:'Zona Hotelera Sur Km 11.5, 48294, Puerto Vallarta, Jalisco, México', officialUrl:'https://www.barcelo.com/es-mx/barcelo-puerto-vallarta/',
    description:'Resort todo incluido frente a la playa de Mismaloya, rodeado de montañas y con vistas a la Bahía de Banderas. Cuenta con suites, albercas, restaurantes y servicios para familias y parejas.',
    features:['Acceso directo a Playa Mismaloya','4 albercas','Restaurantes a la carta y buffet','Spa','Servicios para familias','Habitaciones tipo suite'],
    room:{name:'Habitación según promoción',note:'La categoría exacta incluida depende de la promoción vigente.',details:['Categoría según promoción','Todo incluido','2 adultos en la promoción actual']},
    offerIds:['OF-PA-PVR-SEP26-002'],
    images:[['https://raw.githubusercontent.com/davidcastrosb-ops/viajes-troncal-proyecto-completo/main/assets/images/promos/barcelo-puerto-vallarta.jpg','Vista exterior de Barceló Puerto Vallarta','hotel']],
    sources:['https://www.barcelo.com/es-mx/barcelo-puerto-vallarta/']
  },
  'grand-decameron-bucerias': {
    id:'HOT-NAY-DECAMERON-001', name:'Grand Decameron Complex, A Trademark All Inclusive', destinationName:'Bucerías', category:'3 estrellas',
    address:'Avenida Lázaro Cárdenas #150, Bucerías, Nayarit, México', officialUrl:'https://www.decameron.com/es/hoteles/bucerias/decameron-complex/',
    description:'Complejo todo incluido en Bucerías con playa, piscinas, restaurantes, bares y actividades para familias.',
    features:['5 piscinas','Playa','Restaurantes','Bares','Gimnasio y SPA','Actividades y entretenimiento'],
    room:{name:'Habitación Estándar',note:'Los detalles de habitación deben coincidir con la promoción vigente.',details:['Promoción de prueba: Estándar 2 queens','Check-in 15:00','Check-out 12:00','Vista exterior']},
    offerIds:['OF-PA-NAY-REV26-003'],
    images:[['https://www.decameron.com/media/uploads/cms_apps/imagenes/complex-2026_7M6lI68.webp?q=pr%3Asharp%2Frs%3Afill%2Fw%3A1920%2Fh%3A600%2Fg%3Ace%2Ff%3Ajpg','Grand Decameron Complex en Bucerías','hotel']],
    sources:['https://www.decameron.com/es/hoteles/bucerias/decameron-complex/','https://www.decameron.com/es/hoteles/bucerias/decameron-complex/galeria/']
  }
};

function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function safe(v=''){try{const u=new URL(String(v));return /^https?:$/.test(u.protocol)?u.toString():'';}catch(_){return '';}}
function money(v){const n=Number(String(v??'').replace(/[^0-9.-]/g,''));return Number.isFinite(n)?new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(n):String(v||'');}
function dateMx(v=''){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(v)))return String(v||'');const d=new Date(`${v}T12:00:00`);return new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'short',year:'numeric'}).format(d);}
async function loadMaster(){const s=MASTER_ENDPOINT.includes('?')?'&':'?';const c=new AbortController();const t=setTimeout(()=>c.abort(),10000);try{const r=await fetch(`${MASTER_ENDPOINT}${s}_ts=${Date.now()}`,{cache:'no-store',redirect:'follow',signal:c.signal,headers:{'User-Agent':'TrhoncalTravel-HotelPreview/1.1','Cache-Control':'no-cache'}});if(!r.ok)throw new Error(`Master ${r.status}`);return await r.json();}finally{clearTimeout(t);}}
function galleryButton(img,i,total){const more=i===4&&total>5?`<span class="hotel-v2-gallery-more">Ver ${total} fotos</span>`:'';return `<button type="button" data-gallery-index="${i}" aria-label="Abrir foto ${i+1}"><img src="${esc(img[0])}" alt="${esc(img[1])}" loading="${i?'lazy':'eager'}">${more}</button>`;}
function splitText(v){return String(v||'').split(/;|\n/).map(x=>x.trim()).filter(Boolean);}

export default async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).send('Method not allowed');}
  const slug=String(req.query.slug||'').trim();const fallback=HOTELS[slug];
  if(!fallback){res.setHeader('X-Robots-Tag','noindex,nofollow');return res.status(404).send('Hotel de prueba no disponible');}
  let payload={offers:[]};try{payload=await loadMaster();}catch(_){}
  const offers=Array.isArray(payload.offers)?payload.offers:[];
  const masterHotels=Array.isArray(payload.hotels)?payload.hotels:[];
  const masterImages=Array.isArray(payload.hotelImages)?payload.hotelImages:[];
  const masterHotel=masterHotels.find(h=>h&&h.slug===slug)||null;
  const masterGallery=masterHotel?masterImages.filter(img=>img&&img.hotelId===masterHotel.id&&safe(img.url)).sort((a,b)=>(a.order||999)-(b.order||999)).map(img=>[img.url,img.alt||masterHotel.name,String(img.type||'').toLowerCase()]):[];
  const hotel={
    ...fallback,
    ...(masterHotel?{
      id:masterHotel.id||fallback.id,
      name:masterHotel.name||fallback.name,
      destinationName:masterHotel.destinationName||fallback.destinationName,
      address:masterHotel.address||fallback.address,
      category:masterHotel.category||fallback.category,
      officialUrl:masterHotel.officialUrl||fallback.officialUrl,
      description:masterHotel.description||fallback.description,
      features:Array.isArray(masterHotel.amenities)&&masterHotel.amenities.length?masterHotel.amenities:fallback.features,
      room:masterHotel.room&&typeof masterHotel.room==='object'?{name:masterHotel.room.name||fallback.room.name,note:masterHotel.room.note||fallback.room.note,details:Array.isArray(masterHotel.room.details)&&masterHotel.room.details.length?masterHotel.room.details:fallback.room.details}:fallback.room,
      images:masterGallery.length?masterGallery:fallback.images,
      sources:[masterHotel.officialUrl,...fallback.sources].filter(Boolean)
    }:{}),
  };
  const requested=String(req.query.oferta||'').trim();
  const validOfferIds=new Set(fallback.offerIds||[]);
  const belongs=o=>o&&(o.hotelId===hotel.id||validOfferIds.has(o.id));
  const offer=offers.find(o=>belongs(o)&&(requested?o.id===requested:true))||offers.find(belongs)||null;
  const images=(hotel.images||[]).filter(x=>safe(x[0]));
  const hero=images[0]||null;const roomImage=images.find(x=>String(x[2]||'').includes('habit'))||images[1]||hero;
  const destinationName=offer?.leadDestinationVerified||hotel.destinationName;
  const title=offer?.title||hotel.name;
  const requestHost=String(req.headers.host||PUBLIC_HOST).split(':')[0];
  const previewUrl=`https://${requestHost}/hotel-v2/${encodeURIComponent(slug)}${offer?`?oferta=${encodeURIComponent(offer.id)}`:''}`;
  const quote=new URLSearchParams({cta:'hotel_minisite_v2',destino:destinationName});
  if(offer?.travelStart)quote.set('salida',offer.travelStart);if(offer?.travelEnd)quote.set('regreso',offer.travelEnd);if(offer?.occasionId)quote.set('ocasion',offer.occasionId);if(offer?.id)quote.set('oferta',offer.id);if(offer?.plan)quote.set('plan',offer.plan);
  const quoteUrl=`/cotizar-v2/?${quote.toString()}`;
  const pdfUrl=offer?`/oferta-v2/${encodeURIComponent(offer.id)}.pdf`:'';
  const shareText=`${title}. Conoce el hotel y consulta la promoción actual con Trhoncal Travel.`;
  const wa=`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${previewUrl}`)}`;
  const mail=`mailto:?subject=${encodeURIComponent(`Mira esta opción: ${hotel.name}`)}&body=${encodeURIComponent(`${shareText}\n\n${previewUrl}`)}`;
  const dates=[offer?.travelStart?dateMx(offer.travelStart):'',offer?.travelEnd?dateMx(offer.travelEnd):''].filter(Boolean);
  const duration=[offer?.days?`${offer.days} días`:'',offer?.nights?`${offer.nights} noches`:''].filter(Boolean).join(' · ');
  const price=offer?.price?money(offer.price):'';
  const includes=Array.isArray(offer?.includes)?offer.includes:[];
  const gallery=images.length?images.slice(0,5).map((x,i)=>galleryButton(x,i,images.length)).join(''):`<div class="hotel-v2-gallery-empty">La galería de este hotel se está preparando.</div>`;
  const features=(hotel.features||[]).map(x=>`<div class="hotel-v2-feature">${esc(x)}</div>`).join('');
  const roomDetails=(hotel.room?.details||[]).map(x=>`<li>${esc(x)}</li>`).join('');
  const offerEssentials=includes.length?includes.map(x=>`<li>${esc(x)}</li>`).join(''):`${offer?.hotel?`<li>Hotel: <span translate="no" class="notranslate">${esc(offer.hotel)}</span></li>`:''}${duration?`<li>Estancia: ${esc(duration)}</li>`:''}${offer?.plan?`<li>Plan: ${esc(offer.plan)}</li>`:''}${offer?.occupancy?`<li>Viajeros: ${esc(offer.occupancy)}</li>`:''}`;
  const mapSrc=`https://www.google.com/maps?q=${encodeURIComponent(hotel.address)}&output=embed`;
  const sourceLinks=[...new Set(hotel.sources||[])].map((u,i)=>`<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">Fuente ${i+1}</a>`).join(' · ');
  const galleryData=JSON.stringify(images.map(x=>({url:x[0],alt:x[1]}))).replace(/</g,'\\u003c');
  const mobilePrice=price||'Consultar';
  res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('X-Robots-Tag','noindex,nofollow');res.setHeader('Cache-Control','public, s-maxage=60, stale-while-revalidate=180');
  return res.status(200).send(`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | Vista previa Trhoncal Travel</title><meta name="robots" content="noindex,nofollow"><link rel="icon" type="image/svg+xml" href="/assets/images/trhoncal-travel-logo.svg"><link rel="stylesheet" href="/assets/css/styles.css"><link rel="stylesheet" href="/assets/css/brand-v2.css"><link rel="stylesheet" href="/assets/css/hotel-v2.css"></head><body class="hotel-v2-page">
  <header class="site-header"><div class="container header-inner"><a class="brand" href="/"><img class="brand-logo" src="/assets/images/trhoncal-travel-logo.svg" alt="Trhoncal Travel"></a><nav class="nav"><a href="/#destinos">Destinos</a><a href="/cuando-viajar/">Cuándo viajar</a><a href="/#promociones">Ofertas</a><a href="/cotizar-v2/">Solicita tu viaje</a></nav><a class="btn btn-outline" href="https://wa.me/523329335952">WhatsApp</a></div></header>
  <div class="hotel-v2-preview">VISTA PREVIA · NUEVO MINI SITIO DE HOTEL · la ficha /oferta actual sigue intacta</div>
  <main class="hotel-v2-main">
   <section class="hotel-v2-hero"><div class="container hotel-v2-hero-grid"><div class="hotel-v2-copy"><span class="eyebrow">${offer?'Promoción activa sobre ficha permanente':'Conoce el hotel'}</span><h1 translate="no" class="notranslate">${esc(title)}</h1><p class="hotel-v2-hotel" translate="no">Hotel: ${esc(hotel.name)}${hotel.category?` · ${esc(hotel.category)}`:''}</p><p>${esc(hotel.description)}</p>${offer?`<div class="hotel-v2-tags">${dates.length?`<span>${esc(dates.join(' – '))}</span>`:''}${duration?`<span>${esc(duration)}</span>`:''}${offer.occupancy?`<span>${esc(offer.occupancy)}</span>`:''}${offer.plan?`<span>${esc(offer.plan)}</span>`:''}</div><div class="hotel-v2-price-row">${price?`<div class="hotel-v2-price"><small>${esc(offer.priceUnit||'Precio publicado')}</small><strong>${esc(price)}</strong><span>MXN</span></div>`:''}<a class="btn btn-primary" href="${esc(quoteUrl)}">Quiero este viaje →</a></div>`:''}</div><div class="hotel-v2-hero-image">${hero?`<img src="${esc(hero[0])}" alt="${esc(hero[1])}">`:'<div class="offer-image-fallback">Imagen del hotel pendiente</div>'}</div></div></section>
   ${offer?`<section class="hotel-v2-actions"><div class="container"><div class="hotel-v2-action-card"><strong>Guárdala, compártela o envíala a quien viaje contigo.</strong><div class="hotel-v2-action-buttons"><button class="hotel-v2-mini primary" type="button" data-native-share>Compartir promoción</button>${pdfUrl?`<a class="hotel-v2-mini gold" href="${esc(pdfUrl)}">Descargar PDF V2</a>`:''}<a class="hotel-v2-mini" href="${esc(wa)}" target="_blank">WhatsApp</a><a class="hotel-v2-mini" href="${esc(mail)}">Correo</a><button class="hotel-v2-mini" type="button" data-copy>Copiar enlace</button></div></div></div></section>`:''}
   <div class="container hotel-v2-nav-wrap"><nav class="hotel-v2-nav"><a href="#fotos">Fotos</a><a href="#habitacion">Habitación</a><a href="#hotel">Acerca del hotel</a><a href="#servicios">Servicios</a><a href="#ubicacion">Ubicación</a></nav></div>
   <section class="hotel-v2-section" id="fotos"><div class="container"><span class="eyebrow">Conócelo sin salir de Trhoncal</span><h2>Fotos del hotel</h2>${images.length?`<div class="hotel-v2-gallery">${gallery}</div>`:gallery}</div></section>
   <section class="hotel-v2-section" id="hotel"><div class="container hotel-v2-grid"><article class="hotel-v2-card"><span class="eyebrow">Lo esencial de esta promoción</span><h3>${offer?'Lo que estás viendo':'Consulta opciones vigentes'}</h3><ul class="hotel-v2-list">${offerEssentials}</ul></article><article class="hotel-v2-card" id="servicios"><span class="eyebrow">Conoce el hotel</span><h3 translate="no">${esc(hotel.name)}</h3><p class="hotel-v2-section-copy">${esc(hotel.description)}</p><div class="hotel-v2-features">${features}</div></article></div></section>
   <section class="hotel-v2-section" id="habitacion"><div class="container"><article class="hotel-v2-card"><span class="eyebrow">Tu habitación</span><h3>${esc(hotel.room?.name||'Habitación')}</h3><div class="hotel-v2-room">${roomImage?`<img src="${esc(roomImage[0])}" alt="${esc(roomImage[1])}">`:''}<div><ul class="hotel-v2-list">${roomDetails}</ul><p class="hotel-v2-room-note">${esc(hotel.room?.note||'La habitación exacta se confirma antes de reservar.')}</p></div></div></article></div></section>
   <section class="hotel-v2-section" id="ubicacion"><div class="container hotel-v2-map-grid"><div class="hotel-v2-map-copy"><span class="eyebrow">Ubicación</span><h2>${esc(destinationName)}</h2><p>${esc(hotel.address)}</p><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.address)}" target="_blank" rel="noopener noreferrer">Abrir mapa ↗</a></div><iframe class="hotel-v2-map-frame" loading="lazy" src="${esc(mapSrc)}" title="Mapa de ${esc(hotel.name)}"></iframe></div></section>
   <section class="hotel-v2-final"><div class="container hotel-v2-final-card"><div><span class="eyebrow">Siguiente paso</span><h2>¿Quieres avanzar con este viaje?</h2><p>El formulario abre con destino, fechas y promoción ya precargados.</p></div><a class="btn btn-primary" href="${esc(quoteUrl)}">Ir al formulario de este viaje →</a></div></section>
   <div class="container hotel-v2-sources">Información del hotel contrastada con fuentes del establecimiento. ${sourceLinks}</div>
  </main>
  ${offer?`<div class="hotel-v2-mobile-cta"><strong>${esc(mobilePrice)}</strong><a class="btn" href="${esc(quoteUrl)}">Quiero este viaje</a></div>`:''}
  <div class="hotel-v2-lightbox" aria-hidden="true"><div class="hotel-v2-lightbox-inner"><div class="hotel-v2-lightbox-stage"><button class="hotel-v2-lightbox-close" aria-label="Cerrar">×</button><button class="hotel-v2-lightbox-prev" aria-label="Anterior">‹</button><img alt=""><button class="hotel-v2-lightbox-next" aria-label="Siguiente">›</button></div><div class="hotel-v2-lightbox-strip"></div></div></div>
  <script>const GALLERY=${galleryData};const lb=document.querySelector('.hotel-v2-lightbox'),stage=lb?.querySelector('.hotel-v2-lightbox-stage img'),strip=lb?.querySelector('.hotel-v2-lightbox-strip');let gi=0;function paint(){if(!GALLERY.length)return;stage.src=GALLERY[gi].url;stage.alt=GALLERY[gi].alt||'';strip.innerHTML=GALLERY.map((x,i)=>'<button class="'+(i===gi?'active':'')+'" data-thumb="'+i+'"><img src="'+x.url+'" alt=""></button>').join('');}function openGallery(i){if(!lb||!GALLERY.length)return;gi=i||0;paint();lb.classList.add('is-open');lb.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}function closeGallery(){lb?.classList.remove('is-open');lb?.setAttribute('aria-hidden','true');document.body.style.overflow='';}document.querySelectorAll('[data-gallery-index]').forEach(b=>b.addEventListener('click',()=>openGallery(Number(b.dataset.galleryIndex))));lb?.querySelector('.hotel-v2-lightbox-close')?.addEventListener('click',closeGallery);lb?.querySelector('.hotel-v2-lightbox-prev')?.addEventListener('click',()=>{gi=(gi-1+GALLERY.length)%GALLERY.length;paint();});lb?.querySelector('.hotel-v2-lightbox-next')?.addEventListener('click',()=>{gi=(gi+1)%GALLERY.length;paint();});strip?.addEventListener('click',e=>{const b=e.target.closest('[data-thumb]');if(b){gi=Number(b.dataset.thumb);paint();}});lb?.addEventListener('click',e=>{if(e.target===lb)closeGallery();});document.addEventListener('keydown',e=>{if(!lb?.classList.contains('is-open'))return;if(e.key==='Escape')closeGallery();if(e.key==='ArrowRight'){gi=(gi+1)%GALLERY.length;paint();}if(e.key==='ArrowLeft'){gi=(gi-1+GALLERY.length)%GALLERY.length;paint();}});document.querySelector('[data-native-share]')?.addEventListener('click',async()=>{try{if(navigator.share)await navigator.share({title:${JSON.stringify(title)},text:${JSON.stringify(shareText)},url:${JSON.stringify(previewUrl)}});else{await navigator.clipboard.writeText(${JSON.stringify(previewUrl)});alert('Enlace copiado');}}catch(_){}});document.querySelector('[data-copy]')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(${JSON.stringify(previewUrl)});alert('Enlace copiado');}catch(_){}});</script>
  </body></html>`);
}
