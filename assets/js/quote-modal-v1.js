(() => {
  const LEAD_ENDPOINT = '/api/lead';
  const WHATSAPP_NUMBER = '523329335952';
  const CALENDAR_URL = '/assets/data/mexico-calendar.json';
  let lastTrigger = null;
  let built = false;
  const calendarState = { data:null, loading:null, month:null, target:'fechaSalida' };

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

  function dateFromISO(iso=''){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(String(iso))) return null;
    const [y,m,d]=String(iso).split('-').map(Number);
    return new Date(y,m-1,d,12,0,0,0);
  }

  function isoFromDate(date){
    if(!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
    const y=date.getFullYear();
    const m=String(date.getMonth()+1).padStart(2,'0');
    const d=String(date.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
  }

  function formatDate(iso=''){
    const date=dateFromISO(iso);
    if(!date) return 'Elegir fecha';
    return new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'short',year:'numeric'}).format(date).replace('.','');
  }

  function formatRange(start,end){
    if(!start) return '';
    if(!end || end===start) return formatDate(start);
    const a=dateFromISO(start), b=dateFromISO(end);
    if(!a||!b) return '';
    const sameYear=a.getFullYear()===b.getFullYear();
    const sameMonth=sameYear&&a.getMonth()===b.getMonth();
    if(sameMonth){
      const month=new Intl.DateTimeFormat('es-MX',{month:'short'}).format(a).replace('.','');
      return `${a.getDate()}–${b.getDate()} ${month} ${a.getFullYear()}`;
    }
    return `${formatDate(start)} – ${formatDate(end)}`;
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
          <div class="native-field native-date-field">
            <span>Fecha aproximada de salida <b>*</b></span>
            <button class="native-date-trigger" type="button" data-calendar-open="fechaSalida"><span data-date-display="fechaSalida">Elegir fecha</span><i>▾</i></button>
            <input name="fechaSalida" type="hidden">
          </div>
          <div class="native-field native-date-field">
            <span>Fecha aproximada de regreso</span>
            <button class="native-date-trigger" type="button" data-calendar-open="fechaRegreso"><span data-date-display="fechaRegreso">Elegir fecha</span><i>▾</i></button>
            <input name="fechaRegreso" type="hidden">
          </div>
          <label class="native-field">
            <span>Número de viajeros <b>*</b></span>
            <input name="personas" type="number" inputmode="numeric" min="1" max="99" value="2" required>
          </label>
        </div>

        <div class="travel-calendar-nudge">
          <div><b>¿Aún no sabes cuándo viajar?</b><span>Consulta puentes, vacaciones escolares y días sin clases en México sin salir de Trhoncal Travel.</span></div>
          <button type="button" data-calendar-open="fechaSalida" data-calendar-browse>Ver puentes y vacaciones →</button>
        </div>

        <section id="travelCalendarPanel" class="travel-calendar-panel" hidden aria-label="Calendario para elegir fechas">
          <div class="travel-calendar-topline">
            <div><span class="eyebrow">Calendario México</span><strong id="travelCalendarPrompt">Elige tu fecha de salida</strong></div>
            <button type="button" class="travel-calendar-close" data-calendar-close aria-label="Cerrar calendario">×</button>
          </div>
          <div id="travelQuickDates" class="travel-quick-dates"></div>
          <div class="travel-calendar-nav"><button type="button" data-calendar-prev aria-label="Mes anterior">←</button><strong id="travelCalendarMonth"></strong><button type="button" data-calendar-next aria-label="Mes siguiente">→</button></div>
          <div class="travel-calendar-weekdays" aria-hidden="true"><span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span></div>
          <div id="travelCalendarGrid" class="travel-calendar-grid"></div>
          <div class="travel-calendar-legend"><span class="legend-holiday">Descanso obligatorio</span><span class="legend-vacation">Vacaciones SEP</span><span class="legend-school">Día sin clases SEP</span></div>
          <p class="travel-calendar-help">Los días sin clases SEP no significan necesariamente descanso laboral para los adultos. Las ventanas de escapada marcadas como sugeridas son una recomendación de Trhoncal Travel basada en las fechas oficiales.</p>
          <div id="travelCalendarSources" class="travel-calendar-sources"></div>
        </section>

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
          <span><b>Autorizo el contacto.</b> Acepto que Trhoncal Travel me contacte para dar seguimiento a esta solicitud.</span>
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
    loadCalendar().catch(()=>{});
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

  function setDateField(name, iso=''){
    const form=document.getElementById('travelQuoteForm');
    if(!form || !form.elements[name]) return;
    form.elements[name].value=iso;
    const display=qs(`[data-date-display="${name}"]`, form);
    const trigger=qs(`[data-calendar-open="${name}"]`, form);
    if(display) display.textContent=iso ? formatDate(iso) : 'Elegir fecha';
    if(trigger){
      trigger.classList.toggle('has-value', !!iso);
      trigger.classList.remove('is-error');
    }
    if(name==='fechaSalida'){
      const back=form.elements.fechaRegreso.value;
      if(back && iso && back<iso) setDateField('fechaRegreso','');
    }
  }

  function resetState(){
    const form = document.getElementById('travelQuoteForm');
    const success = document.getElementById('quoteSuccess');
    const status = document.getElementById('quoteFormStatus');
    const calendar=document.getElementById('travelCalendarPanel');
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
      setDateField('fechaSalida','');
      setDateField('fechaRegreso','');
    }
    if(calendar) calendar.hidden=true;
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

  async function loadCalendar(){
    if(calendarState.data) return calendarState.data;
    if(calendarState.loading) return calendarState.loading;
    calendarState.loading=fetch(CALENDAR_URL,{cache:'no-store'})
      .then(r=>{ if(!r.ok) throw new Error('calendar'); return r.json(); })
      .then(data=>{
        calendarState.data=data&&Array.isArray(data.events)?data:{events:[],sources:[]};
        return calendarState.data;
      })
      .finally(()=>{calendarState.loading=null;});
    return calendarState.loading;
  }

  function monthStartFromTarget(target){
    const form=document.getElementById('travelQuoteForm');
    const selected=form&&form.elements[target]?form.elements[target].value:'';
    const date=dateFromISO(selected)||new Date();
    return new Date(date.getFullYear(),date.getMonth(),1,12,0,0,0);
  }

  async function openCalendar(target='fechaSalida'){
    const panel=document.getElementById('travelCalendarPanel');
    if(!panel) return;
    calendarState.target=target==='fechaRegreso'?'fechaRegreso':'fechaSalida';
    calendarState.month=monthStartFromTarget(calendarState.target);
    panel.hidden=false;
    const prompt=document.getElementById('travelCalendarPrompt');
    if(prompt) prompt.textContent=calendarState.target==='fechaRegreso'?'Elige tu fecha de regreso':'Elige tu fecha de salida';
    renderCalendarLoading();
    try{ await loadCalendar(); renderCalendar(); }
    catch(_){ renderCalendarError(); }
    panel.scrollIntoView({behavior:'smooth',block:'nearest'});
  }

  function closeCalendar(){
    const panel=document.getElementById('travelCalendarPanel');
    if(panel) panel.hidden=true;
  }

  function renderCalendarLoading(){
    const grid=document.getElementById('travelCalendarGrid');
    if(grid) grid.innerHTML='<p class="travel-calendar-loading">Cargando fechas oficiales…</p>';
  }

  function renderCalendarError(){
    const grid=document.getElementById('travelCalendarGrid');
    if(grid) grid.innerHTML='<p class="travel-calendar-loading">No pudimos cargar las fechas especiales. Puedes elegir una fecha manualmente más tarde.</p>';
  }

  function eventIncludes(event,iso){
    if(!event||!event.start) return false;
    const end=event.end||event.start;
    return iso>=event.start&&iso<=end;
  }

  function eventsForDate(iso){
    const events=(calendarState.data&&calendarState.data.events)||[];
    return events.filter(event=>eventIncludes(event,iso));
  }

  function renderQuickDates(){
    const root=document.getElementById('travelQuickDates');
    if(!root) return;
    const today=isoFromDate(new Date());
    const quick=((calendarState.data&&calendarState.data.events)||[])
      .filter(e=>e.quick&&e.suggestedStart&&e.suggestedEnd&&e.suggestedEnd>=today)
      .sort((a,b)=>a.suggestedStart.localeCompare(b.suggestedStart))
      .slice(0,5);
    if(!quick.length){root.innerHTML='';return;}
    root.innerHTML=`<div class="travel-quick-head"><b>Próximas oportunidades para escaparte</b><span>Toca una opción y llenamos salida y regreso.</span></div><div class="travel-quick-list">${quick.map(event=>`<button type="button" data-calendar-quick="${event.id}"><span>${event.type==='vacaciones_escolares'?'Vacaciones escolares':'Escapada sugerida'}</span><strong>${event.name}</strong><small>${formatRange(event.suggestedStart,event.suggestedEnd)}</small></button>`).join('')}</div>`;
  }

  function renderSources(){
    const root=document.getElementById('travelCalendarSources');
    if(!root) return;
    const sources=(calendarState.data&&calendarState.data.sources)||[];
    root.innerHTML=sources.length?`<span>Fuentes oficiales:</span> ${sources.map(s=>`<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.name.includes('Educación')?'SEP':'LFT'}</a>`).join(' · ')}`:'';
  }

  function renderCalendar(){
    const data=calendarState.data||{events:[]};
    const month=calendarState.month||new Date();
    const monthLabel=document.getElementById('travelCalendarMonth');
    const grid=document.getElementById('travelCalendarGrid');
    if(!grid) return;
    if(monthLabel) monthLabel.textContent=new Intl.DateTimeFormat('es-MX',{month:'long',year:'numeric'}).format(month);

    const first=new Date(month.getFullYear(),month.getMonth(),1,12,0,0,0);
    const offset=(first.getDay()+6)%7;
    const days=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
    const form=document.getElementById('travelQuoteForm');
    const out=form?form.elements.fechaSalida.value:'';
    const back=form?form.elements.fechaRegreso.value:'';
    let html='';
    for(let i=0;i<offset;i++) html+='<span class="travel-calendar-empty"></span>';
    for(let day=1;day<=days;day++){
      const date=new Date(month.getFullYear(),month.getMonth(),day,12,0,0,0);
      const iso=isoFromDate(date);
      const events=eventsForDate(iso);
      const types=new Set(events.map(e=>e.type));
      const classes=['travel-calendar-day'];
      if(types.has('descanso_obligatorio'))classes.push('is-holiday');
      if(types.has('vacaciones_escolares'))classes.push('is-vacation');
      if(types.has('dia_sin_clases'))classes.push('is-school');
      if(types.has('receso_escolar'))classes.push('is-recess');
      if(iso===out)classes.push('is-departure');
      if(iso===back)classes.push('is-return');
      const eventNames=events.map(e=>e.name).join('. ');
      const aria=eventNames?`${formatDate(iso)}. ${eventNames}`:formatDate(iso);
      html+=`<button type="button" class="${classes.join(' ')}" data-calendar-date="${iso}" aria-label="${aria.replace(/"/g,'&quot;')}" title="${eventNames.replace(/"/g,'&quot;')}"><span>${day}</span>${events.length?'<i></i>':''}</button>`;
    }
    grid.innerHTML=html;
    renderQuickDates();
    renderSources();
  }

  function moveCalendarMonth(delta){
    const month=calendarState.month||new Date();
    calendarState.month=new Date(month.getFullYear(),month.getMonth()+delta,1,12,0,0,0);
    renderCalendar();
  }

  function chooseCalendarDate(iso){
    setDateField(calendarState.target,iso);
    closeCalendar();
  }

  function chooseQuickDate(id){
    const event=((calendarState.data&&calendarState.data.events)||[]).find(e=>e.id===id);
    if(!event||!event.suggestedStart||!event.suggestedEnd) return;
    setDateField('fechaSalida',event.suggestedStart);
    setDateField('fechaRegreso',event.suggestedEnd);
    closeCalendar();
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

  function validateDates(form,status){
    const out=String(form.elements.fechaSalida.value||'');
    const back=String(form.elements.fechaRegreso.value||'');
    qsa('.native-date-trigger',form).forEach(el=>el.classList.remove('is-error'));
    if(!out){
      const trigger=qs('[data-calendar-open="fechaSalida"]',form);
      if(trigger)trigger.classList.add('is-error');
      if(status){status.textContent='Elige una fecha aproximada de salida.';status.className='native-form-status is-error';}
      openCalendar('fechaSalida');
      return false;
    }
    if(back&&back<out){
      const trigger=qs('[data-calendar-open="fechaRegreso"]',form);
      if(trigger)trigger.classList.add('is-error');
      if(status){status.textContent='La fecha de regreso no puede ser anterior a la salida.';status.className='native-form-status is-error';}
      openCalendar('fechaRegreso');
      return false;
    }
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

    if(!form.reportValidity() || !validateDates(form,status)) return;
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
    const calendarOpen=event.target.closest('[data-calendar-open]');
    if(calendarOpen){
      event.preventDefault();
      openCalendar(calendarOpen.dataset.calendarOpen||'fechaSalida');
      return;
    }
    if(event.target.closest('[data-calendar-close]')){
      event.preventDefault();
      closeCalendar();
      return;
    }
    if(event.target.closest('[data-calendar-prev]')){
      event.preventDefault();moveCalendarMonth(-1);return;
    }
    if(event.target.closest('[data-calendar-next]')){
      event.preventDefault();moveCalendarMonth(1);return;
    }
    const quick=event.target.closest('[data-calendar-quick]');
    if(quick){event.preventDefault();chooseQuickDate(quick.dataset.calendarQuick);return;}
    const day=event.target.closest('[data-calendar-date]');
    if(day){event.preventDefault();chooseCalendarDate(day.dataset.calendarDate);return;}

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
    if(event.key==='Escape'){
      const calendar=document.getElementById('travelCalendarPanel');
      if(calendar&&!calendar.hidden){closeCalendar();return;}
      if(modal()&&!modal().hidden) closeQuote();
    }
  });
})();
