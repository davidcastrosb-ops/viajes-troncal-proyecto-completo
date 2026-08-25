(()=>{
  const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const INTENTS=[
    {key:'Familia',title:'Viajes en familia',kicker:'Para compartir',description:'Destinos con playa, actividades y opciones que funcionan bien para viajar con niños o varias generaciones.'},
    {key:'Pareja',title:'Escapadas en pareja',kicker:'Tiempo para dos',description:'Destinos para descansar, comer bien, caminar, celebrar o simplemente cambiar de aire juntos.'},
    {key:'Playa',title:'Playa y mar',kicker:'Sol, agua y descanso',description:'Caribe, Pacífico e islas para combinar descanso, actividades acuáticas y experiencias costeras.'},
    {key:'Cultura',title:'Cultura e historia',kicker:'Viajar entendiendo el lugar',description:'Destinos con patrimonio, identidad, arqueología, tradiciones o contexto histórico que vale la pena conocer.'},
    {key:'Naturaleza',title:'Naturaleza y aventura',kicker:'Salir de la rutina',description:'Lagunas, cenotes, áreas protegidas, paisajes y experiencias al aire libre.'},
    {key:'Gastronomía',title:'Comer también es viajar',kicker:'Sabores con destino',description:'Lugares donde la cocina, mercados, restaurantes y producto local forman parte central de la experiencia.'}
  ];

  let timer=null;
  let userPaused=false;
  let hoverPaused=false;
  let focusPaused=false;
  let interactionUntil=0;

  const qs=id=>document.getElementById(id);
  const track=()=>qs('intentTrack');
  const cards=()=>Array.from(track()?.querySelectorAll('.intent-card')||[]);

  function visibleDestinations(){
    if(typeof DESTINATIONS==='undefined')return [];
    return DESTINATIONS.filter(d=>typeof isDestinationVisible==='function'?isDestinationVisible(d):true);
  }

  function normalizedText(d){
    return [
      ...(d.segments||[]),
      d.travelerProfile||'',
      d.type||'',
      d.summary||'',
      d.whyGo||'',
      d.gastronomy||''
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

  /* Amplía los filtros existentes sin tocar la fuente de datos del Maestro. */
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

  function render(){
    const t=track();if(!t)return;
    const destinations=visibleDestinations();
    t.innerHTML=INTENTS.map(intent=>{
      const matches=destinations.filter(d=>matchesIntent(d,intent.key));
      const examples=matches.slice(0,3).map(d=>d.name).join(' · ');
      const count=matches.length;
      return `<article class="intent-card" data-intent="${intent.key}">
        <span class="eyebrow">${intent.kicker}</span>
        <h3>${intent.title}</h3>
        <p>${intent.description}</p>
        <div class="intent-card-meta"><b>${count} ${count===1?'destino':'destinos'}</b>${examples?`<span>${examples}</span>`:''}</div>
        <button class="intent-card-action" type="button" data-intent-action="${intent.key}">Ver destinos →</button>
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
    track()?.querySelectorAll('[data-intent-action]').forEach(btn=>{
      btn.addEventListener('click',()=>activateFilter(btn.dataset.intentAction));
    });
  }

  function currentIndex(){
    const t=track(),list=cards();if(!t||!list.length)return 0;
    let best=0,distance=Infinity;
    list.forEach((card,i)=>{const d=Math.abs(card.offsetLeft-t.scrollLeft);if(d<distance){distance=d;best=i;}});
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
    t.scrollTo({left:list[safe].offsetLeft,behavior:reducedMotion?'auto':'smooth'});
    setTimeout(updateStatus,reducedMotion?0:380);
  }
  const next=(manual=false)=>scrollToIndex(currentIndex()+1,{manual});
  const prev=(manual=false)=>scrollToIndex(currentIndex()-1,{manual});

  function canAutoplay(){
    return !reducedMotion&&!userPaused&&!hoverPaused&&!focusPaused&&Date.now()>interactionUntil&&cards().length>1;
  }
  function start(){
    clearInterval(timer);
    timer=setInterval(()=>{if(canAutoplay())next(false);},6200);
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
