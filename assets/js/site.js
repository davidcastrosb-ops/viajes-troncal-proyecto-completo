let SITE = null;

async function loadJSON(path){
  const r = await fetch(path, {cache:'no-store'});
  if(!r.ok) throw new Error('No se pudo cargar ' + path);
  return r.json();
}
function $(id){ return document.getElementById(id); }
function setHref(id, href){ const el=$(id); if(el) el.href=href || '#'; }
function setSrc(id, src, alt=''){ const el=$(id); if(el){ el.src=src || ''; if(alt) el.alt=alt; } }
function setText(id, text){ const el=$(id); if(el) el.textContent=text || ''; }
function waLink(message='Hola, quiero cotizar un viaje con Viajes Troncal.'){ return `https://wa.me/${SITE.contact.whatsapp}?text=${encodeURIComponent(message)}`; }

function applyConfig(){
  const t=SITE.theme || {};
  document.documentElement.style.setProperty('--primary', t.primary || '#079EAA');
  document.documentElement.style.setProperty('--primary-dark', t.primaryDark || '#006F7D');
  document.documentElement.style.setProperty('--secondary', t.secondary || '#D9A441');
  document.documentElement.style.setProperty('--dark', t.dark || '#08233D');
  document.documentElement.style.setProperty('--light-bg', t.lightBg || '#F1FBFC');
  setSrc('brandLogo', SITE.brand.logo, SITE.brand.name);
  setSrc('heroImage', SITE.hero.image, SITE.hero.title);
  setText('heroTitle', SITE.hero.title);
  setText('heroScript', SITE.hero.script);
  setText('heroSubtitle', SITE.hero.subtitle);
  setHref('headerWhatsapp', waLink());
  setHref('whatsFloat', waLink());
  setHref('footerPhone', waLink());
  setText('footerPhone', SITE.contact.phoneDisplay);
  setHref('footerMail', 'mailto:' + SITE.contact.email);
  setText('footerMail', SITE.contact.email);
  setHref('socialFacebook', SITE.social.facebook);
  setHref('socialInstagram', SITE.social.instagram);
  setHref('socialTikTok', SITE.social.tiktok);
  setHref('jotformBackup', SITE.integrations.jotformUrl);
}

function getChecked(name){ return [...document.querySelectorAll(`[name="${name}"]:checked`)].map(el=>el.value); }
function buildPretty(data){
  return [
    `Nombre completo:${data.nombre}`,
    `WhatsApp:${data.whatsapp}`,
    `Correo electrónico:${data.email || 'No proporcionado'}`,
    `Destino deseado:${data.destino}`,
    `Ciudad de salida:${data.salida}`,
    `Fecha tentativa de salida:${data.fechaSalida || 'Sin fecha'}`,
    `Fecha tentativa de regreso:${data.fechaRegreso || 'Sin fecha'}`,
    `Número aproximado de personas:${data.personas}`,
    `Tipo de viaje:${data.tipoViaje}`,
    `¿Qué necesitas incluir?:${data.servicios.join(' ') || 'No especificado'}`,
    `Presupuesto aproximado por persona:${data.presupuesto || 'No especificado'}`,
    `Comentarios adicionales:${data.comentarios || 'Sin comentarios'}`
  ].join(', ');
}

async function sendToMake(data){
  const url = SITE.integrations && SITE.integrations.makeWebhookUrl;
  if(!url || url.includes('PEGA_AQUI')) throw new Error('Falta configurar makeWebhookUrl en assets/data/site.json');
  const payload = new URLSearchParams();
  payload.set('action','');
  payload.set('webhookURL', url);
  payload.set('username','landing-viajes-troncal');
  payload.set('formID','landing-viajes-troncal');
  payload.set('type','WEB');
  payload.set('formTitle','Cotiza tu viaje con Viajes Troncal');
  payload.set('submissionID', String(Date.now()));
  payload.set('pretty', buildPretty(data));
  payload.set('rawRequest', JSON.stringify(data));
  await fetch(url, {method:'POST', mode:'no-cors', body:payload});
}

function setupForm(){
  const form=$('travelForm');
  const status=$('formStatus');
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const data={
      nombre:$('nombre').value.trim(),
      whatsapp:$('whatsapp').value.trim(),
      email:$('email').value.trim(),
      destino:$('destino').value.trim(),
      salida:$('salida').value.trim(),
      fechaSalida:$('fechaSalida').value,
      fechaRegreso:$('fechaRegreso').value,
      personas:$('personas').value,
      tipoViaje:getChecked('tipoViaje')[0] || 'No especificado',
      servicios:getChecked('servicios'),
      presupuesto:$('presupuesto').value,
      comentarios:$('comentarios').value.trim(),
      source:'Landing Viajes Troncal',
      createdAt:new Date().toISOString()
    };
    status.className='form-status';
    status.textContent='Enviando tu solicitud...';
    try{
      await sendToMake(data);
      status.className='form-status success';
      status.textContent='✅ Solicitud enviada. Te contactaremos por WhatsApp con una cotización personalizada.';
      form.reset();
    }catch(err){
      console.error(err);
      status.className='form-status error';
      status.innerHTML='No se pudo enviar directo. <a href="'+SITE.integrations.jotformUrl+'" target="_blank" rel="noopener">Abre el formulario alterno aquí</a>.';
    }
  });
}

async function loadPromosIntoCards(){
  const grid=$('promosCards');
  if(!grid) return;
  try{
    const links = await loadJSON('assets/data/promos.json');
    grid.innerHTML='';
    if(!links.length){ grid.innerHTML='<p>No hay promociones cargadas todavía.</p>'; return; }
    for(const entry of links){
      const link = typeof entry === 'string' ? entry : entry.url;
      if(!link) continue;
      let meta={title:'Promoción especial',description:'Descubre esta promoción y cotiza por WhatsApp.',image:SITE.hero.image,url:link};
      try{
        const r=await fetch('/api/preview?url='+encodeURIComponent(link));
        if(r.ok) meta={...meta,...await r.json()};
      }catch(e){ console.warn(e); }
      const title = meta.title && meta.title !== 'PromoMaker' ? meta.title : 'Promoción especial';
      const desc = meta.description || 'Descubre esta promoción y cotiza por WhatsApp.';
      const image = meta.image || SITE.hero.image;
      grid.insertAdjacentHTML('beforeend', `
        <article class="card">
          <img src="${image}" alt="${title.replaceAll('"','&quot;')}">
          <div class="card-body">
            <h3>${title}</h3>
            <p>${desc}</p>
            <div class="actions">
              <a class="btn btn-outline" href="${link}" target="_blank" rel="noopener">Ver promoción</a>
              <a class="btn btn-primary" href="${waLink(`Hola, quiero información de esta promoción:\n${title}\n${link}`)}" target="_blank" rel="noopener">Cotizar por WhatsApp</a>
            </div>
          </div>
        </article>`);
    }
  }catch(e){ console.error(e); }
}

async function init(){
  SITE=await loadJSON('assets/data/site.json');
  applyConfig();
  setupForm();
  loadPromosIntoCards();
}
document.addEventListener('DOMContentLoaded', init);
