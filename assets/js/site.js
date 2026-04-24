let SITE = null;

async function loadJSON(path){
  const response = await fetch(path, { cache: 'no-store' });
  if(!response.ok) throw new Error('No se pudo cargar ' + path);
  return response.json();
}

function setText(id, text){
  const el = document.getElementById(id);
  if(el) el.textContent = text || '';
}
function setHref(id, href){
  const el = document.getElementById(id);
  if(el) el.href = href || '#';
}
function setSrc(id, src, alt=''){
  const el = document.getElementById(id);
  if(el){
    el.src = src || '';
    if(alt) el.alt = alt;
  }
}

function whatsappLink(message='Hola, quiero cotizar un viaje con Viajes Troncal.'){
  return `https://wa.me/${SITE.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}

function applyConfig(){
  if(SITE.theme){
    document.documentElement.style.setProperty('--primary', SITE.theme.primary || '#00a9b7');
    document.documentElement.style.setProperty('--primary-dark', SITE.theme.primaryDark || '#008997');
    document.documentElement.style.setProperty('--gold', SITE.theme.gold || '#d9a441');
    document.documentElement.style.setProperty('--navy', SITE.theme.navy || '#062b49');
    document.documentElement.style.setProperty('--soft', SITE.theme.soft || '#f3fbfc');
  }

  document.title = SITE.meta?.title || 'Viajes Troncal | Cotiza tu viaje';

  setSrc('brandLogo', SITE.brand.logo, SITE.brand.name);
  setSrc('heroLogo', SITE.brand.logo, SITE.brand.name);
  setSrc('heroImage', SITE.hero.image, SITE.hero.title);

  setText('heroKicker', SITE.hero.kicker);
  setText('heroTitle', SITE.hero.title);
  setText('heroAccent', SITE.hero.accent);
  setText('heroSubtitle', SITE.hero.subtitle);

  const wa = whatsappLink('Hola, quiero cotizar un viaje con Viajes Troncal.');
  setHref('headerWhatsapp', wa);
  setHref('heroWhatsapp', wa);
  setHref('footerWhatsapp', wa);
  setHref('whatsFloat', wa);
  setText('footerWhatsapp', SITE.contact.phoneDisplay || 'WhatsApp');
  setHref('footerMail', `mailto:${SITE.contact.email}`);
  setText('footerMail', SITE.contact.email || 'Correo');

  setHref('socialFacebook', SITE.social.facebook);
  setHref('socialInstagram', SITE.social.instagram);
  setHref('socialTikTok', SITE.social.tiktok);

  const frame = document.getElementById('jotform-frame');
  const jotformUrl = SITE.forms?.jotformUrl || 'https://form.jotform.com/261127730314044';
  if(frame) frame.src = jotformUrl;
  setHref('jotformLink', jotformUrl);
}

async function loadPromosIntoCards(){
  const grid = document.getElementById('promosCards');
  if(!grid) return;

  let links = [];
  try{
    links = await loadJSON('assets/data/promos.json');
  }catch(e){
    console.warn('No se pudieron cargar promociones', e);
  }

  grid.innerHTML = '';
  if(!Array.isArray(links) || links.length === 0){
    grid.innerHTML = `
      <article class="promo-card">
        <h3>Promociones próximas</h3>
        <p>Agrega tus links en <strong>assets/data/promos.json</strong> para mostrar fichas de viaje aquí.</p>
      </article>`;
    return;
  }

  for(const entry of links){
    const link = typeof entry === 'string' ? entry : entry.url;
    if(!link) continue;
    try{
      const response = await fetch('/api/preview?url=' + encodeURIComponent(link));
      const meta = await response.json();
      const title = meta.title && meta.title !== 'PromoMaker' ? meta.title : 'Promoción especial';
      const desc = meta.description || 'Descubre esta promoción y cotiza por WhatsApp.';
      const image = meta.image || SITE.hero.image;
      const wa = whatsappLink(`Hola, quiero información de esta promoción:\n${title}\n${link}`);

      grid.insertAdjacentHTML('beforeend', `
        <article class="promo-card">
          <img src="${image}" alt="${title}">
          <h3>${title}</h3>
          <p>${desc}</p>
          <div class="promo-actions">
            <a class="btn btn-soft" href="${link}" target="_blank" rel="noopener noreferrer">Ver promoción</a>
            <a class="btn btn-primary" href="${wa}" target="_blank" rel="noopener noreferrer">Cotizar por WhatsApp</a>
          </div>
        </article>
      `);
    }catch(error){
      console.error(error);
    }
  }
}

async function init(){
  SITE = await loadJSON('assets/data/site.json');
  applyConfig();
  loadPromosIntoCards();
}

document.addEventListener('DOMContentLoaded', init);
