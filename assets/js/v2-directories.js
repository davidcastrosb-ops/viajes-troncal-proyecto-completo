(()=>{
  const root=document.querySelector('[data-v2-directory]');
  if(!root)return;
  const mode=root.dataset.v2Directory;
  const valid=new Set(['verified','verified-initial','approved','published']);
  const hotelFallback={
    'OF-PA-PVR-REV26-001':'friendly-fun-vallarta',
    'OF-PA-PVR-SEP26-002':'barcelo-puerto-vallarta',
    'OF-PA-NAY-REV26-003':'grand-decameron-bucerias'
  };
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safe=v=>{try{const u=new URL(String(v));return /^https?:$/.test(u.protocol)?u.toString():'';}catch(_){return '';}};
  const numberMx=v=>{const n=Number(String(v??'').replace(/[^0-9.-]/g,''));return Number.isFinite(n)?new Intl.NumberFormat('es-MX',{maximumFractionDigits:0}).format(n):'';};
  const priceUnit=o=>{const raw=String(o?.priceUnit||'').trim();if(/por\s*persona/i.test(raw))return 'Por persona';if(/total/i.test(raw))return 'Total publicado';if(/desde/i.test(raw))return 'Desde';return raw||'Precio publicado';};
  const dateMx=v=>/^\d{4}-\d{2}-\d{2}$/.test(String(v))?new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'short',year:'numeric'}).format(new Date(v+'T12:00:00')):String(v||'');
  const visible=o=>{if(!o)return false;if(o.showWeb===false||/^(no|false|0)$/i.test(String(o.showWeb||'').trim()))return false;const e=o.expirationDate||o.expiresAt||o.fechaExpiracionWeb||'';return !(/^\d{4}-\d{2}-\d{2}$/.test(String(e))&&new Date(e+'T23:59:59')<new Date());};
  const offerTarget=(o,hotels)=>{
    const id=String(o?.id||'').trim();
    const h=hotels.find(x=>x&&o.hotelId&&x.id===o.hotelId),s=h?.slug||hotelFallback[id]||'';
    if(s)return {href:'/hotel-v2/'+encodeURIComponent(s)+'?oferta='+encodeURIComponent(id),label:'Conocer hotel y oferta →'};
    const q=new URLSearchParams({cta:'offer_directory_without_hotel',oferta:id});
    if(o?.leadDestinationVerified)q.set('destino',String(o.leadDestinationVerified));
    return {href:'/cotizar-v2?'+q.toString(),label:'Cotizar esta opción →'};
  };
  function renderDestinations(p){
    const offers=(Array.isArray(p.offers)?p.offers:[]).filter(visible),counts=new Map();offers.forEach(o=>counts.set(o.destinationId,(counts.get(o.destinationId)||0)+1));
    const destinations=(Array.isArray(p.destinations)?p.destinations:[]).filter(d=>d&&d.slug&&valid.has(d.status));
    const groups=new Map();destinations.forEach(d=>{const state=d.state||'Otros destinos';if(!groups.has(state))groups.set(state,[]);groups.get(state).push(d);});
    return [...groups.entries()].sort((a,b)=>a[0].localeCompare(b[0],'es')).map(([state,items])=>'<section class="v2-dir-group"><div class="v2-dir-group-head"><div><span class="eyebrow">México</span><h2>'+esc(state)+'</h2></div><span>'+items.length+' destino'+(items.length===1?'':'s')+'</span></div><div class="v2-destination-grid">'+items.sort((a,b)=>String(a.name).localeCompare(String(b.name),'es')).map(d=>{const n=counts.get(d.id)||0,img=safe(d.mainImage),href='/destino-v2/'+encodeURIComponent(d.slug);return '<article class="v2-destination-card"><a class="v2-destination-image" href="'+href+'">'+(img?'<img src="'+esc(img)+'" alt="'+esc(d.imageAlt||d.name)+'" loading="lazy">':'<div>Descubre '+esc(d.name)+'</div>')+'</a><div class="v2-destination-body"><span class="eyebrow">'+esc(d.country||'México')+'</span><h3>'+esc(d.name)+'</h3><p>'+esc(d.summary||'')+'</p><div class="v2-destination-foot"><strong>'+(n?n+' viaje'+(n===1?'':'s')+' disponible'+(n===1?'':'s'):'Viaje a tu medida')+'</strong><a href="'+href+'">'+(n?'Ver viajes':'Conocer y cotizar')+' →</a></div></div></article>';}).join('')+'</div></section>').join('');
  }
  function renderOffers(p){
    const offers=(Array.isArray(p.offers)?p.offers:[]).filter(visible),destinations=Array.isArray(p.destinations)?p.destinations:[],hotels=Array.isArray(p.hotels)?p.hotels:[];
    if(!offers.length)return '<div class="v2-dir-empty"><span class="eyebrow">Por ahora</span><h2>No hay promociones publicadas</h2><p>Explora destinos y pide una cotización a tu medida.</p><a class="btn btn-primary" href="/destinos-v2/">Explorar destinos →</a></div>';
    const groups=new Map();offers.forEach(o=>{if(!groups.has(o.destinationId))groups.set(o.destinationId,[]);groups.get(o.destinationId).push(o);});
    return [...groups.entries()].map(([id,rows])=>{const d=destinations.find(x=>x&&x.id===id),name=d?.name||rows[0]?.leadDestinationVerified||'Destino';rows.sort((a,b)=>(Number(a.ordenWeb)||999)-(Number(b.ordenWeb)||999));return '<section class="v2-dir-group"><div class="v2-dir-group-head"><div><span class="eyebrow">'+esc(d?.state||'Viajes disponibles')+'</span><h2>'+esc(name)+'</h2></div>'+(d?.slug?'<a href="/destino-v2/'+encodeURIComponent(d.slug)+'">Conocer '+esc(name)+' →</a>':'')+'</div><div class="v2-offer-grid">'+rows.map(o=>{const img=safe(o.image),target=offerTarget(o,hotels),dates=[o.travelStart?dateMx(o.travelStart):'',o.travelEnd?dateMx(o.travelEnd):''].filter(Boolean).join(' – '),dur=[o.days?o.days+' días':'',o.nights?o.nights+' noches':''].filter(Boolean).join(' · '),price=numberMx(o.price||'');return '<article class="v2-offer-card"><a class="v2-offer-image" href="'+esc(target.href)+'">'+(img?'<img src="'+esc(img)+'" alt="'+esc(o.hotel||o.title||'Opción de viaje')+'" loading="lazy">':'<div>Conoce esta opción</div>')+'</a><div class="v2-offer-body"><div class="v2-offer-meta"><span>'+esc(o.plan||'Viaje')+'</span><small>'+esc(dates)+'</small></div><h3 translate="no" class="notranslate">'+esc(o.hotel||o.title||'Opción de viaje')+'</h3>'+(dur?'<p>'+esc(dur)+(o.occupancy?' · '+esc(o.occupancy):'')+'</p>':'')+'<div class="v2-offer-bottom"><div><small>'+esc(priceUnit(o))+'</small><strong>'+(price?'$'+esc(price):'Consultar')+'</strong>'+(price?'<b> MXN</b>':'')+'</div><a href="'+esc(target.href)+'">'+esc(target.label)+'</a></div></div></article>';}).join('')+'</div></section>';}).join('');
  }
  root.innerHTML='<div class="v2-dir-status">Cargando opciones…</div>';
  fetch('/api/master',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('No pudimos cargar el catálogo.');return r.json();}).then(p=>{root.innerHTML=mode==='offers'?renderOffers(p):renderDestinations(p);}).catch(e=>{root.innerHTML='<div class="v2-dir-empty"><h2>No pudimos cargar esta sección</h2><p>'+esc(e.message||'Intenta nuevamente en un momento.')+'</p><a class="btn btn-outline" href="/">Volver al inicio</a></div>';});
})();