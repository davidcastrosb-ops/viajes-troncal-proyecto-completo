(()=>{
  const esc=(v='')=>String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const list=(items=[])=>items&&items.length?`<ul class="detail-list">${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p>Información en preparación.</p>';
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
    overlay.addEventListener('click',e=>{if(e.target===overlay)closeModal();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
    return overlay;
  }
  function closeModal(){const o=document.getElementById('destinationDetailOverlay');if(o){o.classList.remove('open');o.setAttribute('aria-hidden','true');document.body.style.overflow='';}}
  function openModal(d){
    const overlay=ensureModal();const holder=document.getElementById('destinationDetailContent');
    const sources=sourceRows(d);
    const sourceHtml=sources.length?sources.map(s=>`<div class="detail-source"><div><b>${esc(s.organization)} — ${esc(s.title)}</b><span>Verificada ${esc(s.verifiedAt||'')} · ${esc(s.note||'')}</span></div><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Fuente oficial ↗</a></div>`).join(''):'<p>Las fuentes de esta ficha están en proceso de publicación.</p>';
    const wa=typeof whatsappLink==='function'?whatsappLink(`Hola, quiero cotizar un viaje a ${d.name} con Trhoncal Travel.`):'#cotizar';
    holder.innerHTML=`
      <header class="detail-header"><button class="detail-close" type="button" aria-label="Cerrar">×</button><span class="eyebrow">${esc(d.state)} · ${esc(d.country)}${d.puebloMagico?' · Pueblo Mágico':''}</span><h2 id="detailTitle">${esc(d.name)}</h2><p>${esc(d.summary||'')}</p></header>
      <div class="detail-body">
        <div class="detail-summary-grid"><div class="detail-stat"><small>Estancia sugerida</small><b>${esc(d.recommendedStay||'Por definir')}</b></div><div class="detail-stat"><small>Tipo de viaje</small><b>${esc((d.segments||[]).slice(0,4).join(' · ')||d.type||'Por definir')}</b></div><div class="detail-stat"><small>Última verificación</small><b>${esc(d.lastVerified||'En revisión')}</b></div></div>
        <div class="detail-columns">
          <div><section class="detail-block"><h3>Por qué ir</h3><p>${esc(d.whyGo||'')}</p></section><section class="detail-block"><h3>Historia y contexto</h3><p>${esc(d.history||'')}</p></section><section class="detail-block"><h3>Atractivos clave</h3>${list(d.attractions)}</section><section class="detail-block"><h3>Experiencias</h3>${list(d.experiences)}</section></div>
          <div><section class="detail-block"><h3>¿Para quién funciona?</h3><p>${esc(d.travelerProfile||'')}</p></section><section class="detail-block"><h3>Clima y temporadas</h3><p>${esc(d.climateSeasons||'')}</p></section><section class="detail-block"><h3>Cómo llegar y moverse</h3><p>${esc(d.connectivity||'')}</p></section><section class="detail-block"><h3>Qué combinar</h3>${list(d.combinations)}</section><section class="detail-block"><h3>Riesgos que sí revisamos</h3><p>${esc(d.operationalRisks||'')}</p></section></div>
        </div>
        <section class="detail-block"><h3>Gastronomía</h3><p>${esc(d.gastronomy||'')}</p></section>
        <section class="detail-block"><h3>Patrimonio y reconocimientos</h3>${list(d.recognitions)}<p style="margin-top:12px">${esc(d.sustainabilityHeritage||'')}</p></section>
        <section class="detail-sources"><h3>Fuentes que respaldan esta ficha</h3>${sourceHtml}</section>
        <div class="detail-actions"><a class="btn btn-primary" href="${wa}" target="_blank" rel="noopener noreferrer">Cotizar ${esc(d.name)}</a><a class="btn btn-soft" href="#cotizar" data-close-detail>Solicitar viaje</a></div>
      </div>`;
    holder.querySelector('.detail-close').addEventListener('click',closeModal);holder.querySelectorAll('[data-close-detail]').forEach(a=>a.addEventListener('click',closeModal));
    overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
  }
  function decorate(){
    const grid=document.getElementById('destinationGrid');if(!grid||typeof DESTINATIONS==='undefined')return;
    grid.querySelectorAll('.destination-card').forEach(card=>{
      if(card.dataset.detailReady==='1')return;
      const name=card.querySelector('h3')?.textContent?.trim();const d=DESTINATIONS.find(x=>x.name===name);if(!d)return;
      const foot=card.querySelector('.card-foot');if(!foot)return;
      const button=document.createElement('button');button.type='button';button.className='detail-link';button.textContent='Ver ficha completa →';button.addEventListener('click',()=>openModal(d));
      foot.insertBefore(button,foot.querySelector('a'));card.dataset.detailReady='1';
    });
  }
  document.addEventListener('DOMContentLoaded',()=>{const grid=document.getElementById('destinationGrid');if(!grid)return;new MutationObserver(decorate).observe(grid,{childList:true,subtree:true});setTimeout(decorate,350);});
})();
