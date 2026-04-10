
let SITE = null;
let CURRENT_DESTINATIONS = [];
let CURRENT_MODAL = null;

async function loadJSON(path){
  const res = await fetch(path);
  if(!res.ok) throw new Error('No se pudo cargar ' + path);
  return res.json();
}

function $(sel){ return document.querySelector(sel); }
function $all(sel){ return [...document.querySelectorAll(sel)]; }

function setThemeVars(theme){
  document.documentElement.style.setProperty('--primary', theme.primary);
  document.documentElement.style.setProperty('--secondary', theme.secondary);
  document.documentElement.style.setProperty('--dark', theme.dark);
  document.documentElement.style.setProperty('--light-bg', theme.lightBg);
}

function applyBrand(){
  document.title = SITE.brand.name;
  $('#brandLogo').src = SITE.brand.logo;
  $('#brandLogo').alt = SITE.brand.name;
  $('#brandName').textContent = SITE.brand.name;
  $('#brandTagline').textContent = SITE.brand.tagline;
  $('#topPhone').textContent = SITE.contact.phoneDisplay;
  $('#topPhone').href = 'https://wa.me/' + SITE.contact.whatsapp;
  $('#whatsFloat').href = 'https://wa.me/' + SITE.contact.whatsapp;
  $('#whatsFloat').textContent = 'WhatsApp';
  $('#socialFacebook').href = SITE.social.facebook;
  $('#socialInstagram').href = SITE.social.instagram;
  $('#socialTikTok').href = SITE.social.tiktok;
  $('#footerFacebook').href = SITE.social.facebook;
  $('#footerInstagram').href = SITE.social.instagram;
  $('#footerTikTok').href = SITE.social.tiktok;
  $('#footerPhone').href = 'https://wa.me/' + SITE.contact.whatsapp;
  $('#footerPhone').textContent = SITE.contact.phoneDisplay;
  $('#footerMail').textContent = SITE.contact.email;
  $('#footerMail').href = 'mailto:' + SITE.contact.email;
}

function renderHeroDefault(){
  const hero = SITE.heroDefault;
  $('#heroTitle').textContent = hero.title;
  $('#heroSubtitle').textContent = hero.subtitle;
  $('#heroImage').src = hero.image;
  $('#heroImage').alt = hero.title;
  $('#bannerPromoImagen').src = hero.image;
  $('#bannerPromoImagen').alt = hero.title;
}

function buildDestinationOptions(){
  const select = $('#destino');
  const options = ['<option value="">Selecciona un destino</option>']
    .concat(SITE.destinations.map(d => `<option value="${d.slug}">${d.name}</option>`));
  select.innerHTML = options.join('');
}

function updateAgesFields(){
  const count = Number($('#ninos').value || 0);
  const wrap = $('#edadesWrap');
  wrap.innerHTML = '';
  if(count <= 0){
    wrap.classList.add('hidden');
    return;
  }
  wrap.classList.remove('hidden');
  for(let i = 1; i <= count; i++){
    const div = document.createElement('div');
    div.className = 'field';
    div.innerHTML = `
      <label>Edad niño ${i}</label>
      <select name="edad_nino_${i}" class="edad-nino">
        <option value="">Selecciona edad</option>
        ${Array.from({length: 18}, (_, n) => `<option value="${n}">${n} años</option>`).join('')}
      </select>`;
    wrap.appendChild(div);
  }
}

function createWhatsMessage(data){
  const edades = data.childAges.length ? `\nEdades niños: ${data.childAges.join(', ')}` : '';
  return `Hola, quiero información de viaje.%0A` +
    `Destino de interés: ${encodeURIComponent(data.destinationName)}%0A` +
    `Adultos: ${data.adults}%0A` +
    `Niños: ${data.children}${edades}%0A` +
    `Nombre: ${encodeURIComponent(data.name)}%0A` +
    `Teléfono: ${encodeURIComponent(data.phone)}%0A` +
    `Comentario: ${encodeURIComponent(data.comments || 'Sin comentario')}`;
}

async function saveToSheets(data){
  const endpoint = SITE.contact.sheetsEndpoint;
  if(!endpoint || endpoint.includes('PEGA_AQUI')) return { ok: false, skipped: true };
  try{
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data),
      mode: 'cors'
    });
    return { ok: res.ok };
  }catch(err){
    return { ok: false, error: String(err) };
  }
}

function destinationBySlug(slug){
  return SITE.destinations.find(d => d.slug === slug);
}

function updateHeroForDestination(slug){
  const d = destinationBySlug(slug);
  if(!d){
    renderHeroDefault();
    return;
  }
  $('#heroTitle').textContent = d.name;
  $('#heroSubtitle').textContent = d.summary;
  $('#heroImage').src = d.images[0];
  $('#heroImage').alt = d.name;
}

function promoWhatsapp(link, title){
  const msg = encodeURIComponent(`Hola, quiero información de esta promoción:\n${title}\n${link}`);
  return `https://wa.me/${SITE.contact.whatsapp}?text=${msg}`;
}

function destinationWhatsapp(dest){
  const msg = encodeURIComponent(`Hola, quiero información de ${dest.name}. Vi la ficha en la landing y me gustaría cotizar.`);
  return `https://wa.me/${SITE.contact.whatsapp}?text=${msg}`;
}

function renderDestinations(list){
  CURRENT_DESTINATIONS = list;
  const grid = $('#destinationsGrid');
  grid.innerHTML = list.map(dest => `
    <article class="card">
      <div class="card-media">
        <img src="${dest.images[0]}" alt="${dest.name}">
        <span class="badge">${dest.region}</span>
      </div>
      <div class="card-body">
        <h3>${dest.name}</h3>
        <p>${dest.summary}</p>
        <div class="card-actions">
          <button class="btn btn-card-secondary" data-gallery="${dest.slug}">Ver galería</button>
          <a class="btn btn-card" href="${destinationWhatsapp(dest)}" target="_blank" rel="noopener noreferrer">Cotizar por WhatsApp</a>
        </div>
      </div>
    </article>
  `).join('');

  $all('[data-gallery]').forEach(btn => {
    btn.addEventListener('click', () => openGallery(btn.dataset.gallery));
  });
}

function setupFilters(){
  $all('.pill').forEach(btn => {
    btn.addEventListener('click', () => {
      $all('.pill').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      const list = filter === 'all' ? SITE.destinations : SITE.destinations.filter(d => d.category === filter);
      renderDestinations(list);
    });
  });
}

function openGallery(slug){
  const d = destinationBySlug(slug);
  if(!d) return;
  CURRENT_MODAL = { slug, current: 0 };
  $('#modalTitle').textContent = d.name;
  $('#modalMainImage').src = d.images[0];
  $('#modalMainImage').alt = d.name;
  $('#modalWhatsapp').href = destinationWhatsapp(d);
  $('#modalThumbs').innerHTML = d.images.map((img, i) => `
    <img src="${img}" alt="${d.name} ${i+1}" data-modal-img="${i}" class="${i===0 ? 'active' : ''}">
  `).join('');
  $all('[data-modal-img]').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const index = Number(thumb.dataset.modalImg);
      CURRENT_MODAL.current = index;
      $('#modalMainImage').src = d.images[index];
      $all('[data-modal-img]').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });
  $('#galleryModal').classList.add('show');
}

function closeGallery(){
  $('#galleryModal').classList.remove('show');
}

async function loadPromotions(){
  const bannerTitle = $('#bannerPromoTitulo');
  const bannerSubtitle = $('#bannerPromoSubtitulo');
  const bannerImage = $('#bannerPromoImagen');
  const bannerButton = $('#bannerPromoBoton');
  const grid = $('#promosGrid');
  try{
    const promos = await loadJSON('assets/data/promos.json');
    if(!Array.isArray(promos) || promos.length === 0){
      grid.innerHTML = '<p>No hay promociones activas por el momento.</p>';
      return;
    }
    let first = null;
    for(const entry of promos){
      const link = typeof entry === 'string' ? entry : entry.url;
      if(!link) continue;
      try{
        const r = await fetch('/api/preview?url=' + encodeURIComponent(link));
        const meta = await r.json();
        const title = meta.title || 'Promoción de viaje';
        const desc = meta.description || 'Descubre esta promoción y cotiza por WhatsApp.';
        const image = meta.image || SITE.heroDefault.image;
        if(!first) first = {link, title, desc, image};
        const card = document.createElement('article');
        card.className = 'promo-card';
        card.innerHTML = `
          <img class="promo-image" src="${image}" alt="${title}">
          <div class="promo-body">
            <h3 class="promo-title">${title}</h3>
            <p class="promo-description">${desc}</p>
            <div class="promo-actions">
              <a class="btn btn-card-secondary" href="${link}" target="_blank" rel="noopener noreferrer">Ver promoción</a>
              <a class="btn btn-card" href="${promoWhatsapp(link, title)}" target="_blank" rel="noopener noreferrer">Cotizar por WhatsApp</a>
            </div>
          </div>
        `;
        grid.appendChild(card);
      }catch(err){
        console.error('Error cargando promo', link, err);
      }
    }
    if(first){
      bannerTitle.textContent = first.title;
      bannerSubtitle.textContent = first.desc;
      bannerImage.src = first.image;
      bannerImage.alt = first.title;
      bannerButton.href = first.link;
    }
  }catch(err){
    console.error(err);
    grid.innerHTML = '<p>No se pudieron cargar las promociones.</p>';
  }
}

function setupForm(){
  $('#ninos').addEventListener('change', updateAgesFields);
  $('#destino').addEventListener('change', (e) => updateHeroForDestination(e.target.value));
  $('#travelForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const slug = $('#destino').value;
    const d = destinationBySlug(slug);
    const childAges = $all('.edad-nino').map(s => s.value).filter(Boolean);
    const data = {
      destinationSlug: slug || '',
      destinationName: d ? d.sheetLabel : 'No especificado',
      adults: $('#adultos').value || '1',
      children: $('#ninos').value || '0',
      childAges,
      name: $('#nombre').value || '',
      phone: $('#telefono').value || '',
      comments: $('#comentario').value || '',
      page: window.location.href,
      source: 'Landing Viajes Troncal',
      createdAt: new Date().toISOString()
    };
    $('#formStatus').textContent = 'Enviando...';
    await saveToSheets(data);
    const wa = `https://wa.me/${SITE.contact.whatsapp}?text=${createWhatsMessage(data)}`;
    $('#formStatus').textContent = 'Abriendo WhatsApp...';
    window.open(wa, '_blank');
    setTimeout(() => { $('#formStatus').textContent = 'Listo. Tu solicitud se preparó.'; }, 800);
  });
}

async function init(){
  SITE = await loadJSON('assets/data/site.json');
  setThemeVars(SITE.theme);
  applyBrand();
  renderHeroDefault();
  buildDestinationOptions();
  updateAgesFields();
  renderDestinations(SITE.destinations);
  setupFilters();
  setupForm();
  loadPromotions();
  $('#galleryClose').addEventListener('click', closeGallery);
  $('#galleryModal').addEventListener('click', (e) => {
    if(e.target.id === 'galleryModal') closeGallery();
  });
}
document.addEventListener('DOMContentLoaded', init);
