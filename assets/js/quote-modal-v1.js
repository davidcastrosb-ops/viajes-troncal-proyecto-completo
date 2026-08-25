(() => {
  const DEFAULT_FORM_URL='https://form.jotform.com/262364782762062';

  function formUrl(destination=''){
    let base=DEFAULT_FORM_URL;
    try{
      if(typeof SITE!=='undefined'&&SITE&&SITE.forms&&SITE.forms.jotformUrl)base=SITE.forms.jotformUrl;
    }catch(_){/* fallback */}
    const url=new URL(base,window.location.href);
    if(destination){
      url.searchParams.set('destinoDeseado',destination);
    }
    return url.toString();
  }

  function elements(){
    return {
      modal:document.getElementById('quoteModal'),
      frame:document.getElementById('quoteModalFrame'),
      selected:document.getElementById('quoteSelectedDestination'),
      title:document.getElementById('quoteModalTitle'),
      copy:document.getElementById('quoteModalCopy'),
      fallback:document.getElementById('quoteModalFallbackLink')
    };
  }

  function openQuote(destination=''){
    const el=elements();
    if(!el.modal||!el.frame)return;
    const clean=String(destination||'').trim();
    const url=formUrl(clean);
    el.frame.src=url;
    if(el.fallback)el.fallback.href=url;
    if(el.selected){
      if(clean){el.selected.hidden=false;el.selected.textContent=`Destino seleccionado: ${clean}`;}
      else{el.selected.hidden=true;el.selected.textContent='';}
    }
    if(el.title)el.title.textContent=clean?`Tu viaje a ${clean}`:'Solicita tu viaje a tu medida';
    if(el.copy)el.copy.textContent=clean
      ?'Ya sabemos a dónde quieres ir. Cuéntanos fechas, viajeros y lo esencial para empezar.'
      :'Cuéntanos lo esencial. Nosotros te ayudamos a convertirlo en un viaje real.';
    el.modal.hidden=false;
    document.body.classList.add('quote-modal-open');
    const close=el.modal.querySelector('.quote-modal-close');
    if(close)requestAnimationFrame(()=>close.focus());
  }

  function closeQuote(){
    const el=elements();
    if(!el.modal)return;
    el.modal.hidden=true;
    document.body.classList.remove('quote-modal-open');
    if(el.frame)el.frame.src='about:blank';
  }

  document.addEventListener('click',event=>{
    const trigger=event.target.closest('[data-quote-launch],.quote-link');
    if(trigger){
      event.preventDefault();
      openQuote(trigger.dataset.destination||'');
      return;
    }
    if(event.target.closest('[data-quote-close]')){
      event.preventDefault();
      closeQuote();
    }
  });

  document.addEventListener('keydown',event=>{
    if(event.key==='Escape')closeQuote();
  });
})();
