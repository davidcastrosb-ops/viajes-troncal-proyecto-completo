import hotelV2 from './hotel-v2.js';

const PUBLIC_ORIGIN = 'https://viajes.trhoncalhomes.com.mx';

const FALLBACK_GALLERIES = {
  'friendly-fun-vallarta': [
    ['/assets/images/hoteles/friendly-fun-vallarta/01.jpg','Vista general de Friendly Fun Vallarta'],
    ['/assets/images/hoteles/friendly-fun-vallarta/02.jpg','Alberca de Friendly Fun Vallarta'],
    ['/assets/images/hoteles/friendly-fun-vallarta/03.jpg','Habitación de Friendly Fun Vallarta'],
    ['/assets/images/hoteles/friendly-fun-vallarta/04.jpg','Área común de Friendly Fun Vallarta']
  ],
  'barcelo-puerto-vallarta': [
    ['/assets/images/hoteles/barcelo-puerto-vallarta/01.jpg','Vista general de Barceló Puerto Vallarta'],
    ['/assets/images/hoteles/barcelo-puerto-vallarta/02.jpg','Exterior y playa de Barceló Puerto Vallarta'],
    ['/assets/images/hoteles/barcelo-puerto-vallarta/03.jpg','Albercas de Barceló Puerto Vallarta'],
    ['/assets/images/hoteles/barcelo-puerto-vallarta/04.jpg','Habitación de Barceló Puerto Vallarta'],
    ['/assets/images/hoteles/barcelo-puerto-vallarta/05.jpg','Vista a la bahía desde Barceló Puerto Vallarta'],
    ['/assets/images/hoteles/barcelo-puerto-vallarta/06.jpg','Exterior de Barceló Puerto Vallarta junto a la playa']
  ],
  'grand-decameron-bucerias': [
    ['/assets/images/hoteles/grand-decameron-bucerias/01.jpg','Vista del Grand Decameron Complex en Bucerías'],
    ['/assets/images/hoteles/grand-decameron-bucerias/02.jpg','Alberca del Grand Decameron Complex'],
    ['/assets/images/hoteles/grand-decameron-bucerias/03.jpg','Habitación del Grand Decameron Complex'],
    ['/assets/images/hoteles/grand-decameron-bucerias/04.jpg','Entretenimiento del Grand Decameron Complex'],
    ['/assets/images/hoteles/grand-decameron-bucerias/05.jpg','Exterior nocturno del Grand Decameron Complex']
  ]
};

const SOCIAL_CARDS = {
  'friendly-fun-vallarta': {
    title: 'Puente de la Revolución · Friendly Fun Vallarta · Todo incluido | Trhoncal Travel',
    description: 'Puerto Vallarta · 14–16 nov 2026 · 3 días / 2 noches · 2 adultos · Total $11,714 MXN.',
    image: '/assets/images/hoteles/friendly-fun-vallarta/social.jpg',
    imageAlt: 'Friendly Fun Vallarta · Trhoncal Travel',
    offerId: 'OF-PA-PVR-REV26-001'
  },
  'barcelo-puerto-vallarta': {
    title: 'Puerto Vallarta · Barceló Puerto Vallarta · Todo incluido | Trhoncal Travel',
    description: '25–27 sep 2026 · 3 días / 2 noches · 2 adultos · Total $9,948 MXN.',
    image: '/assets/images/hoteles/barcelo-puerto-vallarta/social.jpg',
    imageAlt: 'Barceló Puerto Vallarta · Trhoncal Travel',
    offerId: 'OF-PA-PVR-SEP26-002'
  },
  'grand-decameron-bucerias': {
    title: 'Puente de la Revolución · Grand Decameron Bucerías · Todo incluido | Trhoncal Travel',
    description: 'Bucerías · 14–16 nov 2026 · 3 días / 2 noches · desde $4,511 MXN por persona.',
    image: '/assets/images/hoteles/grand-decameron-bucerias/social.jpg',
    imageAlt: 'Grand Decameron Complex Bucerías · Trhoncal Travel',
    offerId: 'OF-PA-NAY-REV26-003'
  }
};

function esc(v=''){
  return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function injectFallbackGallery(html, slug){
  const images = FALLBACK_GALLERIES[slug] || [];
  if (typeof html !== 'string') return html;

  // Lanzamiento: el PDF queda fuera del camino crítico hasta completar QA post-publicación.
  let result = html.replace(/<a class="hotel-v2-mini gold" href="[^"]+">Descargar PDF<\/a>/g, '');

  if (!images.length) return result;

  // Si el endpoint ya recibió imágenes aprobadas del Maestro, no intervenimos.
  if (!result.includes('Galería en preparación')) return result;

  const heroPlaceholder = '<div class="hotel-v2-gallery-empty"><strong>Galería en preparación</strong><p>Mostramos fotografías únicamente cuando su permiso de uso web está verificado.</p></div>';
  const galleryPlaceholder = '<div class="hotel-v2-gallery-empty"><strong>Galería en preparación</strong><p>Las imágenes aparecerán en cuanto sus derechos estén aprobados para uso web.</p></div>';

  const hero = `<img src="${esc(images[0][0])}" alt="${esc(images[0][1])}">`;
  const gallery = images.slice(0,5).map((img,i)=>
    `<button type="button" data-gallery-index="${i}" aria-label="Abrir fotografía ${i+1}"><img src="${esc(img[0])}" alt="${esc(img[1])}" loading="${i?'lazy':'eager'}">${i===4&&images.length>5?`<span class="hotel-v2-gallery-more">Ver ${images.length} fotos</span>`:''}</button>`
  ).join('');

  const galleryData = JSON.stringify(images.map(x=>({url:x[0],alt:x[1]}))).replace(/</g,'\\u003c');

  return result
    .replace(heroPlaceholder, hero)
    .replace(galleryPlaceholder, `<div class="hotel-v2-gallery">${gallery}</div>`)
    .replace('const GALLERY=[]', `const GALLERY=${galleryData}`);
}

function safeShareToken(v=''){
  const token=String(v||'').trim();
  return /^[A-Za-z0-9_-]{1,40}$/.test(token)?token:'';
}

function injectSocialMeta(html, slug, req){
  if (typeof html !== 'string' || !html.includes('</head>')) return html;
  const card = SOCIAL_CARDS[slug];
  if (!card) return html;

  const requestedOffer = String(req.query?.oferta || '').trim();
  const offerId = requestedOffer || card.offerId;
  const canonical = `${PUBLIC_ORIGIN}/hotel-v2/${encodeURIComponent(slug)}${offerId?`?oferta=${encodeURIComponent(offerId)}`:''}`;
  const shareToken = safeShareToken(req.query?.share);
  const socialUrl = shareToken ? `${canonical}${canonical.includes('?')?'&':'?'}share=${encodeURIComponent(shareToken)}` : canonical;
  const image = `${PUBLIC_ORIGIN}${card.image}`;

  const meta = [
    `<link rel="canonical" href="${esc(canonical)}">`,
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="Trhoncal Travel">',
    '<meta property="og:locale" content="es_MX">',
    `<meta property="og:title" content="${esc(card.title)}">`,
    `<meta property="og:description" content="${esc(card.description)}">`,
    `<meta property="og:url" content="${esc(socialUrl)}">`,
    `<meta property="og:image" content="${esc(image)}">`,
    `<meta property="og:image:secure_url" content="${esc(image)}">`,
    '<meta property="og:image:type" content="image/jpeg">',
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    `<meta property="og:image:alt" content="${esc(card.imageAlt)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${esc(card.title)}">`,
    `<meta name="twitter:description" content="${esc(card.description)}">`,
    `<meta name="twitter:image" content="${esc(image)}">`,
    `<meta name="twitter:image:alt" content="${esc(card.imageAlt)}">`
  ].join('');

  return html.replace('</head>', `${meta}</head>`);
}

export default async function handler(req,res){
  const originalSend = res.send.bind(res);
  res.send = body => {
    const slug = String(req.query?.slug || '').trim().toLowerCase();
    const withGallery = injectFallbackGallery(body, slug);
    return originalSend(injectSocialMeta(withGallery, slug, req));
  };
  return hotelV2(req,res);
}
