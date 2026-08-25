(() => {
  const LEAD_ENDPOINT = '/api/lead';
  const WHATSAPP_NUMBER = '523329335952';
  let lastTrigger = null;
  let built = false;

  const qs = (sel, root=document) => root.querySelector(sel);
  const qsa = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function slugify(value=''){
    return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  }

  function modal(){ return document.getElementById('quoteModal'); }

  function inferPageDestination(){
    const title = document.getElementById('detailTitle');
    return title ? String(title.textContent || '').trim() : '';
  }

  function buildForm(){
    const root = modal();
    if(!root || built) return;
    const panel = qs('.quote-modal-panel', root);
    if(!panel) return;

    panel.innerHTML = `
      <button class="quote-modal-close" type="button" data-quote-close aria-label="Cerrar solicitud">×</button>
      <header class="quote-modal-head">
        <span class="eyebrow">Trhoncal Travel</span>
        <h2 id="quoteModalTitle">Solicita tu viaje a tu medida</h2>
        <p id="quoteModalCopy">Cuéntanos lo esencial. Nosotros te ayudamos a convertirlo en un viaje real.</p>
        <div id="quoteSelectedDestination" class="quote-modal-destination" hidden></div>
      </header>
      <form id="travelQuoteForm" class="native-quote-form" novalidate>
        <div class="native-form-grid">
          <label class="native-field">
            <span>Nombre <b>*</b></span>
            <input name="nombre" type="text" autocomplete="given-name" maxlength="80" required>
          </label>
          <label class="native-field">
            <span>Apellido</span>
            <input name="apellido" type="text" autocomplete="family-name" maxlength="80">
          </label>
          <label class="native-field">
            <span>WhatsApp <b>*</b></span>
            <input name="whatsapp" type="tel" autocomplete="tel" inputmode="tel" maxlength="30" placeholder="Ej. 33 1234 5678" required>
          </label>
          <label class="native-field">
            <span>Destino deseado <b>*</b></span>
            <input name="destino" type="text" maxlength="140" placeholder="Ej. Puerto Vallarta o Ayúdame a elegir" required>
          </label>
          <label class="native-field">
            <span>Ciudad de salida <b>*</b></span>
            <input name="ciudadSalida" type="text" maxlength="120" placeholder="Ej. Guadalajara" required>
          </label>
          <label class="native-field">
            <span>Fecha aproximada de salida <b>*</b></span>
            <input name="fechaSalida" type="date" required>
          </label>
          <label class="native-field">
            <span>Fecha aproximada de regreso</span>
            <input name="fechaRegreso" type="date">
          </label>
          <label class="native-field">
            <span>Número de viajeros <b>*</b></span>
            <input name="personas" type="number" inputmode="numeric" min="1" max="99" value="2" required>
          </label>
        </div>

        <fieldset class="native-choice-group">
          <legend>¿Cómo prefieres hospedarte? <b>*</b></legend>
          <div class="native-choice-row">
            <label><input type="radio" name="hospedaje" value="Todo incluido" required><span>Todo incluido</span></label>
            <label><input type="radio" name="hospedaje" value="Sin todo incluido" required><span>Sin todo incluido</span></label>
            <label><input type="radio" name="hospedaje" value="Recomiéndame" required checked><span>Recomiéndame</span></label>
          </div>
        </fieldset>

        <label class="native-consent">
          <input name="consentimiento" type="checkbox" required>
          <span>Acepto que Trhoncal Travel me contacte para dar seguimiento a esta solicitud.</span>
        </label>

        <label class="native-honeypot" aria-hidden="true">Sitio web<input name="website" type="text" tabindex="-1" autocomplete="off"></label>
        <div id="quoteFormStatus" class="native-form-status" role="status" aria-live="polite"></div>

        <div class="native-form-actions">
          <button id="quoteSubmitButton" class="btn btn-primary" type="submit">Solicitar mi viaje →</button>
          <span>Sin compromiso. Confirmamos precio y disponibilidad antes de cualquier pago.</span>
        </div>
      </form>
      <section id="quoteSuccess" class="native-quote-success" hidden>
        <div class="native-success-icon">✓</div>
        <h3>¡Solicitud recibida!</h3>
        <p>Gracias. Ya tenemos lo necesario para comenzar a revisar tu viaje.</p>
        <strong id="quoteLeadId"></strong>
        <button class="btn btn-soft" type="button" data-quote-close>Cerrar</button>
      </section>`;

    const form = document.getElementById('travelQuoteForm');
    form.addEventListener('submit', submitForm);
    built = true;
  }

  function setDestination(destination=''){
    const clean = String(destination || '').trim();
    const input = qs('[name="destino"]', modal());
    const selected = document.getElementById('quoteSelectedDestination');
    const title = document.getElementById('quoteModalTitle');
    const copy = document.getElementById('quoteModalCopy');

    if(input){
      input.value = clean;
      input.readOnly = !!clean;
      input.classList.toggle('is-context-locked', !!clean);
      input.setAttribute('aria-readonly', clean ? 'true' : 'false');
      input.title = clean ? 'Destino seleccionado desde esta ficha' : '';
    }
    if(selected){
      selected.hidden = !clean;
      selected.textContent = clean ? `Destino seleccionado: ${clean}` : '';
    }
    if(title) title.textContent = clean ? `Tu viaje a ${clean}` : 'Solicita tu viaje a tu medida';
    if(copy) copy.textContent = clean
      ? 'Ya sabemos a dónde quieres ir. Cuéntanos fechas, viajeros y lo esencial para empezar.'
      : 'Cuéntanos lo esencial. Nosotros te ayudamos a convertirlo en un viaje real.';
  }

  function resetState(){
    const form = document.getElementById('travelQuoteForm');
    const success = document.getElementById('quoteSuccess');
    const status = document.getElementById('quoteFormStatus');
    if(form){
      form.hidden = false;
      form.reset();
      const people=qs('[name="personas"]',form); if(people)people.value='2';
      const rec=qs('[name="hospedaje"][value="Recomiéndame"]',form); if(rec)rec.checked=true;
      const destination=qs('[name="destino"]',form);
      if(destination){
        destination.readOnly=false;
        destination.classList.remove('is-context-locked');
        destination.setAttribute('aria-readonly','false');
        destination.title='';
      }
    }
    if(success) success.hidden = true;
    if(status){ status.textContent=''; status.className='native-form-status'; }
  }

  function openQuote(destination='', trigger=null){
    buildForm();
    const root = modal();
    if(!root) return;
    lastTrigger = trigger || document.activeElement;
    resetState();
    setDestination(destination);
    root.hidden = false;
    root.setAttribute('aria-hidden','false');
    document.body.classList.add('quote-modal-open');
    requestAnimationFrame(()=>{
      const first = qs('[name="nombre"]', root);
      if(first) first.focus();
    });
  }

  function closeQuote(){
    const root = modal();
    if(!root) return;
    root.hidden = true;
    root.setAttribute('aria-hidden','true');
    document.body.classList.remove('quote-modal-open');
    if(lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
  }

  function inferOrigin(trigger){
    if(!trigger) return 'web';
    if(trigger.closest('.destination-card')) return 'tarjeta_destino';
    if(trigger.closest('.detail-conversion')) return 'ficha_destino';
    if(trigger.closest('.hero-actions')) return 'hero';
    if(trigger.closest('.quote-cta-section')) return 'cta_final';
    if(trigger.closest('.nav')) return 'menu';
    if(trigger.closest('#fuentes')) return 'fuentes';
    return 'web';
  }

  function buildPayload(form){
    const params = new URLSearchParams(window.location.search);
    const destination = String(form.elements.destino.value || '').trim();
    return {
      nombre: String(form.elements.nombre.value || '').trim(),
      apellido: String(form.elements.apellido.value || '').trim(),
      whatsapp: String(form.elements.whatsapp.value || '').trim(),
      destino: destination,
      ciudadSalida: String(form.elements.ciudadSalida.value || '').trim(),
      fechaSalida: String(form.elements.fechaSalida.value || '').trim(),
      fechaRegreso: String(form.elements.fechaRegreso.value || '').trim(),
      personas: String(form.elements.personas.value || '').trim(),
      hospedaje: String((qs('[name="hospedaje"]:checked', form) || {}).value || ''),
      consentimiento: !!form.elements.consentimiento.checked,
      website: String(form.elements.website.value || '').trim(),
      origen: inferOrigin(lastTrigger),
      urlOrigen: window.location.href,
      slugDestino: slugify(destination),
      utmSource: params.get('utm_source') || '',
      utmMedium: params.get('utm_medium') || '',
      utmCampaign: params.get('utm_campaign') || ''
    };
  }

  function validateDates(form){
    const out = form.elements.fechaSalida.value;
    const back = form.elements.fechaRegreso.value;
    if(out && back && back < out){
      form.elements.fechaRegreso.setCustomValidity('La fecha de regreso no puede ser anterior a la salida.');
      form.elements.fechaRegreso.reportValidity();
      return false;
    }
    form.elements.fechaRegreso.setCustomValidity('');
    return true;
  }

  function whatsappFallback(payload){
    const text = [
      'Hola, quiero solicitar un viaje con Trhoncal Travel.',
      `Destino: ${payload.destino}`,
      `Salida desde: ${payload.ciudadSalida}`,
      `Fecha salida: ${payload.fechaSalida}`,
      payload.fechaRegreso ? `Fecha regreso: ${payload.fechaRegreso}` : '',
      `Viajeros: ${payload.personas}`,
      `Hospedaje: ${payload.hospedaje}`,
      `Nombre: ${payload.nombre} ${payload.apellido}`.trim()
    ].filter(Boolean).join('\n');
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }

  async function submitForm(event){
    event.preventDefault();
    const form = event.currentTarget;
    const status = document.getElementById('quoteFormStatus');
    const button = document.getElementById('quoteSubmitButton');

    if(!form.reportValidity() || !validateDates(form)) return;
    const payload = buildPayload(form);

    button.disabled = true;
    button.textContent = 'Enviando…';
    status.textContent = 'Registrando tu solicitud…';
    status.className = 'native-form-status is-working';

    try{
      const response = await fetch(LEAD_ENDPOINT, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload)
      });
      const result = await response.json().catch(()=>({}));
      if(!response.ok || result.ok !== true) throw new Error(result.error || 'No pudimos registrar la solicitud.');

      form.hidden = true;
      const success = document.getElementById('quoteSuccess');
      const id = document.getElementById('quoteLeadId');
      if(id) id.textContent = result.leadId && result.leadId !== 'IGNORED' ? `Folio ${result.leadId}` : '';
      if(success) success.hidden = false;
    }catch(error){
      const wa = whatsappFallback(payload);
      status.className = 'native-form-status is-error';
      status.innerHTML = `No pudimos registrar automáticamente tu solicitud. <a href="${wa}" target="_blank" rel="noopener noreferrer">Envíala por WhatsApp →</a>`;
    }finally{
      button.disabled = false;
      button.textContent = 'Solicitar mi viaje →';
    }
  }

  function rewireNavigation(){
    const destination = inferPageDestination();
    qsa('.nav a').forEach(link=>{
      const href = link.getAttribute('href') || '';
      if(href.endsWith('#cotizar')){
        link.textContent = destination ? 'Solicita este viaje' : 'Solicita tu viaje';
        link.setAttribute('href','#cotizar');
        link.setAttribute('data-quote-launch','');
        if(destination) link.dataset.destination = destination;
        link.classList.add('nav-quote');
      }
    });
    qsa('.hero-actions [data-quote-launch]').forEach(link=>link.textContent='Solicita tu viaje');
  }

  document.addEventListener('DOMContentLoaded',()=>{
    buildForm();
    rewireNavigation();
  });

  document.addEventListener('click',event=>{
    const trigger = event.target.closest('[data-quote-launch],.quote-link');
    if(trigger){
      event.preventDefault();
      openQuote(trigger.dataset.destination || inferPageDestination() || '', trigger);
      return;
    }
    if(event.target.closest('[data-quote-close]')){
      event.preventDefault();
      closeQuote();
    }
  });

  document.addEventListener('keydown',event=>{
    if(event.key==='Escape' && modal() && !modal().hidden) closeQuote();
  });
})();
