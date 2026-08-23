let SITE = null;
let DESTINATIONS = [];
let SOURCES = [];
let OFFERS = [];

async function loadJSON(path){
  const response = await fetch(path,{cache:'no-store'});
  if(!response.ok) throw new Error('No se pudo cargar '+path);
  return response.json();
}
function setText(id,text){const el=document.getElementById(id);if(el)el.textContent=text||''}
function setHref(id,href){const el=document.getElementById(id);if(el)el.href=href||'#'}
function setSrc(id,src,alt=''){const el=document.getElementById(id);if(el&&src){el.src=src;if(alt)el.alt=alt}}
function escapeHTML(value=''){return String(value).replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]))}

function whatsappLink(message='Hola, quiero cotizar un viaje con Trhoncal Travel.'){
  return `https://wa.me/${SITE.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}

function applyConfig(){
  if(SITE.theme){
    document.documentElement.style.setProperty('--primary',SITE.theme.primary||'#063f53');
    document.documentElement.style.setProperty('--primary-dark',SITE.theme.primaryDark||'#032e3e');
    document.documentElement.style.setProperty('--gold',SITE.theme.gold||'#d8af58');
    document.documentElement.style.setProperty('--navy',SITE.theme.navy||'#063f53');
    document.documentElement.style.setProperty('--soft',SITE.theme.soft||'#f7f4ed');
  }
  document.title=SITE.meta?.title||'Trhoncal Travel';
  const desc=document.querySelector('meta[name="description"]');
  if(desc&&SITE.meta?.description)desc.setAttribute('content',SITE.meta.description);
  setSrc('heroImage',SITE.hero?.image,SITE.hero?.title);
  setText('heroKicker',SITE.hero?.kicker);
  setText('heroTitle',SITE.hero?.title);
  setText('heroAccent',SITE.hero?.accent);
  setText('heroSubtitle',SITE.hero?.subtitle);

  const wa=whatsappLink('Hola, quiero cotizar un viaje con Trhoncal Travel.');
  setHref('headerWhatsapp',wa);setHref('footerWhatsapp',wa);setHref('whatsFloat',wa);
  setText('footerWhatsapp',SITE.contact.phoneDisplay||'WhatsApp');
  setHref('footerMail',`mailto:${SITE.contact.email}`);setText('footerMail',SITE.contact.email||'Correo');

  const frame=document.getElementById('jotform-frame');
  const jotformUrl=SITE.forms?.jotformUrl||'https://form.jotform.com/261127730314044';
  if(frame)frame.src=jotformUrl;setHref('jotformLink',jotformUrl);
}

async function loadPublicData(){
  const endpoint=(SITE.data?.masterEndpoint||'').trim();
  if(endpoint){
    try{
      const payload=await loadJSON(endpoint);
      return {
        destinations:Array.isArray(payload.destinations)?payload.destinations:[],
        sources:Array.isArray(payload.sources)?payload.sources:[],
        offers:Array.isArray(payload.offers)?payload.offers:[],
        source:'master'
      };
    }catch(error){
      console.warn('Master endpoint no disponible; usando fallback local.',error);
    }
  }

  const [destinations,sources,offers]=await Promise.all([
    loadJSON(SITE.data?.localDestinations||'assets/data/destinations.json'),
    loadJSON(SITE.data?.localSources||'assets/data/sources.json'),
    loadJSON(SITE.data?.localOffers||'assets/data/promos.json')
  ]);
  return {
    destinations:destinations.destinations||[],
    sources:sources.sources||[],
    offers:Array.isArray(offers)?offers:offers.offers||[],
    source:'local'
  };
}

function normalizedStatus(d){return ['verified','verified-initial','approved','published'].includes(d.status)}

function renderFilters(){
  const holder=document.getElementById('destinationFilters');
  if(!holder)return;
  const groups=['Todos','Playa','Cultura','Naturaleza','Pueblo Mágico'];
  holder.innerHTML=groups.map((g,i)=>`<button class="chip ${i===0?'active':''}" data-filter="${escapeHTML(g)}">${escapeHTML(g)}</button>`).join('');
  holder.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{
    holder.querySelectorAll('button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderDestinations(btn.dataset.filter);
  }));
}

function matchesFilter(d,filter){
  if(filter==='Todos')return true;
  if(filter==='Pueblo Mágico')return !!d.puebloMagico;
  const terms=(d.segments||[]).map(x=>String(x).toLowerCase());
  const f=filter.toLowerCase();
  if(f==='playa')return terms.some(x=>x.includes('playa')||x.includes('isla')||x.includes('mar')||x.includes('surf'));
  if(f==='cultura')return terms.some(x=>x.includes('cultura')||x.includes('historia')||x.includes('maya'))||!!d.puebloMagico;
  if(f==='naturaleza')return terms.some(x=>x.includes('naturaleza')||x.includes('cenote')||x.includes('buceo')||x.includes('laguna'));
  return true;
}

function renderDestinations(filter='Todos'){
  const grid=document.getElementById('destinationGrid');if(!grid)return;
  const rows=DESTINATIONS.filter(normalizedStatus).filter(d=>matchesFilter(d,filter));
  if(!rows.length){grid.innerHTML='<div class="empty-state">No hay destinos publicados para este filtro todavía.</div>';return}
  grid.innerHTML=rows.map(d=>{
    const rec=(d.recognitions||[]).slice(0,2).map(r=>`<span class="tag">${escapeHTML(r)}</span>`).join('');
    const magic=d.puebloMagico?'<span class="tag">Pueblo Mágico</span>':'';
    return `<article class="destination-card">
      <div class="topline"><span class="eyebrow">${escapeHTML(d.state)} · ${escapeHTML(d.country)}</span><span class="meta">Verificado ${escapeHTML(d.lastVerified||'')}</span></div>
      <h3>${escapeHTML(d.name)}</h3>
      <p>${escapeHTML(d.summary)}</p>
      <div class="recognitions">${magic}${rec}</div>
      <div class="card-foot"><span>${escapeHTML(d.recommendedStay||'Duración por definir')}</span><a href="#cotizar" data-destination="${escapeHTML(d.name)}">Quiero cotizar →</a></div>
    </article>`;
  }).join('');
  grid.querySelectorAll('[data-destination]').forEach(a=>a.addEventListener('click',()=>{
    const name=a.dataset.destination;
    setHref('headerWhatsapp',whatsappLink(`Hola, quiero cotizar un viaje a ${name} con Trhoncal Travel.`));
  }));
  setText('verifiedCount',`${rows.length} destinos`);
}

function renderSourceSummary(){
  const holder=document.getElementById('sourceSummary');if(!holder)return;
  const groups=[
    ['Turismo oficial','Secretarías estatales, FONATUR y organismos oficiales de promoción.'],
    ['Patrimonio','INAH y UNESCO para historia, arqueología y reconocimientos.'],
    ['Naturaleza','CONANP y autoridades de áreas naturales protegidas.'],
    ['Producto','PriceAgencies y otros proveedores solamente para precio, cupo y condiciones.']
  ];
  holder.innerHTML=groups.map(g=>`<div class="source-item"><b>${g[0]}</b><span>${g[1]}</span></div>`).join('');
}

function renderOffers(){
  const grid=document.getElementById('promosCards');if(!grid)return;
  const publishable=OFFERS.filter(x=>x&&x.publicable===true);
  grid.innerHTML='';
  if(!publishable.length){
    grid.innerHTML=`<article class="promo-card"><h3>Ofertas en validación</h3><p>Las promociones solo aparecen cuando están activadas desde el Archivo Maestro y tienen precio/vigencia reconfirmados.</p><span class="promo-warning">Control desde Archivo Maestro</span></article>`;
    return;
  }
  publishable.forEach(entry=>{
    const title=escapeHTML(entry.title||'Promoción especial');
    const desc=escapeHTML(entry.description||'Cotiza disponibilidad y condiciones vigentes.');
    const image=escapeHTML(entry.image||SITE.hero.image||'');
    const price=entry.price?`<div class="promo-price">${escapeHTML(entry.price)}</div>`:'';
    const wa=whatsappLink(`Hola, quiero información de la promoción: ${entry.title||'viaje'}.`);
    grid.insertAdjacentHTML('beforeend',`<article class="promo-card">${image?`<img src="${image}" alt="${title}">`:''}<h3>${title}</h3>${price}<p>${desc}</p><div class="promo-actions"><a class="btn btn-primary" href="${wa}" target="_blank" rel="noopener noreferrer">Cotizar con Trhoncal</a></div></article>`);
  });
}

async function init(){
  try{
    SITE=await loadJSON('assets/data/site.json');
    applyConfig();
    const publicData=await loadPublicData();
    DESTINATIONS=publicData.destinations;
    SOURCES=publicData.sources;
    OFFERS=publicData.offers;
    document.documentElement.dataset.dataSource=publicData.source;
    renderFilters();renderDestinations();renderSourceSummary();renderOffers();
  }catch(error){
    console.error(error);
    const grid=document.getElementById('destinationGrid');if(grid)grid.innerHTML='<div class="empty-state">No pudimos cargar la base de destinos. Intenta recargar la página.</div>';
  }
}

document.addEventListener('DOMContentLoaded',init);
