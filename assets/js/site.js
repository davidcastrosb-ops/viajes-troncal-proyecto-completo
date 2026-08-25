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
function destinationSlug(d={}){return String(d.slug||d.name||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')}

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
  const ogTitle=document.querySelector('meta[property="og:title"]');
  const ogDesc=document.querySelector('meta[property="og:description"]');
  if(ogTitle)ogTitle.setAttribute('content',SITE.meta?.title||'Trhoncal Travel');
  if(ogDesc&&SITE.meta?.description)ogDesc.setAttribute('content',SITE.meta.description);
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
        destinations:(Array.isArray(payload.destinations)?payload.destinations:[]).map(d=>({...d,_fromMaster:true})),
        sources:Array.isArray(payload.sources)?payload.sources:[],
        offers:(Array.isArray(payload.offers)?payload.offers:[]).map(o=>({...o,_fromMaster:true})),
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
    destinations:(destinations.destinations||[]).map(d=>({...d,_fromMaster:false})),
    sources:sources.sources||[],
    offers:(Array.isArray(offers)?offers:offers.offers||[]).map(o=>({...o,_fromMaster:false})),
    source:'local'
  };
}

function isDestinationVisible(d){
  const validStatus=['verified','verified-initial','approved','published'].includes(d.status);
  if(d._fromMaster===true) return validStatus;
  return validStatus && d.mostrarWeb===true;
}

function renderFilters(){
  const holder=document.getElementById('destinationFilters');
  if(!holder)return;
  const groups=['Todos','Playa','Cultura','Naturaleza','Pueblo Mágico'];
  holder.innerHTML=groups.map((g,i)=>`<button class="chip ${i===0?'active':''}" data-filter="${escapeHTML(g)}">${escapeHTML(g)}</button>`).join('');
  holder.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{
    holder.querySelectorAll('button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderDestinationSections(btn.dataset.filter);
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

function destinationImage(d,featured=false){
  if(!d.mainImage)return '';
  const credit=d.imageCredit?`<span class="destination-image-credit">${escapeHTML(d.imageCredit)}</span>`:'';
  const badge=featured?'<span class="featured-pill">Selección Trhoncal</span>':'';
  return `<div class="destination-image">${badge}<img src="${escapeHTML(d.mainImage)}" alt="${escapeHTML(d.imageAlt||d.name)}" loading="lazy">${credit}</div>`;
}

function destinationCard(d,{featured=false}={}){
  const recognitions=(d.recognitions||[]).filter(r=>!(d.puebloMagico&&String(r).trim().toLowerCase()==='pueblo mágico'));
  const rec=recognitions.slice(0,2).map(r=>`<span class="tag">${escapeHTML(r)}</span>`).join('');
  const magic=d.puebloMagico?'<span class="tag">Pueblo Mágico</span>':'';
  const slug=destinationSlug(d);
  const stay=d.recommendedStay||'Estancia según itinerario';
  return `<article class="destination-card ${d.mainImage?'has-image':''} ${featured?'is-featured':''}" data-destination-id="${escapeHTML(d.id||'')}">
    ${destinationImage(d,featured)}
    <div class="destination-card-content">
      <div class="topline"><span class="eyebrow">${escapeHTML(d.state)} · ${escapeHTML(d.country)}</span><span class="meta">Verificado ${escapeHTML(d.lastVerified||'')}</span></div>
      <h3>${escapeHTML(d.name)}</h3>
      <p>${escapeHTML(d.summary)}</p>
      <div class="recognitions">${magic}${rec}</div>
      <div class="card-foot">
        <span class="card-stay">${escapeHTML(stay)}</span>
        <div class="card-actions">
          <a class="detail-link" href="/mexico/${encodeURIComponent(slug)}" aria-label="Ver ficha completa de ${escapeHTML(d.name)}">Ver ficha completa →</a>
          <a class="quote-link" href="#cotizar" data-destination="${escapeHTML(d.name)}">Quiero cotizar →</a>
        </div>
      </div>
    </div>
  </article>`;
}

function bindDestinationInteractions(scope){
  if(!scope)return;
  scope.querySelectorAll('.destination-image img').forEach(img=>img.addEventListener('error',()=>{
    const card=img.closest('.destination-card');
    const holder=img.closest('.destination-image');
    if(card)card.classList.remove('has-image');
    if(holder)holder.remove();
  }));
  scope.querySelectorAll('[data-destination]').forEach(a=>a.addEventListener('click',()=>{
    const name=a.dataset.destination;
    setHref('headerWhatsapp',whatsappLink(`Hola, quiero cotizar un viaje a ${name} con Trhoncal Travel.`));
  }));
}

function renderDestinationSections(filter='Todos'){
  const featuredGrid=document.getElementById('destinationGrid');
  const moreGrid=document.getElementById('destinationMoreGrid');
  const moreSection=document.getElementById('destinationMoreSection');
  if(!featuredGrid)return;

  const allVisible=DESTINATIONS.filter(isDestinationVisible).sort((a,b)=>(a.ordenHome??9999)-(b.ordenHome??9999));
  const featuredLimit=Number(SITE.presentation?.featuredLimit||6);
  let featured=allVisible.filter(d=>d.featuredHome===true).slice(0,featuredLimit);
  if(!featured.length)featured=allVisible.slice(0,featuredLimit);
  const featuredIds=new Set(featured.map(d=>d.id||d.name));
  const library=allVisible.filter(d=>!featuredIds.has(d.id||d.name));

  const featuredFiltered=featured.filter(d=>matchesFilter(d,filter));
  const libraryFiltered=library.filter(d=>matchesFilter(d,filter));

  if(!allVisible.length){
    featuredGrid.innerHTML='<div class="empty-state">No encontramos destinos disponibles en este momento. Cuéntanos qué tipo de viaje buscas y te ayudamos a encontrar opciones.</div>';
    if(moreSection)moreSection.hidden=true;
    setText('verifiedCount','Explora ideas de viaje');
    return;
  }

  featuredGrid.innerHTML=featuredFiltered.length
    ? featuredFiltered.map(d=>destinationCard(d,{featured:true})).join('')
    : '<div class="empty-state">No hay destinos que coincidan con este filtro. Prueba otra categoría o cuéntanos qué viaje buscas.</div>';

  if(moreGrid&&moreSection){
    if(libraryFiltered.length){
      moreGrid.innerHTML=libraryFiltered.map(d=>destinationCard(d)).join('');
      moreSection.hidden=false;
      setText('moreDestinationsCount',`${libraryFiltered.length} ${libraryFiltered.length===1?'destino adicional':'destinos adicionales'}`);
    }else{
      moreGrid.innerHTML='';
      moreSection.hidden=true;
    }
  }

  bindDestinationInteractions(featuredGrid);
  bindDestinationInteractions(moreGrid);
  setText('verifiedCount',`${allVisible.length} ${allVisible.length===1?'destino para explorar':'destinos para explorar'}`);
}

function renderSourceSummary(){
  const holder=document.getElementById('sourceSummary');if(!holder)return;
  const groups=[
    ['Turismo oficial','Secretarías estatales, FONATUR y organismos oficiales de promoción.'],
    ['Patrimonio','INAH y UNESCO para historia, arqueología y reconocimientos.'],
    ['Naturaleza','CONANP y autoridades de áreas naturales protegidas.'],
    ['Producto','PriceAgencies y otros proveedores solamente para precio, cupo, condiciones y materiales de difusión.']
  ];
  holder.innerHTML=groups.map(g=>`<div class="source-item"><b>${g[0]}</b><span>${g[1]}</span></div>`).join('');
}

function toDate(value){
  if(!value)return null;
  const d=new Date(value+'T23:59:59');
  return Number.isNaN(d.getTime())?null:d;
}

function isOfferVisible(o){
  if(o && o._fromMaster===true) return true;
  if(!o || o.mostrarWeb!==true || o.publicable!==true)return false;
  if(!o.lastPriceConfirmation && !o.ultimaConfirmacionPrecio)return false;
  const status=String(o.status||'').toLowerCase();
  if(['expired','expirada','suspended','suspendida'].includes(status))return false;
  const expiry=toDate(o.expiresAt||o.fechaExpiracionWeb);
  if(expiry && expiry < new Date())return false;
  return true;
}

function renderOffers(){
  const grid=document.getElementById('promosCards');if(!grid)return;
  const section=document.getElementById('promociones');
  const navLink=document.querySelector('.nav a[href="#promociones"]');
  const footerLink=document.querySelector('.footer a[href="#promociones"]');
  const publishable=OFFERS.filter(isOfferVisible).sort((a,b)=>(a.ordenWeb??9999)-(b.ordenWeb??9999));
  grid.innerHTML='';
  if(!publishable.length){
    if(section)section.hidden=true;
    if(navLink)navLink.hidden=true;
    if(footerLink)footerLink.closest('p')?.setAttribute('hidden','');
    return;
  }
  if(section)section.hidden=false;
  if(navLink)navLink.hidden=false;
  if(footerLink)footerLink.closest('p')?.removeAttribute('hidden');
  publishable.forEach(entry=>{
    const title=escapeHTML(entry.title||'Promoción especial');
    const desc=escapeHTML(entry.description||'Cotiza disponibilidad y condiciones vigentes.');
    const image=escapeHTML(entry.image||'');
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
    renderFilters();renderDestinationSections();renderSourceSummary();renderOffers();
  }catch(error){
    console.error(error);
    const grid=document.getElementById('destinationGrid');if(grid)grid.innerHTML='<div class="empty-state">No pudimos cargar los destinos. Intenta recargar la página.</div>';
  }
}

document.addEventListener('DOMContentLoaded',init);