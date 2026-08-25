(()=>{
  const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const INTENTS=[
    {key:'Familia',title:'Viajes que se disfrutan juntos',kicker:'Momentos para compartir',description:'Playas, actividades y escapadas que funcionan para niños, adultos y varias generaciones.',preferred:['Riviera Maya / Playa del Carmen','Cancún','Puerto Vallarta','Bahías de Huatulco']},
    {key:'Pareja',title:'Escapadas para dos',kicker:'Tiempo que sí se recuerda',description:'Atardeceres, buena mesa, descanso y lugares para celebrar o simplemente volver a conectar.',preferred:['Puerto Vallarta','Los Cabos / Cabo San Lucas','Tulum','Sayulita']},
    {key:'Playa',title:'El mar también es destino',kicker:'Sol, agua y libertad',description:'Caribe, Pacífico e islas para bajar el ritmo, entrar al agua y volver con la cabeza en otro lugar.',preferred:['Cancún','Riviera Maya / Playa del Carmen','Bahías de Huatulco','Los Cabos / Cabo San Lucas']},
    {key:'Cultura',title:'Historias que se viven',kicker:'Conocer cambia el viaje',description:'Ciudades, patrimonio, arqueología y tradiciones que convierten una visita en algo que sí deja huella.',preferred:['Tulum','Puerto Vallarta','Cozumel','Loreto']},
    {key:'Naturaleza',title:'Sal de la rutina',kicker:'Respira, muévete, descubre',description:'Cenotes, lagunas, áreas protegidas, senderos y paisajes para volver a sentir que estás de viaje.',preferred:['Bacalar','La Paz','Bahías de Huatulco','Isla Mujeres']},
    {key:'Gastronomía',title:'Sabores que valen el viaje',kicker:'Comer también es viajar',description:'Mercados, cocina local, restaurantes y sabores que se vuelven parte del recuerdo del destino.',preferred:['Puerto Vallarta','Mazatlán','Riviera Maya / Playa del Carmen','Sayulita']}
  ];

  let timer=null;
  let userPaused=false;
  let hoverPaused=false;
  let focusPaused=false;
  let interactionUntil=0;

  const qs=id=>document.getElementById(id);
  const track=()=>qs('intentTrack');
  const cards=()=>Array.from(track()?.querySelectorAll('.intent-card')||[]);
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function visibleDestinations(){
    if(typeof DESTINATIONS==='undefined')return [];
    return DESTINATIONS.filter(d=>typeof isDestinationVisible==='function'?isDestinationVisible(d):true);
  }

  function normalizedText(d){
    return [
      ...(d.segments||[]),d.travelerProfile||'',d.type||'',d.summary||'',d.whyGo||'',d.gastronomy||'',...(d.recognitions||[])
    ].join(' ').toLowerCase();
  }

  function matchesIntent(d,key){
    const all=normalizedText(d);
    const k=key.toLowerCase();
    if(k==='familia')return /famil|niñ|grupo|multigener/.test(all);
    if(k==='pareja')return /parej|rom[aá]nt|luna de miel|adultos/.test(all);
    if(k==='playa')return /playa|mar|isla|caribe|pac[ií]fico|surf|buceo|snorkel/.test(all);
    if(k==='cultura')return /cultura|historia|maya|arqueolog|patrimonio|pueblo m[aá]gico|tradici/.test(all)||!!d.puebloMagico;
    if(k==='naturaleza')return /naturaleza|cenote|laguna|reserva|parque|sender|aventura|manglar|fauna|ecotur/.test(all);
    if(k==='gastronomía')return /gastronom|comida|cocina|mercado|vino|tequila|restaurante/.test(all);
    return false;
  }

  const originalMatchesFilter=typeof window.matchesFilter==='function'?window.matchesFilter:null;
  window.matchesFilter=function(d,filter){
    if(['Familia','Pareja','Gastronomía'].includes(filter))return matchesIntent(d,filter);
    return originalMatchesFilter?originalMatchesFilter(d,filter):matchesIntent(d,filter);
  };

  function ensureIntentFilters(){
    const holder=qs('destinationFilters');if(!holder)return;
    ['Familia','Pareja','Gastronomía'].forEach(label=>{
      if(holder.querySelector(`[data-filter="${label}"]`))return;
      const btn=document.createElement('button');
      btn.className='chip';btn.type='button';btn.dataset.filter=label;btn.textContent=label;
      btn.addEventListener('click',()=>{
        holder.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        if(typeof renderDestinationSections==='function')renderDestinationSections(label);
      });
      holder.appendChild(btn);
    });
  }

  function imageFor(matches,intent){
    const usable=matches.filter(d=>d&&d.mainImage);
    for(const name of intent.preferred||[]){
      const found=usable.find(d=>d.name===name);
      if(found)return found;
    }
    return usable[0]||null;
  }

  function chipNames(matches){
    return matches.slice(0,3).map(d=>`<span class="intent-destination-chip">${esc(d.name)}</span>`).join('');
  }

  function render(){
    const t=track();if(!t)return;
    const destinations=visibleDestinations();
    t.innerHTML=INTENTS.map(intent=>{
      const matches=destinations.filter(d=>matchesIntent(d,intent.key));
      const count=matches.length;
      const visual=imageFor(matches,intent);
      const image=visual?.mainImage?esc(visual.mainImage):'';
      const alt=visual?esc(visual.imageAlt||`Viaje de ${intent.title}`):'';
      const credit=visual?.imageCredit?esc(visual.imageCredit):'';
      const visualHtml=image?`<div class="intent-card-visual"><img src="${image}" alt="${alt}" loading="lazy"><span class="intent-card-shade"></span><span class="intent-card-visual-label">${esc(intent.kicker)}</span>${credit?`<small class="intent-card-credit">${credit}</small>`:''}</div>`:`<div class="intent-card-visual intent-card-visual-fallback"><span class="intent-card-visual-label">${esc(intent.kicker)}</span></div>`;
      return `<article class="intent-card" data-intent="${esc(intent.key)}">
        ${visualHtml}
        <div class="intent-card-body">
          <div class="intent-card-heading"><span class="intent-card-count">${count} ${count===1?'destino':'destinos'}</span><h3>${esc(intent.title)}</h3></div>
          <p>${esc(intent.description)}</p>
          <div class="intent-card-meta">${chipNames(matches)}</div>
          <button class="intent-card-action" type="button" data-intent-action="${esc(intent.key)}">Descubrir destinos <span aria-hidden="true">→</span></button>
        </div>
      </article>`;
    }).join('');
    bindCards();
    updateStatus();
  }

  function activateFilter(key){
    const holder=qs('destinationFilters');
    ensureIntentFilters();
    if(holder){
      const button=Array.from(holder.querySelectorAll('button')).find(b=>b.dataset.filter===key);
      if(button){
        holder.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
        button.classList.add('active');
      }
    }
    if(typeof renderDestinationSections==='function')renderDestinationSections(key);
    document.getElementById('destinos')?.scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'start'});
  }

  function bindCards(){
    track()?.querySelectorAll('[data-intent-action]').forEach(btn=>btn.addEventListener('click',()=>activateFilter(btn.dataset.intentAction)));
  }

  function currentIndex(){
    const t=track(),list=cards();if(!t||!list.length)return 0;
    let best=0,distance=Infinity;
    list.forEach((card,i)=>{const d=Math.abs((card.offsetLeft-t.offsetLeft)-t.scrollLeft);if(d<distance){distance=d;best=i;}});
    return best;
  }

  function updateStatus(){
    const status=qs('intentStatus');const count=cards().length;
    if(status)status.textContent=count?`${currentIndex()+1} de ${count}`:'0 de 0';
  }

  function markInteraction(ms=12000){interactionUntil=Date.now()+ms;}
  function scrollToIndex(index,{manual=false}={}){
    const t=track(),list=cards();if(!t||!list.length)return;
    const safe=((index%list.length)+list.length)%list.length;
    if(manual)markInteraction();
    t.scrollTo({left:list[safe].offsetLeft-t.offsetLeft,behavior:reducedMotion?'auto':'smooth'});
    setTimeout(updateStatus,reducedMotion?0:380);
  }
  const next=(manual=false)=>scrollToIndex(currentIndex()+1,{manual});
  const prev=(manual=false)=>scrollToIndex(currentIndex()-1,{manual});

  function canAutoplay(){
    return !reducedMotion&&!userPaused&&!hoverPaused&&!focusPaused&&Date.now()>interactionUntil&&cards().length>1&&!document.hidden;
  }
  function start(){
    clearInterval(timer);
    timer=setInterval(()=>{if(canAutoplay())next(false);},6500);
  }
  function syncPause(){
    const btn=qs('intentPause');if(!btn)return;
    btn.textContent=userPaused?'Reanudar movimiento':'Pausar movimiento';
    btn.setAttribute('aria-pressed',String(userPaused));
  }

  function bind(){
    const t=track();if(!t||t.dataset.intentReady==='1')return;
    t.dataset.intentReady='1';
    qs('intentPrev')?.addEventListener('click',()=>prev(true));
    qs('intentNext')?.addEventListener('click',()=>next(true));
    qs('intentPause')?.addEventListener('click',()=>{userPaused=!userPaused;syncPause();});
    qs('intentViewDestinations')?.addEventListener('click',()=>activateFilter('Todos'));
    t.addEventListener('scroll',()=>requestAnimationFrame(updateStatus),{passive:true});
    t.addEventListener('pointerdown',()=>markInteraction(15000),{passive:true});
    t.addEventListener('touchstart',()=>markInteraction(15000),{passive:true});
    t.addEventListener('mouseenter',()=>{hoverPaused=true;});
    t.addEventListener('mouseleave',()=>{hoverPaused=false;});
    t.addEventListener('focusin',()=>{focusPaused=true;});
    t.addEventListener('focusout',()=>{focusPaused=false;});
    syncPause();start();
  }

  document.addEventListener('DOMContentLoaded',()=>{
    bind();
    const waitForData=setInterval(()=>{
      ensureIntentFilters();
      if(typeof DESTINATIONS!=='undefined'&&DESTINATIONS.length){clearInterval(waitForData);render();}
    },120);
    setTimeout(()=>clearInterval(waitForData),6000);
  });
})();
