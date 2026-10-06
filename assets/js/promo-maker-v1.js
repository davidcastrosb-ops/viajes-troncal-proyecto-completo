(()=>{
  const { money, tripTotal, perPerson: commercialPerPerson, deposits } = TravelCommercial;
  const motionQuery=window.matchMedia('(prefers-reduced-motion: reduce)');

  function validHttp(value=''){
    try{const u=new URL(String(value));return /^https?:$/.test(u.protocol)?u.toString():'';}catch(_){return '';}
  }

  function pricePrefix(entry={}){return String(entry.commercialType||'').toUpperCase()==='CAMPANA_DESDE'?'Desde':'';}
  function destinationFor(entry){
    return (typeof DESTINATIONS!=='undefined'?DESTINATIONS:[]).find(d=>d.id===entry.destinationId)||null;
  }
  const LOCAL_OFFER_IMAGES={
    'OF-PA-PVR-REV26-001':'/assets/images/hoteles/friendly-fun-vallarta/01.jpg',
    'OF-PA-PVR-SEP26-002':'/assets/images/hoteles/barcelo-puerto-vallarta/01.jpg',
    'OF-PA-NAY-REV26-003':'/assets/images/hoteles/grand-decameron-bucerias/01.jpg'
  };
  function brandedOfferUrl(entry){
    return entry?.id?`/oferta/${encodeURIComponent(entry.id)}`:'';
  }
  function promoCard(entry){
    const destination=destinationFor(entry);
    const destinationName=destination?.name||entry.leadDestinationVerified||entry.destinationName||'Viaje seleccionado';
    // Para las ofertas piloto usamos primero el asset local estable; así una URL remota
    // válida pero inaccesible no deja la tarjeta sin imagen en producción.
    const image=LOCAL_OFFER_IMAGES[entry.id]||validHttp(entry.image||'')||(!entry.hotel?validHttp(destination?.mainImage||''):'');
    const brandedUrl=brandedOfferUrl(entry);
    const publicUrl=brandedUrl?new URL(brandedUrl,window.location.origin).toString():window.location.href;
    const wa=typeof whatsappLink==='function'?whatsappLink(`Hola, quiero información sobre esta promoción de Trhoncal Travel: ${entry.title||destinationName}. ${publicUrl}`):'#cotizar';

    const totalValue=tripTotal(entry),total=totalValue?money(totalValue):'';
    const personsCount=Number(entry.persons),perPersonValue=commercialPerPerson(entry),perPerson=perPersonValue?money(perPersonValue):'';
    const showTripTotal=!!total;
    const showPerPerson=!!perPerson&&personsCount>0;
    const duration=[entry.days?`${entry.days} días`:'',entry.nights?`${entry.nights} noches`:''].filter(Boolean).join(' · ');
    const expiry=entry.expiresAt||'';
    const verified=entry.lastPriceConfirmation||entry.ultimaConfirmacionPrecio||entry.verifiedAt||'';
    const title=entry.title||destinationName;
    const planAttr=entry.plan?` data-plan="${escapeHTML(entry.plan)}"`:'';
    return `<article class="promo-maker-card">
      ${image?`<div class="promo-maker-image"><img src="${escapeHTML(image)}" alt="${escapeHTML(entry.hotel?`${entry.hotel} en ${destinationName}`:title)}" loading="lazy"></div>`:`<div class="promo-maker-image promo-maker-image-missing"><span>TRHONCAL TRAVEL</span><strong>${escapeHTML(entry.hotel||destinationName)}</strong><small>Imagen de esta promoción pendiente</small></div>`}
      <div class="promo-maker-body">
        <span class="promo-maker-destination">${escapeHTML(destinationName)}</span>
        <h3${entry.hotel?' translate="no" class="notranslate"':''}>${escapeHTML(title)}</h3>
        ${entry.hotel?`<p class="promo-maker-hotel notranslate" translate="no">${escapeHTML(entry.hotel)}</p>`:''}
        ${showTripTotal?`<div class="promo-maker-total commercial-total"><span>${pricePrefix(entry)?'Desde · ':''}Total del viaje</span><strong>${escapeHTML(total)}</strong><small>MXN</small></div>`:'<div class="commercial-pending">Importe por confirmar</div>'}
        ${showPerPerson?`<div class="promo-maker-person commercial-person"><span>Por persona</span><strong>${escapeHTML(perPerson)}</strong><small>MXN</small></div>`:'<div class="commercial-pending">Importe por confirmar</div>'}
        <div class="promo-maker-payment commercial-payment"><span>Hasta 18 meses con tarjetas participantes</span>${deposits(entry.allowsDeposits)?`<span>${escapeHTML(entry.depositText||'Pregunta por opción de apartar y abonar')}</span>`:''}</div>
        <div class="promo-maker-meta">${duration?`<span>${escapeHTML(duration)}</span>`:''}${expiry?`<span>Vigente hasta ${escapeHTML(expiry)}</span>`:''}${verified?`<span>Precio confirmado ${escapeHTML(verified)}</span>`:''}</div>
        <p class="promo-maker-note">${escapeHTML(TravelCommercial.shortNote(entry,publicSafeText(entry.note||entry.description||'Precio, disponibilidad y condiciones sujetos a reconfirmación antes de reservar.')))}</p>
        <div class="promo-maker-actions">
          ${brandedUrl?`<a class="promo-maker-cta promo-maker-view" href="${escapeHTML(brandedUrl)}" data-offer="${escapeHTML(entry.id||'')}" data-occasion="${escapeHTML(entry.occasionId||'')}">Ver promoción</a>`:''}
          <a class="promo-maker-cta promo-maker-primary" href="#cotizar" data-quote-launch data-travel-quote data-destination="${escapeHTML(destinationName)}" data-offer="${escapeHTML(entry.id||'')}" data-occasion="${escapeHTML(entry.occasionId||'')}"${planAttr} data-start="${escapeHTML(entry.travelStart||'')}" data-end="${escapeHTML(entry.travelEnd||'')}" data-cta-origen="oferta_home">Quiero este viaje</a>
          ${brandedUrl?`<button class="promo-maker-cta promo-maker-share" type="button" data-offer-share="${escapeHTML(entry.id||'')}" data-share-title="${escapeHTML(title)}" data-share-url="${escapeHTML(publicUrl)}">Compartir promoción</button>`:''}
          <a class="promo-maker-cta promo-maker-whatsapp" href="${escapeHTML(wa)}" target="_blank" rel="noopener noreferrer">Prefiero WhatsApp</a>
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
      const fits=count<=visibleCount();
      toolbar.hidden=fits;
      if(status)status.textContent=fits||expanded?`${count} ofertas`:`${index+1}–${Math.min(index+visibleCount(),count)} de ${count}`;
      [prev,next,pause].forEach(control=>{if(control)control.hidden=expanded;});
      if(fits)stop();
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
      if(paused||expanded||count<=visibleCount()||motionQuery.matches||document.hidden)return;
      timer=setInterval(()=>go(index+1),6200);
    }
    prev?.addEventListener('click',()=>{go(index-1);start();});
    next?.addEventListener('click',()=>{go(index+1);start();});
    pause?.addEventListener('click',()=>{paused=!paused;pause.textContent=paused?'Reanudar movimiento':'Pausar movimiento';pause.setAttribute('aria-pressed',String(paused));start();});
    all?.addEventListener('click',()=>{expanded=!expanded;track.classList.toggle('is-expanded',expanded);all.textContent=expanded?'Ver carrusel':'Ver todas';all.setAttribute('aria-expanded',String(expanded));sync();if(expanded)stop();else start();});
    ['mouseenter','focusin','touchstart','pointerdown'].forEach(evt=>track.addEventListener(evt,stop,{passive:true}));
    ['mouseleave','focusout','touchend','pointerup'].forEach(evt=>track.addEventListener(evt,start,{passive:true}));
    track.addEventListener('scroll',()=>{if(expanded)return;const list=cards();if(!list.length)return;let closest=0,best=Infinity;list.forEach((card,i)=>{const delta=Math.abs((card.offsetLeft-track.offsetLeft)-track.scrollLeft);if(delta<best){best=delta;closest=i;}});index=closest;sync();},{passive:true});
    window.addEventListener('resize',()=>{sync();start();},{passive:true});
    document.addEventListener('visibilitychange',start);
    sync();start();
  }

  window.renderOffers=function(){
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
    grid.querySelectorAll('[data-offer-share]').forEach(btn=>btn.addEventListener('click',async()=>{
      const data={title:btn.dataset.shareTitle||'Trhoncal Travel',text:'Mira esta promoción de Trhoncal Travel.',url:btn.dataset.shareUrl||window.location.href};
      try{
        if(navigator.share) await navigator.share(data);
        else{
          await navigator.clipboard.writeText(data.url);
          const old=btn.textContent;
          btn.textContent='Enlace copiado';
          setTimeout(()=>{btn.textContent=old;},1400);
        }
      }catch(_){}
    }));
    let toolbar=section.querySelector('.promo-maker-toolbar');
    if(!toolbar){
      toolbar=document.createElement('div');
      toolbar.className='promo-maker-toolbar';
      toolbar.innerHTML='<button type="button" data-promo-prev>← Anterior</button><span data-promo-status aria-live="polite">1 de 1</span><button type="button" data-promo-next>Siguiente →</button><button type="button" data-promo-pause aria-pressed="false">Pausar movimiento</button><button type="button" data-promo-all aria-expanded="false">Ver todas</button>';
      grid.before(toolbar);
    }
    setupCarousel(grid,toolbar,publishable.length);
    if(window.IntersectionObserver && !section.dataset.floatGuard){
      section.dataset.floatGuard='true';
      new IntersectionObserver(([entry])=>{
        const floating=document.getElementById('whatsFloat');
        if(floating)floating.hidden=entry.isIntersecting;
      }).observe(section);
    }
  };
})();
