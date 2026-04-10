
let SITE = null;

async function loadJSON(path){
  const r = await fetch(path);
  if(!r.ok) throw new Error('No se pudo cargar ' + path);
  return r.json();
}
function setText(id, text){ const el = document.getElementById(id); if(el) el.textContent = text || ''; }
function setHref(id, href){ const el = document.getElementById(id); if(el) el.href = href || '#'; }
function setSrc(id, src, alt=''){ const el = document.getElementById(id); if(el){ el.src = src || ''; if(alt) el.alt = alt; } }

function applyConfig(){
  document.documentElement.style.setProperty('--primary', SITE.theme.primary);
  document.documentElement.style.setProperty('--secondary', SITE.theme.secondary);
  document.documentElement.style.setProperty('--dark', SITE.theme.dark);
  document.documentElement.style.setProperty('--light-bg', SITE.theme.lightBg);

  setSrc('brandLogo', SITE.brand.logo, SITE.brand.name);
  setText('brandName', SITE.brand.name);
  setHref('topPhone', 'https://wa.me/' + SITE.contact.whatsapp);
  setText('topPhone', SITE.contact.phoneDisplay);
  setHref('footerPhone', 'https://wa.me/' + SITE.contact.whatsapp);
  setText('footerPhone', SITE.contact.phoneDisplay);
  setHref('footerMail', 'mailto:' + SITE.contact.email);
  setText('footerMail', SITE.contact.email);
  setHref('socialFacebook', SITE.social.facebook);
  setHref('socialInstagram', SITE.social.instagram);
  setHref('socialTikTok', SITE.social.tiktok);
  setHref('footerFacebook', SITE.social.facebook);
  setHref('footerInstagram', SITE.social.instagram);
  setHref('footerTikTok', SITE.social.tiktok);
  setHref('whatsFloat', 'https://wa.me/' + SITE.contact.whatsapp);

  setSrc('heroImage', SITE.hero.image, SITE.hero.title);
  setText('heroTitle', SITE.hero.title);
  setText('heroSubtitle', SITE.hero.subtitle);
}

async function loadPromosIntoCards(){
  const links = await loadJSON('assets/data/promos.json');
  const grid = document.getElementById('promosCards');
  grid.innerHTML = '';

  for(const entry of links){
    const link = typeof entry === 'string' ? entry : entry.url;
    if(!link) continue;

    try{
      const r = await fetch('/api/preview?url=' + encodeURIComponent(link));
      const meta = await r.json();
      const title = meta.title && meta.title !== 'PromoMaker' ? meta.title : 'Promoción especial';
      const desc = meta.description || 'Descubre esta promoción y cotiza por WhatsApp.';
      const image = meta.image || SITE.hero.image;
      const wa = encodeURIComponent(`Hola, quiero información de esta promoción:\n${title}\n${link}`);

      grid.insertAdjacentHTML('beforeend', `
        <article class="card">
          <img src="${image}" alt="${title}">
          <div class="card-body">
            <h3>${title}</h3>
            <p>${desc}</p>
            <div class="actions">
              <a class="btn btn-soft" href="${link}" target="_blank" rel="noopener noreferrer">Ver promoción</a>
              <a class="btn btn-primary" href="https://wa.me/${SITE.contact.whatsapp}?text=${wa}" target="_blank" rel="noopener noreferrer">Cotizar por WhatsApp</a>
            </div>
          </div>
        </article>
      `);
    }catch(e){
      console.error(e);
    }
  }
}

async function saveToSheets(data){
  const endpoint = SITE.contact.sheetsEndpoint;
  if(!endpoint || endpoint.includes('PEGA_AQUI')) return;
  try{
    await fetch(endpoint, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(data),
      mode:'cors'
    });
  }catch(e){
    console.error(e);
  }
}

function setupForm(){
  const form = document.getElementById('travelForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      destination: document.getElementById('destino').value || 'No especificado',
      adults: document.getElementById('adultos').value,
      children: document.getElementById('ninos').value,
      name: document.getElementById('nombre').value,
      phone: document.getElementById('telefono').value,
      comments: document.getElementById('comentario').value,
      source: 'Landing Viajes Troncal',
      createdAt: new Date().toISOString()
    };
    document.getElementById('formStatus').textContent = 'Preparando tu solicitud...';
    await saveToSheets(data);
    const msg = encodeURIComponent(
      `Hola, quiero información de viaje.\nDestino: ${data.destination}\nAdultos: ${data.adults}\nNiños: ${data.children}\nNombre: ${data.name}\nTeléfono: ${data.phone}\nComentario: ${data.comments || 'Sin comentario'}`
    );
    window.open(`https://wa.me/${SITE.contact.whatsapp}?text=${msg}`, '_blank');
    document.getElementById('formStatus').textContent = 'Listo. Te mandamos a WhatsApp.';
  });
}

async function init(){
  SITE = await loadJSON('assets/data/site.json');
  applyConfig();
  setupForm();
  loadPromosIntoCards();
}
document.addEventListener('DOMContentLoaded', init);
