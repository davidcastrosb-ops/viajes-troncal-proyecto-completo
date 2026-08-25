(()=>{
  function esc(value=''){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function validHttp(value=''){
    try{const u=new URL(String(value));return /^https?:$/.test(u.protocol)?u.toString():'';}catch(_){return '';}
  }
  async function fetchJSON(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error(url);return r.json();}
  function loadHeroV5Assets(){
    if(document.querySelector('link[data-hero-v5]'))return;
    const link=document.createElement('link');link.rel='stylesheet';link.href='/assets/css/hero-v5.css';link.dataset.heroV5='';document.head.appendChild(link);
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
    const old=holder?.querySelector('.hero-image-credit');if(old)old.remove();
    if(holder&&d.imageCredit){
      const credit=document.createElement('span');credit.className='hero-image-credit';credit.textContent=d.imageCredit;holder.appendChild(credit);
    }
    img.addEventListener('error',()=>{if(holder)holder.style.background='linear-gradient(145deg,#063f53,#0a6171)';img.remove();},{once:true});
  }

  function visibleDestinations(){
    if(typeof DESTINATIONS==='undefined'||typeof isDestinationVisible!=='function')return [];
    return DESTINATIONS.filter(isDestinationVisible);
  }

  function renderGenericHero(){
    const visible=visibleDestinations();
    const featured=visible.filter(d=>d.featuredHome===true&&d.mainImage);
    const rest=visible.filter(d=>d.mainImage&&!featured.includes(d));
    const picks=[...featured,...rest].slice(0,3);
    if(picks[0])setPhoto('heroPhotoMain',picks[0]);
    if(picks[1])setPhoto('heroPhotoTop',picks[1]);
    if(picks[2])setPhoto('heroPhotoBottom',picks[2]);
  }

  function fmtShort(value){
    if(!value)return '';
    const d=new Date(`${value}T12:00:00`);if(Number.isNaN(d.getTime()))return '';
    return new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'long'}).format(d);
  }
  function fmtRange(start,end){
    if(!start)return '';
    if(!end||start===end)return fmtShort(start);
    const a=new Date(`${start}T12:00:00`),b=new Date(`${end}T12:00:00`);
    if(a.getMonth()===b.getMonth())return `${a.getDate()}–${b.getDate()} de ${new Intl.DateTimeFormat('es-MX',{month:'long'}).format(b)}`;
    return `${fmtShort(start)} – ${fmtShort(end)}`;
  }

  function ensureHeroWhenLink(){
    const actions=document.querySelector('.hero-actions');if(!actions||actions.querySelector('.hero-when-link'))return;
    const a=document.createElement('a');a.className='hero-when-link';a.href='/cuando-viajar/';a.textContent='Cuándo viajar →';actions.appendChild(a);
  }

  async function renderHeroTheme(){
    const hero=document.getElementById('heroExperience');if(!hero)return;
    hero.classList.add('hero-v5');
    ensureHeroWhenLink();
    const subtitle=document.getElementById('heroSubtitle');
    if(subtitle)subtitle.textContent='Descubre destinos, fechas y oportunidades reales para tu próximo viaje.';

    try{
      const data=await fetchJSON('/assets/data/travel-occasions.json');
      const now=new Date();now.setHours(0,0,0,0);
      const occasions=(data.occasions||[])
        .filter(o=>o.featuredHome!==false&&(!o.end||new Date(`${o.end}T23:59:59`)>=now))
        .sort((a,b)=>(a.order??9999)-(b.order??9999)||String(a.start).localeCompare(String(b.start)));
      const occasion=occasions[0];
      if(!occasion)throw new Error('No featured occasion');

      const offers=typeof OFFERS!=='undefined'?OFFERS:[];
      const offer=(occasion.offerIds||[]).map(id=>offers.find(o=>o.id===id)).find(Boolean)||null;
      const destinations=visibleDestinations();
      const destination=offer?destinations.find(d=>d.id===offer.destinationId):null;
      const fallback=destinations.find(d=>d.featuredHome&&d.mainImage)||destinations.find(d=>d.mainImage);
      const visual=destination?.mainImage?destination:fallback;
      if(visual)setPhoto('heroPhotoMain',visual);

      const message=document.querySelector('#heroExperience .hero-emotion-message');
      if(message){
        const meta=[fmtRange(occasion.start,occasion.end),destination?.name||''].filter(Boolean).join(' · ');
        message.innerHTML=`<span>${esc(occasion.heroEyebrow||occasion.title||'Una oportunidad para viajar')}</span><b>${esc(occasion.heroHeadline||occasion.note||'Tu próximo viaje puede empezar con un día libre.')}</b>${meta?`<p>${esc(meta)}</p>`:''}<a href="/cuando-viajar/#occasion-${esc(occasion.id)}">${esc(occasion.heroCta||'Ver oportunidades')} →</a>`;
      }
      const brand=document.querySelector('#heroExperience .hero-brand-pill span');if(brand)brand.textContent='Tu próximo viaje empieza aquí';
    }catch(_){
      const message=document.querySelector('#heroExperience .hero-emotion-message');
      if(message)message.innerHTML='<span>INSPÍRATE · DESCUBRE · VIAJA</span><b>Una experiencia empieza mucho antes de hacer la maleta.</b><a href="/cuando-viajar/">Encuentra cuándo viajar →</a>';
    }
  }

  function boot(){
    loadHeroV5Assets();
    loadPromoMakerAssets();
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      if(typeof DESTINATIONS!=='undefined'&&DESTINATIONS.length){
        clearInterval(timer);renderGenericHero();renderHeroTheme();
      }else if(tries>60){clearInterval(timer);renderHeroTheme();}
    },120);
  }
  document.addEventListener('DOMContentLoaded',boot);
})();
