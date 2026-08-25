(() => {
  const CALENDAR_URL='/assets/data/mexico-calendar.json';
  const OCCASIONS_URL='/assets/data/travel-occasions.json';
  const MASTER_URL='/api/master';
  const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const parseDate=v=>v?new Date(`${v}T12:00:00`):null;
  const today=new Date();today.setHours(0,0,0,0);
  const fmt=v=>{const d=parseDate(v);return d?new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'short',year:'numeric'}).format(d):''};
  const range=(a,b)=>!b||a===b?fmt(a):`${fmt(a)} — ${fmt(b)}`;
  const money=v=>{const n=Number(String(v??'').replace(/[^0-9.-]/g,''));return Number.isFinite(n)?new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(n):''};
  const getJSON=async url=>{const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error(url);return r.json()};

  function importantEvent(e){
    return !!(e.quick||e.type==='vacaciones_escolares'||e.type==='receso_escolar'||/Independencia|Navidad|Año Nuevo/i.test(e.name||''));
  }
  function merge(calendar,occasions){
    const byCal=new Map((occasions||[]).map(o=>[o.calendarEventId,o]));
    return (calendar.events||[]).filter(importantEvent).map(e=>{
      const o=byCal.get(e.id)||{};
      const start=o.start||e.suggestedStart||e.start;
      const end=o.end||e.suggestedEnd||e.end||e.start;
      return {id:o.id||e.id,eventId:e.id,title:o.title||e.name,subtitle:o.subtitle||o.note||e.note||'',start,end,offerIds:o.offerIds||[],featuredHome:!!o.featuredHome,order:o.order??9999,heroHeadline:o.heroHeadline||'',sourceType:e.type};
    }).filter(x=>parseDate(x.end)>=today).sort((a,b)=>Number(b.featuredHome)-Number(a.featuredHome)||(a.order-b.order)||parseDate(a.start)-parseDate(b.start));
  }
  function minPrice(list){
    const nums=list.map(o=>Number(String(o.price??'').replace(/[^0-9.-]/g,''))).filter(Number.isFinite);
    return nums.length?Math.min(...nums):null;
  }
  function groupOffers(offers,destinations){
    const map=new Map();
    offers.forEach(o=>{
      const key=o.destinationId||o.leadDestinationVerified||'sin-destino';
      if(!map.has(key))map.set(key,{destination:destinations.get(o.destinationId)||null,offers:[]});
      map.get(key).offers.push(o);
    });
    return [...map.values()].map(g=>({
      name:g.destination?.name||g.offers[0]?.leadDestinationVerified||'Destino disponible',
      image:g.destination?.mainImage||'',credit:g.destination?.imageCredit||'',count:g.offers.length,min:minPrice(g.offers)
    })).sort((a,b)=>(a.min??Infinity)-(b.min??Infinity));
  }
  function fallbackDestination(opportunity,destinations,index){
    const list=[...destinations.values()].filter(d=>d?.mainImage);
    if(!list.length)return null;
    const preferred={
      'CAL-2026-NOV16':'MX-JAL-PVR-001',
      'CAL-2026-INVIERNO':'MX-ROO-CUN-001',
      'CAL-2027-FEB1':'MX-ROO-RM-001',
      'CAL-2027-MAR15':'MX-OAX-HUX-001',
      'CAL-2027-SEMANA-SANTA':'MX-ROO-RM-001',
      'CAL-2027-VERANO':'MX-NAY-NN-001',
      'CAL-2026-SEP16':'MX-JAL-PVR-001'
    };
    return destinations.get(preferred[opportunity.eventId])||list[index%list.length];
  }
  function typeLabel(type){
    return ({descanso_obligatorio:'Puente / descanso',vacaciones_escolares:'Vacaciones escolares',receso_escolar:'Receso escolar'})[type]||'Oportunidad para viajar';
  }
  function renderCard(opportunity,offerMap,destinations,index){
    const offers=(opportunity.offerIds||[]).map(id=>offerMap.get(id)).filter(Boolean);
    const groups=groupOffers(offers,destinations);
    const firstGroup=groups.find(g=>g.image)||null;
    const fallback=fallbackDestination(opportunity,destinations,index);
    const image=firstGroup?.image||fallback?.mainImage||'';
    const credit=firstGroup?.credit||fallback?.imageCredit||'';
    const imageHtml=image?`<img src="${esc(image)}" alt="${esc(opportunity.title)}" loading="lazy">`:'<span class="travel-spotlight-placeholder" aria-hidden="true"></span>';
    const creditHtml=credit?`<span class="travel-spotlight-credit">${esc(credit)}</span>`:'';
    const optionHtml=groups.slice(0,2).map(g=>{
      const count=`${g.count} ${g.count===1?'opción':'opciones'}`;
      const from=g.min!==null?` · desde ${money(g.min)}`:'';
      return `<div class="travel-spotlight-option"><strong>${esc(g.name)}</strong><span>${esc(count+from)}</span></div>`;
    }).join('');
    const summary=opportunity.heroHeadline||opportunity.subtitle||'Una fecha que puede convertirse en una gran escapada.';
    const href=groups.length?`#occasion-${encodeURIComponent(opportunity.id)}`:`/?travelQuote=1&salida=${encodeURIComponent(opportunity.start)}&regreso=${encodeURIComponent(opportunity.end)}&ocasion=${encodeURIComponent(opportunity.id)}`;
    const cta=groups.length?'Ver viajes para estas fechas →':'Quiero aprovechar estas fechas →';
    return `<article class="travel-spotlight-card${index===0?' is-active':''}" tabindex="0">
      ${imageHtml}${creditHtml}
      <div class="travel-spotlight-content">
        <span class="travel-spotlight-kicker">${esc(typeLabel(opportunity.sourceType))}</span>
        <span class="travel-spotlight-date">${esc(range(opportunity.start,opportunity.end))}</span>
        <h3>${esc(opportunity.title)}</h3>
        <p class="travel-spotlight-summary">${esc(summary)}</p>
        ${groups.length?`<div class="travel-spotlight-options">${optionHtml}</div>`:''}
        <a class="travel-spotlight-cta" href="${esc(href)}">${esc(cta)}</a>
      </div>
    </article>`;
  }
  function bindActive(strip){
    const cards=[...strip.querySelectorAll('.travel-spotlight-card')];
    const activate=card=>cards.forEach(c=>c.classList.toggle('is-active',c===card));
    cards.forEach(card=>{
      card.addEventListener('mouseenter',()=>activate(card));
      card.addEventListener('focusin',()=>activate(card));
      card.addEventListener('click',e=>{if(!e.target.closest('a'))activate(card)});
    });
    strip.addEventListener('mouseleave',()=>{if(cards[0])activate(cards[0])});
  }
  async function init(){
    const strip=document.getElementById('whenTravelSpotlight');if(!strip)return;
    try{
      const [calendar,occasionData,master]=await Promise.all([getJSON(CALENDAR_URL),getJSON(OCCASIONS_URL),getJSON(MASTER_URL)]);
      const opportunities=merge(calendar,occasionData.occasions||[]).slice(0,6);
      const offerMap=new Map((master.offers||[]).map(o=>[o.id,o]));
      const destinations=new Map((master.destinations||[]).map(d=>[d.id,d]));
      strip.innerHTML=opportunities.map((o,i)=>renderCard(o,offerMap,destinations,i)).join('');
      bindActive(strip);
    }catch(err){
      console.warn('Galería Cuándo viajar no disponible',err);
      strip.innerHTML='<p class="meta">Estamos preparando las próximas oportunidades para viajar.</p>';
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
