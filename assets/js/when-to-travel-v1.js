(() => {
  const CALENDAR_URL='/assets/data/mexico-calendar.json';
  const OCCASIONS_URL='/assets/data/travel-occasions.json';
  const MASTER_URL='/api/master';

  const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const parseDate=v=>v?new Date(`${v}T12:00:00`):null;
  const now=new Date(); now.setHours(0,0,0,0);
  const fmtDate=v=>{const d=parseDate(v);return d?new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'short',year:'numeric'}).format(d):''};
  const fmtRange=(a,b)=>a===b?fmtDate(a):`${fmtDate(a)} — ${fmtDate(b)}`;
  const money=v=>{const n=Number(String(v??'').replace(/[^0-9.-]/g,''));return Number.isFinite(n)?new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(n):String(v||'')};
  const fetchJSON=async url=>{const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error(url);return r.json()};

  function loadStyles(){
    if(document.querySelector('link[data-when-travel-v1]'))return;
    const link=document.createElement('link');link.rel='stylesheet';link.href='/assets/css/when-to-travel-v1.css';link.dataset.whenTravelV1='';document.head.appendChild(link);
  }

  function importantEvent(e){
    if(e.quick) return true;
    if(e.type==='vacaciones_escolares'||e.type==='receso_escolar') return true;
    return /Independencia|Navidad|Año Nuevo|Trabajo/i.test(e.name||'');
  }

  function homeImportant(e){
    if(e.quick) return true;
    if(e.type==='vacaciones_escolares'||e.type==='receso_escolar') return true;
    return /Independencia/i.test(e.name||'');
  }

  function typeLabel(type){
    return ({descanso_obligatorio:'Descanso obligatorio',vacaciones_escolares:'Vacaciones escolares SEP',dia_sin_clases:'Día sin clases SEP',receso_escolar:'Receso escolar',puente:'Fin de semana largo',idea:'Idea de viaje'})[type]||'Oportunidad para viajar';
  }

  function mergeOpportunities(calendar,occasions){
    const byCal=new Map((occasions||[]).map(o=>[o.calendarEventId,o]));
    return (calendar.events||[])
      .filter(importantEvent)
      .map(e=>{
        const o=byCal.get(e.id)||null;
        return {
          id:o?.id||e.id,
          eventId:e.id,
          title:o?.title||e.name,
          subtitle:o?.subtitle||e.note||'',
          type:o?.type||e.type,
          start:o?.start||e.suggestedStart||e.start,
          end:o?.end||e.suggestedEnd||e.end||e.start,
          offerIds:o?.offerIds||[],
          featuredHome:!!o?.featuredHome,
          note:o?.note||'',
          sourceType:e.type,
          slug:o?.slug||''
        };
      })
      .filter(x=>parseDate(x.end)>=now)
      .sort((a,b)=>parseDate(a.start)-parseDate(b.start));
  }

  function quoteHref(destination,start,end,occasion){
    const p=new URLSearchParams({travelQuote:'1'});
    if(destination)p.set('destino',destination);
    if(start)p.set('salida',start);
    if(end)p.set('regreso',end);
    if(occasion)p.set('ocasion',occasion);
    return `/?${p.toString()}`;
  }

  function offerCard(offer,destination,opp,onHome){
    const title=offer.title||destination?.name||'Viaje especial';
    const price=offer.price?money(offer.price):'';
    const detail=offer.publicPromoUrl||offer.sharePromoUrl||'';
    const destName=destination?.name||offer.leadDestinationVerified||'';
    const quote=onHome?'#cotizar':quoteHref(destName,opp.start,opp.end,opp.id);
    return `<article class="travel-offer-card">
      <span class="travel-offer-badge">Promoción vigente</span>
      <h4>${esc(title)}</h4>
      <div class="travel-offer-meta">${offer.days?`${esc(offer.days)} días`:''}${offer.nights?` · ${esc(offer.nights)} noches`:''}${offer.plan?` · ${esc(offer.plan)}`:''}</div>
      ${price?`<div class="travel-offer-price"><small>precio publicado</small><strong>${esc(price)}</strong><span>${esc(offer.priceUnit||'')}</span></div>`:''}
      <p>${esc(offer.note||'Precio, disponibilidad y condiciones se reconfirman antes de cualquier pago.')}</p>
      <div class="travel-offer-actions">
        ${detail?`<a class="btn btn-soft" href="${esc(detail)}" target="_blank" rel="noopener noreferrer">Ver promoción ↗</a>`:''}
        <a class="btn btn-primary travel-occasion-quote" href="${esc(quote)}" ${onHome?'data-quote-launch':''} data-travel-quote data-destination="${esc(destName)}" data-start="${esc(opp.start)}" data-end="${esc(opp.end)}" data-occasion="${esc(opp.id)}">Quiero este viaje →</a>
      </div>
    </article>`;
  }

  function opportunityCard(opp,offerMap,destinationMap,onHome=false){
    const offers=(opp.offerIds||[]).map(id=>offerMap.get(id)).filter(Boolean);
    const hasOffer=offers.length>0;
    return `<article id="occasion-${esc(opp.id)}" class="travel-opportunity-card ${hasOffer?'has-offer':''}">
      <div class="travel-opportunity-top">
        <span class="travel-type-pill type-${esc(opp.sourceType||opp.type)}">${esc(typeLabel(opp.sourceType||opp.type))}</span>
        <span class="travel-date-range">${esc(fmtRange(opp.start,opp.end))}</span>
      </div>
      <h3>${esc(opp.title)}</h3>
      <p>${esc(opp.subtitle)}</p>
      ${hasOffer?`<div class="travel-offers-list">${offers.map(o=>offerCard(o,destinationMap.get(o.destinationId),opp,onHome)).join('')}</div>`:`<div class="travel-idea-actions"><span class="travel-idea-label">Idea de viaje</span><a class="text-link" href="${esc(quoteHref('',opp.start,opp.end,opp.id))}">Armar un viaje para estas fechas →</a></div>`}
    </article>`;
  }

  function compactHomeCard(opp,offerMap,destinationMap){
    const offers=(opp.offerIds||[]).map(id=>offerMap.get(id)).filter(Boolean);
    const offer=offers[0]||null;
    const destination=offer?destinationMap.get(offer.destinationId):null;
    const price=offer?.price?money(offer.price):'';
    const target=`/cuando-viajar/#occasion-${encodeURIComponent(opp.id)}`;
    return `<article class="travel-home-card ${opp.featuredHome?'is-featured':''}">
      <div class="travel-home-card-top"><span class="travel-type-pill type-${esc(opp.sourceType||opp.type)}">${esc(typeLabel(opp.sourceType||opp.type))}</span><span class="travel-date-range">${esc(fmtRange(opp.start,opp.end))}</span></div>
      <h3>${esc(opp.title)}</h3>
      <p>${esc(opp.subtitle||opp.note||'Una fecha que puede convertirse en viaje.')}</p>
      ${offer?`<div class="travel-home-promo">${esc(destination?.name||offer.leadDestinationVerified||'Promoción vigente')}${price?`<strong>${esc(price)}</strong>`:''}</div>`:''}
      <a href="${esc(target)}">${offer?'Ver viaje':'Ver ideas para estas fechas'} →</a>
    </article>`;
  }

  function weekendIdeaCard(){
    return `<article class="travel-home-card">
      <div class="travel-home-card-top"><span class="travel-type-pill type-idea">Idea de viaje</span><span class="travel-date-range">Cualquier fin de semana</span></div>
      <h3>Escapada de fin de semana</h3>
      <p>No necesitas esperar vacaciones. A veces dos o tres noches son suficientes para cambiar de aire.</p>
      <a class="home-quote-link" href="#cotizar" data-quote-launch>Armar una escapada →</a>
    </article>`;
  }

  function injectHomeShell(){
    if(document.getElementById('cuando-viajar-preview'))return;
    const hero=document.querySelector('.hero-emotional-section');if(!hero)return;
    const section=document.createElement('section');
    section.id='cuando-viajar-preview';
    section.className='section when-travel-section when-travel-home';
    section.innerHTML=`<div class="container"><div class="when-travel-home-head"><div><span class="eyebrow">Tu próximo viaje puede empezar con un día libre</span><h2>¿Cuándo te puedes escapar?</h2></div><p>Puentes, vacaciones escolares y escapadas para ayudarte a encontrar el momento antes de elegir el destino.</p><a class="when-travel-home-link" href="/cuando-viajar/">Ver calendario completo →</a></div><div class="when-travel-carousel"><button class="when-travel-arrow" type="button" data-when-prev aria-label="Ver oportunidad anterior">←</button><div id="whenTravelHomeGrid" class="travel-home-track" aria-live="polite"></div><button class="when-travel-arrow" type="button" data-when-next aria-label="Ver oportunidad siguiente">→</button></div><div id="whenTravelHomeStatus" class="travel-home-status"></div></div>`;
    hero.insertAdjacentElement('afterend',section);
  }

  function setupHomeCarousel(count){
    const track=document.getElementById('whenTravelHomeGrid');if(!track)return;
    const prev=document.querySelector('[data-when-prev]');const next=document.querySelector('[data-when-next]');const status=document.getElementById('whenTravelHomeStatus');
    let index=0;
    const cards=()=>Array.from(track.querySelectorAll('.travel-home-card'));
    const sync=()=>{const list=cards();if(!list.length)return;if(status)status.textContent=`${Math.min(index+1,list.length)} de ${list.length} · desliza para ver más`;};
    const go=delta=>{const list=cards();if(!list.length)return;index=(index+delta+list.length)%list.length;track.scrollTo({left:list[index].offsetLeft-track.offsetLeft,behavior:'smooth'});sync();};
    prev?.addEventListener('click',()=>go(-1));next?.addEventListener('click',()=>go(1));
    track.addEventListener('scroll',()=>{const list=cards();let best=Infinity,closest=0;list.forEach((card,i)=>{const d=Math.abs((card.offsetLeft-track.offsetLeft)-track.scrollLeft);if(d<best){best=d;closest=i;}});index=closest;sync();},{passive:true});
    if(count<2){if(prev)prev.hidden=true;if(next)next.hidden=true;}sync();
  }

  function injectMenuLink(){
    document.querySelectorAll('.nav').forEach(nav=>{
      if(nav.querySelector('a[href="/cuando-viajar/"]'))return;
      const a=document.createElement('a');a.href='/cuando-viajar/';a.textContent='Cuándo viajar';
      const offers=nav.querySelector('a[href="#promociones"]');
      if(offers)nav.insertBefore(a,offers);else nav.appendChild(a);
    });
  }

  function bindHomeQuotePrefill(){
    document.addEventListener('click',event=>{
      const a=event.target.closest('[data-travel-quote][data-quote-launch]');
      if(!a)return;
      setTimeout(()=>{
        const form=document.getElementById('travelQuoteForm');if(!form)return;
        if(a.dataset.start&&form.elements.fechaSalida)form.elements.fechaSalida.value=a.dataset.start;
        if(a.dataset.end&&form.elements.fechaRegreso)form.elements.fechaRegreso.value=a.dataset.end;
      },80);
    },true);
  }

  function handleIncomingQuote(){
    const p=new URLSearchParams(location.search);if(p.get('travelQuote')!=='1')return;
    const launch=()=>{
      const trigger=document.querySelector('[data-quote-launch]');if(!trigger)return false;
      trigger.dataset.destination=p.get('destino')||'';trigger.click();
      setTimeout(()=>{
        const form=document.getElementById('travelQuoteForm');if(!form)return;
        if(p.get('salida')&&form.elements.fechaSalida)form.elements.fechaSalida.value=p.get('salida');
        if(p.get('regreso')&&form.elements.fechaRegreso)form.elements.fechaRegreso.value=p.get('regreso');
      },120);
      history.replaceState({},'',location.pathname+'#cotizar');
      return true;
    };
    if(!launch())setTimeout(launch,350);
  }

  async function init(){
    loadStyles();
    const isPage=!!document.getElementById('whenTravelPage');
    if(!isPage){injectMenuLink();injectHomeShell();bindHomeQuotePrefill();}
    try{
      const [calendar,occasionData,master]=await Promise.all([fetchJSON(CALENDAR_URL),fetchJSON(OCCASIONS_URL),fetchJSON(MASTER_URL)]);
      const opportunities=mergeOpportunities(calendar,occasionData.occasions||[]);
      const offers=new Map((master.offers||[]).map(o=>[o.id,o]));
      const destinations=new Map((master.destinations||[]).map(d=>[d.id,d]));
      if(isPage){
        const grid=document.getElementById('whenTravelPageGrid');
        if(grid)grid.innerHTML=opportunities.map(o=>opportunityCard(o,offers,destinations,false)).join('');
        const count=document.getElementById('whenTravelCount');if(count)count.textContent=`${opportunities.length} fechas y periodos para explorar`;
      }else{
        const grid=document.getElementById('whenTravelHomeGrid');
        if(grid){
          const homeEventIds=new Set((calendar.events||[]).filter(homeImportant).map(e=>e.id));
          const featured=opportunities.filter(o=>homeEventIds.has(o.eventId)).sort((a,b)=>Number(b.featuredHome)-Number(a.featuredHome)||parseDate(a.start)-parseDate(b.start)).slice(0,5);
          grid.innerHTML=featured.map(o=>compactHomeCard(o,offers,destinations)).join('')+weekendIdeaCard();
          setupHomeCarousel(featured.length+1);
        }
        handleIncomingQuote();
      }
    }catch(err){console.warn('Cuándo viajar no disponible',err);}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
