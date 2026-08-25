(()=>{
  const esc=(v='')=>String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const list=(items=[])=>items&&items.length?`<ul class="detail-list">${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p>Consulta con nosotros las opciones que mejor se adapten a tu viaje.</p>';
  const slugify=(v='')=>String(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  const routeSlug=d=>d.slug||slugify(d.name);
  const pathRoute=()=>{const m=location.pathname.match(/^\/mexico\/([^/?#]+)\/?$/i);return m?decodeURIComponent(m[1]):'';};
  const queryRoute=()=>new URLSearchParams(location.search).get('destino')||'';
  const currentRoute=()=>pathRoute()||queryRoute();
  const isCleanRoute=()=>!!pathRoute();

  function sourceRows(d){
    const ids=new Set(d.sourceIds||[]);
    return (typeof SOURCES!=='undefined'?SOURCES:[]).filter(s=>ids.has(s.id));
  }

  function ensureModal(){
    let overlay=document.getElementById('destinationDetailOverlay');
    if(overlay)return overlay;
    overlay=document.createElement('div');
    overlay.id='destinationDetailOverlay';overlay.className='destination-detail-overlay';overlay.setAttribute('aria-hidden','true');
    overlay.innerHTML='<article class="destination-detail" role="dialog" aria-modal="true" aria-labelledby="detailTitle"><div id="destinationDetailContent"></div></article>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click',e=>{if(e.target===overlay&&!overlay.classList.contains('route-page'))closeModal();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!isCleanRoute())closeModal();});
    return overlay;
  }

  function applyMeta(d){
    document.title=`${d.name}${d.state?`, ${d.state}`:''} | Trhoncal Travel`;
    const desc=document.querySelector('meta[name="description"]');
    if(desc&&d.summary)desc.setAttribute('content',d.summary);
  }

  function resetMeta(){
    if(typeof SITE!=='undefined'&&SITE){
      document.title=SITE.meta?.title||'Trhoncal Travel';
      const desc=document.querySelector('meta[name="description"]');
      if(desc&&SITE.meta?.description)desc.setAttribute('content',SITE.meta.description);
    }
  }

  function setRoute(d){history.pushState({destination:routeSlug(d)},'',`/mexico/${encodeURIComponent(routeSlug(d))}`);}
  function clearRoute(){history.pushState({},'','/#destinos');}

  function closeModal({syncRoute=true}={}){
    const o=document.getElementById('destinationDetailOverlay');
    if(o){o.classList.remove('open','route-page');o.setAttribute('aria-hidden','true');}
    document.body.classList.remove('destination-route');
    document.body.style.overflow='';
    resetMeta();
    if(syncRoute&&currentRoute())clearRoute();
  }

  function relatedDestinations(d){
    if(typeof DESTINATIONS==='undefined')return [];
    return DESTINATIONS
      .filter(x=>x!==d && (typeof isDestinationVisible!=='function'||isDestinationVisible(x)))
      .sort((a,b)=>(a.ordenHome??9999)-(b.ordenHome??9999))
      .slice(0,2);
  }

  function openModal(d,{syncRoute=true}={}){
    if(syncRoute)setRoute(d);
    const clean=isCleanRoute();
    const overlay=ensureModal();const holder=document.getElementById('destinationDetailContent');
    const sources=sourceRows(d);
    const sourceHtml=sources.length?sources.map(s=>`<div class="detail-source"><div><b>${esc(s.organization)} — ${esc(s.title)}</b><span>Verificada ${esc(s.verifiedAt||'')}${s.note?` · ${esc(s.note)}`:''}</span></div><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Fuente oficial ↗</a></div>`).join(''):'<p>Consulta con nosotros las fuentes utilizadas para esta ficha.</p>';
    const wa=typeof whatsappLink==='function'?whatsappLink(`Hola, quiero cotizar un viaje a ${d.name} con Trhoncal Travel.`):'/#cotizar';
    const photo=d.mainImage?`<div class="detail-photo"><img src="${esc(d.mainImage)}" alt="${esc(d.imageAlt||d.name)}"><div class="detail-photo-caption">${d.imageCredit?`<span>${esc(d.imageCredit)}</span>`:''}${d.imageLicense?`<small>${esc(d.imageLicense)}</small>`:''}</div></div>`:'';
    const routeBar=clean?`<div class="detail-route-bar"><a class="detail-route-brand" href="/#destinos" aria-label="Volver a Trhoncal Travel"><img src="/assets/images/trhoncal-travel-logo.svg" alt="Trhoncal Travel"></a><div class="detail-route-context"><span>México · ${esc(d.state||'')}</span><a class="detail-route-back" href="/#destinos">← Volver a destinos</a></div></div>`:'';
    const closeControl=clean?'':`<button class="detail-close" type="button" aria-label="Cerrar">×</button>`;
    const related=clean?relatedDestinations(d):[];
    const relatedHtml=related.length?`<section class="detail-related"><div class="detail-related-head"><span class="eyebrow">Sigue explorando</span><h3>También puedes explorar</h3></div><div class="detail-related-grid">${related.map(x=>`<a class="detail-related-card" href="/mexico/${encodeURIComponent(routeSlug(x))}"><span>${esc(x.state)} · México</span><b>${esc(x.name)}</b><small>${esc(x.recommendedStay||'Estancia según itinerario')}</small></a>`).join('')}</div></section>`:'';
    const routeConversion=clean?`<section class="detail-conversion"><div><span class="eyebrow">Asesoría Trhoncal Travel</span><h3>¿Quieres convertir ${esc(d.name)} en un viaje real?</h3><p>Cuéntanos fechas, viajeros y estilo de viaje. Revisamos producto disponible y te cotizamos opciones reales antes de que pagues.</p></div><div class="detail-conversion-actions"><a class="btn btn-primary" href="${wa}" target="_blank" rel="noopener noreferrer">Cotizar por WhatsApp</a><a class="btn btn-soft" href="/#cotizar">Solicitar cotización</a></div></section>`:'';

    holder.innerHTML=`
      ${routeBar}
      <header class="detail-header ${d.mainImage?'with-photo':''}">${closeControl}${photo}<div class="detail-header-copy"><span class="eyebrow">${esc(d.state)} · ${esc(d.country)}${d.puebloMagico?' · Pueblo Mágico':''}</span><h2 id="detailTitle">${esc(d.name)}</h2><p>${esc(d.summary||'')}</p></div></header>
      <div class="detail-body">
        <div class="detail-summary-grid"><div class="detail-stat"><small>Estancia sugerida</small><b>${esc(d.recommendedStay||'Estancia según itinerario')}</b></div><div class="detail-stat"><small>Tipo de viaje</small><b>${esc((d.segments||[]).slice(0,4).join(' · ')||d.type||'Viaje personalizado')}</b></div><div class="detail-stat"><small>Última verificación</small><b>${esc(d.lastVerified||'Información revisada')}</b></div></div>
        <div class="detail-columns">
          <div><section class="detail-block"><h3>Por qué ir</h3><p>${esc(d.whyGo||'')}</p></section><section class="detail-block"><h3>Historia y contexto</h3><p>${esc(d.history||'')}</p></section><section class="detail-block"><h3>Atractivos clave</h3>${list(d.attractions)}</section><section class="detail-block"><h3>Experiencias</h3>${list(d.experiences)}</section></div>
          <div><section class="detail-block"><h3>¿Para quién funciona?</h3><p>${esc(d.travelerProfile||'')}</p></section><section class="detail-block"><h3>Clima y temporadas</h3><p>${esc(d.climateSeasons||'')}</p></section><section class="detail-block"><h3>Cómo llegar y moverse</h3><p>${esc(d.connectivity||'')}</p></section><section class="detail-block"><h3>Qué combinar</h3>${list(d.combinations)}</section></div>
        </div>
        <section class="detail-block"><h3>Gastronomía</h3><p>${esc(d.gastronomy||'')}</p></section>
        <section class="detail-block"><h3>Patrimonio y reconocimientos</h3>${list(d.recognitions)}<p style="margin-top:12px">${esc(d.sustainabilityHeritage||'')}</p></section>
        <section class="detail-sources"><h3>Fuentes que respaldan esta ficha</h3>${sourceHtml}</section>
        ${clean?'':`<div class="detail-actions"><a class="btn btn-primary" href="${wa}" target="_blank" rel="noopener noreferrer">Cotizar ${esc(d.name)}</a><a class="btn btn-soft" href="/#cotizar">Solicitar viaje</a></div>`}
        ${routeConversion}
        ${relatedHtml}
      </div>`;

    const closeButton=holder.querySelector('.detail-close');if(closeButton)closeButton.addEventListener('click',()=>closeModal());
    if(clean){overlay.classList.add('route-page');document.body.classList.add('destination-route');document.body.style.overflow='';}
    else{overlay.classList.remove('route-page');document.body.classList.remove('destination-route');document.body.style.overflow='hidden';}
    overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');applyMeta(d);
  }

  function openFromRoute(){
    const slug=currentRoute();if(!slug||typeof DESTINATIONS==='undefined')return;
    const d=DESTINATIONS.find(x=>routeSlug(x)===slug&&(!window.isDestinationVisible||isDestinationVisible(x)));
    if(d)openModal(d,{syncRoute:false});
  }

  function decorate(){
    const grids=document.querySelectorAll('[data-destination-grid]');
    if(!grids.length||typeof DESTINATIONS==='undefined')return;
    grids.forEach(grid=>{
      grid.querySelectorAll('.destination-card').forEach(card=>{
        if(card.dataset.detailReady==='1')return;
        const foot=card.querySelector('.card-foot');
        if(!foot)return;
        if(foot.querySelector('.detail-link')){card.dataset.detailReady='1';return;}
        const id=card.dataset.destinationId;
        const name=card.querySelector('h3')?.textContent?.trim();
        const d=DESTINATIONS.find(x=>(id&&x.id===id)||x.name===name);if(!d)return;
        const actions=foot.querySelector('.card-actions')||foot;
        const link=document.createElement('a');
        link.className='detail-link';
        link.textContent='Ver ficha completa →';
        link.href=`/mexico/${encodeURIComponent(routeSlug(d))}`;
        link.setAttribute('aria-label',`Ver ficha completa de ${d.name}`);
        actions.insertBefore(link,actions.firstChild);
        card.dataset.detailReady='1';
      });
    });
    openFromRoute();
  }

  window.addEventListener('popstate',()=>{
    const slug=currentRoute();
    if(!slug){closeModal({syncRoute:false});return;}
    const d=(typeof DESTINATIONS!=='undefined'?DESTINATIONS:[]).find(x=>routeSlug(x)===slug);
    if(d)openModal(d,{syncRoute:false});
  });

  document.addEventListener('DOMContentLoaded',()=>{
    const grids=document.querySelectorAll('[data-destination-grid]');if(!grids.length)return;
    const observer=new MutationObserver(decorate);
    grids.forEach(grid=>observer.observe(grid,{childList:true,subtree:true}));
    setTimeout(decorate,350);setTimeout(openFromRoute,900);
  });
})();