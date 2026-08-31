import hotelV2 from './hotel-v2.js';

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

function esc(v=''){
  return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function injectFallbackGallery(html, slug){
  const images = FALLBACK_GALLERIES[slug] || [];
  if (!images.length || typeof html !== 'string') return html;

  // Si el endpoint ya recibió imágenes aprobadas del Maestro, no intervenimos.
  if (!html.includes('Galería en preparación')) return html;

  const heroPlaceholder = '<div class="hotel-v2-gallery-empty"><strong>Galería en preparación</strong><p>Mostramos fotografías únicamente cuando su permiso de uso web está verificado.</p></div>';
  const galleryPlaceholder = '<div class="hotel-v2-gallery-empty"><strong>Galería en preparación</strong><p>Las imágenes aparecerán en cuanto sus derechos estén aprobados para uso web.</p></div>';

  const hero = `<img src="${esc(images[0][0])}" alt="${esc(images[0][1])}">`;
  const gallery = images.slice(0,5).map((img,i)=>
    `<button type="button" data-gallery-index="${i}" aria-label="Abrir fotografía ${i+1}"><img src="${esc(img[0])}" alt="${esc(img[1])}" loading="${i?'lazy':'eager'}">${i===4&&images.length>5?`<span class="hotel-v2-gallery-more">Ver ${images.length} fotos</span>`:''}</button>`
  ).join('');

  const galleryData = JSON.stringify(images.map(x=>({url:x[0],alt:x[1]}))).replace(/</g,'\\u003c');

  return html
    .replace(heroPlaceholder, hero)
    .replace(galleryPlaceholder, `<div class="hotel-v2-gallery">${gallery}</div>`)
    .replace('const GALLERY=[]', `const GALLERY=${galleryData}`);
}

export default async function handler(req,res){
  const originalSend = res.send.bind(res);
  res.send = body => {
    const slug = String(req.query?.slug || '').trim().toLowerCase();
    return originalSend(injectFallbackGallery(body, slug));
  };
  return hotelV2(req,res);
}
