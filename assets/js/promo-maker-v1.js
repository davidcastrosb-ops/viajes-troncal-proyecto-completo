(()=>{
  const motionQuery=window.matchMedia('(prefers-reduced-motion: reduce)');

  function validHttp(value=''){
    try{const u=new URL(String(value));return /^https?:$/.test(u.protocol)?u.toString():'';}catch(_){return '';}
  }
  function money(value){
    if(value===null||value===undefined||value==='')return '';
    const numeric=Number(String(value).replace(/[^0-9.-]/g,''));
    if(Number.isFinite(numeric))return new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(numeric);
    return String(value);
  }
  function destinationFor(entry){
    return (typeof DESTINATIONS!=='undefined'?DESTINATIONS:[]).find(d=>d.id===entry.destinationId)||null;
  }
  function promoCard(entry){
    const destination=destinationFor(entry);
    const destinationName=destination?.name||entry.leadDestinationVerified||entry.destinationName||'Viaje seleccionado';
    const image=validHttp(entry.image||destination?.mainImage||'');
    const promoDetailUrl=entry.directLinkAuthorized===true?validHttp(entry.publicPromoUrl||''):'';
    const contactUrl=entry.directLinkAuthorized===true?validHttp(entry.leadFormUrl||entry.sharePromoUrl||''):'';
    const publicUrl=contactUrl||promoDetailUrl;
    const trackingPromoUrl=promoDetailUrl||publicUrl;
    const wa=typeof whatsappLink==='function'?whatsappLink(`Hola, quiero asesoría sobre la promoción ${entry.title||destinationName} con Trhoncal Travel.`):'#cotizar';
    const price=money(entry.price);
    const duration=[entry.days?`${entry.days} días`:'',entry.nights?`${entry.nights} noches`:''].filter(Boolean).join(' · ');
    const expiry=entry.expiresAt||'';
    const verified=entry.verifiedAt||'';
    const title=entry.title||destinationName;
    const promoAttr=trackingPromoUrl?` data-promo-url="${escapeHTML(trackingPromoUrl)}"`:'';
    return `<article class="promo-maker-card">
      ${image?`<div class="promo-maker-image"><img src="${escapeHTML(image)}" alt="${escapeHTML(title)}" loading="lazy"></div>`:''}
      <div class="promo-maker-body">
        <span class="promo-maker-destination">${escapeHTML(destinationName)}</span>
        <h3>${escapeHTML(title)}</h3>
        ${entry.hotel?`<p class="promo-maker-hotel">${escapeHTML(entry.hotel)}</p>`:''}
        ${price?`<div class="promo-maker-price"><small>Desde</small><strong>${escapeHTML(price)}</strong>${entry.priceUnit?`<span>${escapeHTML(entry.priceUnit)}</span>`:''}</div>`:''}
        <div class="promo-maker-meta">${duration?`<span>${escapeHTML(duration)}</span>`:''}${expiry?`<span>Vigente hasta ${escapeHTML(expiry)}</span>`:''}${verified?`<span>Precio confirmado ${escapeHTML(verified)}</span>`:''}</div>
        ${entry.note?`<p class="promo-maker-note">${escapeHTML(entry.note)}</p>`:''}
        <div class="promo-maker-actions">
          ${publicUrl?`<a class="promo-maker-secondary" href="${escapeHTML(publicUrl)}" target="_blank" rel="noopener noreferrer nofollow sponsored" data-offer="${escapeHTML(entry.id||'')}" data-occasion="${escapeHTML(entry.occasionId||'')}">Ver promoción ↗</a>`:''}
          <a class="btn btn-primary" href="#cotizar" data-quote-launch data-travel-quote data-destination="${escapeHTML(destinationName)}" data-offer="${escapeHTML(entry.id||'')}" data-occasion="${escapeHTML(entry.occasionId||'')}"${promoAttr} data-start="${escapeHTML(entry.travelStart||'')}" data-end="${escapeHTML(entry.travelEnd||'')}" data-cta-origen="oferta_home">Quiero este viaje →</a>
          <a class="promo-maker-secondary" href="${escapeHTML(wa)}" target="_blank" rel="noopener noreferrer">Prefiero WhatsApp</a>
        </div>
        <p class="promo-maker-disclaimer">Precio, disponibilidad y condiciones se reconfirman antes de reservar.</p>
      </div>
    </article>`;
  }

  function setupCarousel(track,toolbar,count){
    if(!track||!toolbar||count<2){if(toolbar)toolbar.hidden=true;return;}
    toolbar.hidden=false;
    const prev=toolbar.querySelector('[data-promo-prev]');
    const next=toolbar.querySelector('[data-promo-next]');
    const pause=toolbar.querySelector('[data-promo-pause]');
    const all=toolbar.querySelector('[data-promo-all]');
    const status=toolbar.querySelector('[data-promo-status]');
    let index=0,paused=false,expanded=false,timer=null;
    const cards=()=>Array.from(track.querySelectorAll('.promo-maker-card'));
    const visibleCount=()=>window.innerWidth<760?1:(window.innerWidth<1050?2:3);
    const maxIndex=()=>Math.max(0,cards().length-visibleCount());
    function sync(){
      index=Math.min(index,maxIndex());
      if(status)status.textContent=`${Math.min(index+1,count)} de ${count}`;
    }
    function go(nextIndex){
      if(expanded)return;
      const max=maxIndex();
      index=nextIndex<0?max:(nextIndex>max?0:nextIndex);
      const card=cards()[index];
      if(card)track.scrollTo({left:card.offsetLeft-track.offsetLeft,behavior:motionQuery.matches?'auto':'smooth'});
      sync();
    }
    function stop(){if(timer){clearInterval(timer);timer=null;}}
    function start(){
      stop();
      if(paused||expanded||motionQuery.matches||document.hidden)return;
      timer=setInterval(()=>go(index+1),6200);
    }
    prev?.addEventListener('click',()=>{go(index-1);start();});
    next?.addEventListener('click',()=>{go(index+1);start();});
    pause?.addEventListener('click',()=>{paused=!paused;pause.textContent=paused?'Reanudar movimiento':'Pausar movimiento';pause.setAttribute('aria-pressed',String(paused));start();});
    all?.addEventListener('click',()=>{expanded=!expanded;track.classList.toggle('is-expanded',expanded);all.textContent=expanded?'Ver carrusel':'Ver todas';all.setAttribute('aria-expanded',String(expanded));if(expanded)stop();else start();});
    ['mouseenter','focusin','touchstart','pointerdown'].forEach(evt=>track.addEventListener(evt,stop,{passive:true}));
    ['mouseleave','focusout','touchend','pointerup'].forEach(evt=>track.addEventListener(evt,start,{passive:true}));
    track.addEventListener('scroll',()=>{if(expanded)return;const list=cards();if(!list.length)return;let closest=0,best=Infinity;list.forEach((card,i)=>{const delta=Math.abs((card.offsetLeft-track.offsetLeft)-track.scrollLeft);if(delta<best){best=delta;closest=i;}});index=closest;sync();},{passive:true});
    window.addEventListener('resize',sync,{passive:true});
    document.addEventListener('visibilitychange',start);
    sync();start();
  }

  renderOffers=function(){
    const grid=document.getElementById('promosCards');if(!grid)return;
    const section=document.getElementById('promociones');
    const navLink=document.querySelector('.nav a[href="#promociones"]');
    const footerLink=document.querySelector('.footer a[href="#promociones"]');
    const publishable=(typeof OFFERS!=='undefined'?OFFERS:[]).filter(isOfferVisible).sort((a,b)=>(a.ordenWeb??9999)-(b.ordenWeb??9999));
    if(!publishable.length){
      grid.innerHTML='';
      if(section)section.hidden=true;
      if(navLink)navLink.hidden=true;
      if(footerLink)footerLink.closest('p')?.setAttribute('hidden','');
      return;
    }
    if(section)section.hidden=false;
    if(navLink)navLink.hidden=false;
    if(footerLink)footerLink.closest('p')?.removeAttribute('hidden');
    grid.classList.add('promo-maker-track');
    grid.innerHTML=publishable.map(promoCard).join('');
    let toolbar=section.querySelector('.promo-maker-toolbar');
    if(!toolbar){
      toolbar=document.createElement('div');
      toolbar.className='promo-maker-toolbar';
      toolbar.innerHTML='<button type="button" data-promo-prev>← Anterior</button><span data-promo-status aria-live="polite">1 de 1</span><button type="button" data-promo-next>Siguiente →</button><button type="button" data-promo-pause aria-pressed="false">Pausar movimiento</button><button type="button" data-promo-all aria-expanded="false">Ver todas</button>';
      grid.before(toolbar);
    }
    setupCarousel(grid,toolbar,publishable.length);
  };
})();
