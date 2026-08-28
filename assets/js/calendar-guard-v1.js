(() => {
  if (window.__trhoncalCalendarGuardV1) return;
  window.__trhoncalCalendarGuardV1 = true;

  function todayISO(){
    const d=new Date();
    const y=d.getFullYear();
    const m=String(d.getMonth()+1).padStart(2,'0');
    const day=String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }

  function decorate(){
    const today=todayISO();
    document.querySelectorAll('.travel-calendar-day[data-calendar-date]').forEach(btn=>{
      const past=String(btn.dataset.calendarDate||'') < today;
      btn.classList.toggle('is-past',past);
      if(past){
        btn.disabled=true;
        btn.setAttribute('aria-disabled','true');
        btn.title='Esta fecha ya pasó';
      }else{
        btn.disabled=false;
        btn.removeAttribute('aria-disabled');
      }
    });
  }

  function ensureStyle(){
    if(document.getElementById('trhoncal-calendar-guard-style')) return;
    const style=document.createElement('style');
    style.id='trhoncal-calendar-guard-style';
    style.textContent='.travel-calendar-day.is-past{opacity:.35;cursor:not-allowed;filter:grayscale(.5)}.travel-calendar-day.is-past:hover{border-color:transparent;background:#fff}';
    document.head.appendChild(style);
  }

  function observeGrid(){
    const grid=document.getElementById('travelCalendarGrid');
    if(!grid || grid.dataset.pastGuardReady==='1') return;
    grid.dataset.pastGuardReady='1';
    new MutationObserver(decorate).observe(grid,{childList:true});
    decorate();
  }

  document.addEventListener('click',event=>{
    if(event.target.closest('[data-calendar-open],[data-calendar-prev],[data-calendar-next],[data-calendar-quick]')){
      setTimeout(observeGrid,30);
      setTimeout(decorate,100);
    }
  },true);

  ensureStyle();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',observeGrid);
  else observeGrid();
})();
