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

  function importantEvent(e){
    if(e.quick) return true;
    if(e.type==='vacaciones_escolares'||e.type==='receso_escolar') return true;
    return /Independencia|Navidad|Año Nuevo|Trabajo/i.test(e.name||'');
  }

  function typeLabel(type){
    return ({descanso_obligatorio:'Descanso obligatorio',vacaciones_escolares:'Vacaciones escolares SEP',dia_sin_clases:'Día sin clases SEP',receso_escolar:'Receso escolar',puente:'Fin de semana largo'})[type]||'Oportunidad para viajar';
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
          sourceType:e.type
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
      ${price?`<div class="travel-offer-price"><small>desde / precio publicado</small><strong>${esc(price)}</strong><span>${esc(offer.priceUnit||'')}</span></div>`:''}
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
    return `<article class="travel-opportunity-card ${hasOffer?'has-offer':''}">
      <div class="travel-opportunity-top">
        <span class="travel-type-pill type-${esc(opp.sourceType||opp.type)}">${esc(typeLabel(opp.sourceType||opp.type))}</span>
        <span class="travel-date-range">${esc(fmtRange(opp.start,opp.end))}</span>
      </div>
      <h3>${esc(opp.title)}</h3>
      <p>${esc(opp.subtitle)}</p>
      ${hasOffer?`<div class="travel-offers-list">${offers.map(o=>offerCard(o,destinationMap.get(o.destinationId),opp,onHome)).join('')}</div>`:`<div class="travel-idea-actions"><span class="travel-idea-label">Idea de viaje</span><a class="text-link" href="${esc(quoteHref('',opp.start,opp.end,opp.id))}">Armar un viaje para estas fechas →</a></div>`}
    </article>`;
  }

  function injectHomeShell(){
    if(document.getElementById('cuando-viajar-preview'))return;
    const target=document.getElementById('inspiracion')||document.getElementById('promociones');
    if(!target)return;
    const section=document.createElement('section');
    section.id='cuando-viajar-preview';
    section.className='section when-travel-section';
    section.innerHTML=`<div class="container"><div class="section-head"><div><span class="eyebrow">Tu próximo viaje puede empezar con un día libre</span><h2>Próximas oportunidades para viajar</h2></div><p>Puentes, vacaciones escolares y fechas especiales de México reunidas en un solo lugar. Cuando exista una promoción real, la verás aquí.</p></div><div id="whenTravelHomeGrid" class="travel-home-grid"></div><div class="travel-section-more"><a class="btn btn-soft" href="/cuando-viajar/">Ver cuándo viajar →</a></div></div>`;
    target.parentNode.insertBefore(section,target);
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
          const featured=[...opportunities].sort((a,b)=>Number(b.featuredHome)-Number(a.featuredHome)||parseDate(a.start)-parseDate(b.start)).slice(0,4);
          grid.innerHTML=featured.map(o=>opportunityCard(o,offers,destinations,true)).join('');
        }
        handleIncomingQuote();
      }
    }catch(err){console.warn('Cuándo viajar no disponible',err);}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
