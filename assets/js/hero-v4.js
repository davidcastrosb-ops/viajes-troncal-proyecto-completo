(()=>{
  function esc(value=''){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function validHttp(value=''){
    try{const u=new URL(String(value));return /^https?:$/.test(u.protocol)?u.toString():'';}catch(_){return '';}
  }
  function loadPromoMakerAssets(){
    if(!document.querySelector('link[data-promo-maker-v1]')){
      const link=document.createElement('link');link.rel='stylesheet';link.href='/assets/css/promo-maker-v1.css';link.dataset.promoMakerV1='';document.head.appendChild(link);
    }
    if(document.querySelector('script[data-promo-maker-v1]'))return;
    const script=document.createElement('script');
    script.src='/assets/js/promo-maker-v1.js';script.dataset.promoMakerV1='';
    script.onload=()=>{try{if(typeof renderOffers==='function')renderOffers();}catch(_){/* datos aún cargando */}};
    document.head.appendChild(script);
  }
  function destinationText(d){
    return [
      ...(Array.isArray(d.segments)?d.segments:[]),d.travelerProfile||'',d.type||'',d.summary||'',d.whyGo||'',d.gastronomy||'',
      ...(Array.isArray(d.recognitions)?d.recognitions:[])
    ].join(' ').toLowerCase();
  }
  function intentFilter(d,filter){
    if(filter==='Todos')return true;
    if(filter==='Pueblo Mágico')return !!d.puebloMagico;
    const all=destinationText(d);
    const f=String(filter||'').toLowerCase();
    if(f==='familia')return /famil|niñ|grupo|multigener/.test(all);
    if(f==='pareja')return /parej|rom[aá]nt|luna de miel|adultos/.test(all);
    if(f==='playa')return /playa|mar|isla|caribe|pac[ií]fico|surf|buceo|snorkel/.test(all);
    if(f==='cultura')return /cultura|historia|maya|arqueolog|patrimonio|pueblo m[aá]gico|tradici/.test(all)||!!d.puebloMagico;
    if(f==='naturaleza')return /naturaleza|cenote|laguna|reserva|parque|sender|aventura|manglar|fauna|ecotur/.test(all);
    if(f==='gastronomía'||f==='gastronomia')return /gastronom|comida|cocina|mercado|vino|tequila|restaurante/.test(all);
    return true;
  }
  try{matchesFilter=intentFilter;}catch(_){/* site.js aún no disponible */}

  function setPhoto(id,d){
    const img=document.getElementById(id);if(!img||!d?.mainImage)return;
    img.src=d.mainImage;img.alt=d.imageAlt||`Viaja a ${d.name}`;
    const holder=img.closest('.hero-photo');
    if(holder&&d.imageCredit){
      const credit=document.createElement('span');credit.className='hero-image-credit';credit.textContent=d.imageCredit;holder.appendChild(credit);
    }
    img.addEventListener('error',()=>{if(holder)holder.style.background='linear-gradient(145deg,#063f53,#0a6171)';img.remove();},{once:true});
  }

  function renderHero(){
    if(typeof DESTINATIONS==='undefined'||typeof isDestinationVisible!=='function')return;
    const visible=DESTINATIONS.filter(isDestinationVisible);
    const featured=visible.filter(d=>d.featuredHome===true&&d.mainImage);
    const rest=visible.filter(d=>d.mainImage&&!featured.includes(d));
    const picks=[...featured,...rest].slice(0,3);
    if(picks[0])setPhoto('heroPhotoMain',picks[0]);
    if(picks[1])setPhoto('heroPhotoTop',picks[1]);
    if(picks[2])setPhoto('heroPhotoBottom',picks[2]);
  }

  function formatPrice(value){
    if(value===null||value===undefined||value==='')return '';
    const numeric=Number(String(value).replace(/[^0-9.-]/g,''));
    if(Number.isFinite(numeric))return new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(numeric);
    return String(value);
  }

  function renderHeroPromos(){
    const strip=document.getElementById('heroPromoStrip');
    const holder=document.getElementById('heroPromoItems');
    if(!strip||!holder||typeof OFFERS==='undefined'||typeof isOfferVisible!=='function')return;
    const publishable=OFFERS.filter(isOfferVisible).sort((a,b)=>(a.ordenWeb??9999)-(b.ordenWeb??9999)).slice(0,3);
    if(!publishable.length){strip.hidden=true;holder.innerHTML='';return;}
    holder.innerHTML=publishable.map(entry=>{
      const destination=(typeof DESTINATIONS!=='undefined'?DESTINATIONS:[]).find(d=>d.id===entry.destinationId);
      const destinationName=destination?.name||entry.destinationName||'Viaje seleccionado';
      const price=formatPrice(entry.price);
      const expiry=entry.expiresAt||entry.fechaExpiracionWeb||'';
      const external=validHttp(entry.publicPromoUrl||entry.sharePromoUrl||entry.publicUrl||entry.urlPublicaCliente||'');
      const lead=validHttp(entry.leadFormUrl||'');
      const fallback=typeof whatsappLink==='function'?whatsappLink(`Hola, quiero información de la promoción ${entry.title||destinationName} con Trhoncal Travel.`):'#cotizar';
      const href=external||fallback;
      const label=external?'Ver promoción →':'Cotizar esta promoción →';
      const rel=external?'noopener noreferrer nofollow sponsored':'noopener noreferrer';
      return `<article class="hero-promo-card"><span class="promo-destination">${esc(destinationName)}</span><strong>${esc(entry.title||'Promoción verificada')}</strong>${price?`<div class="promo-price">Desde ${esc(price)}</div>`:''}<div class="promo-meta">${entry.nights?`<span>${esc(entry.nights)} noches</span>`:''}${expiry?`<span>Vigente hasta ${esc(expiry)}</span>`:''}</div><a href="${esc(href)}" target="_blank" rel="${rel}">${label}</a>${lead?`<a class="promo-lead-link" href="${esc(lead)}" target="_blank" rel="noopener noreferrer nofollow sponsored">Dejar mis datos →</a>`:''}</article>`;
    }).join('');
    strip.hidden=false;
    let note=strip.querySelector('.hero-promo-note');
    if(!note){note=document.createElement('p');note.className='hero-promo-note';strip.appendChild(note);}
    note.textContent='Precio, disponibilidad y condiciones se reconfirman antes de reservar. Los enlaces de Promo Maker sólo aparecen cuando fueron generados y autorizados para cliente.';
  }

  function boot(){
    loadPromoMakerAssets();
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      if(typeof DESTINATIONS!=='undefined'&&DESTINATIONS.length){
        clearInterval(timer);renderHero();renderHeroPromos();
      }else if(tries>60){clearInterval(timer);}
    },120);
  }
  document.addEventListener('DOMContentLoaded',boot);
})();
