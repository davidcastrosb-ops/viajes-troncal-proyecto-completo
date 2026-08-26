(() => {
  if (window.__trhoncalCalendarSourcesV1) return;
  window.__trhoncalCalendarSourcesV1 = true;

  function esc(value='') {
    return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function labelFor(source='') {
    const s=String(source).toLowerCase();
    if (s.includes('sep') || s.includes('educación')) return 'SEP';
    if (s.includes('lft') || s.includes('diputados')) return 'LFT';
    return 'Fuente oficial';
  }

  function todayISO(){
    const now=new Date();
    const y=now.getFullYear();
    const m=String(now.getMonth()+1).padStart(2,'0');
    const d=String(now.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
  }

  function guardPastDates(){
    const today=todayISO();
    document.querySelectorAll('[data-calendar-date]').forEach(button=>{
      const iso=String(button.dataset.calendarDate||'');
      const past=iso && iso<today;
      button.disabled=past;
      button.setAttribute('aria-disabled',past?'true':'false');
      if(past){
        button.style.opacity='.38';
        button.style.cursor='not-allowed';
        button.title='Esta fecha ya pasó';
      }
    });

    const monthLabel=String(document.getElementById('travelCalendarMonth')?.textContent||'').trim();
    const prev=document.querySelector('[data-calendar-prev]');
    if(prev && monthLabel){
      const current=new Intl.DateTimeFormat('es-MX',{month:'long',year:'numeric'}).format(new Date()).toLowerCase();
      const same=monthLabel.toLowerCase()===current;
      prev.disabled=same;
      prev.setAttribute('aria-disabled',same?'true':'false');
    }
  }

  async function syncSources() {
    const root=document.getElementById('travelCalendarSources');
    if(!root || !window.TrhoncalMasterData?.load) return;
    try {
      const master=await window.TrhoncalMasterData.load();
      const events=master?.calendar?.events||[];
      const seen=new Map();
      events.forEach(event=>{
        const url=String(event.sourceUrl||'').trim();
        if(!/^https?:\/\//i.test(url)) return;
        const label=labelFor(event.source||'');
        if(!seen.has(url)) seen.set(url,label);
      });
      if(!seen.size) return;
      root.innerHTML=`<span>Fuentes oficiales:</span> ${[...seen.entries()].map(([url,label])=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`).join(' · ')}`;
    } catch (_) {}
  }

  function sync(){
    guardPastDates();
    syncSources();
  }

  document.addEventListener('click',event=>{
    if(!event.target.closest('[data-calendar-open],[data-calendar-prev],[data-calendar-next],[data-calendar-quick]')) return;
    setTimeout(sync,120);
    setTimeout(sync,450);
  },true);

  const observer=new MutationObserver(()=>{
    if(document.getElementById('travelCalendarGrid')) guardPastDates();
  });
  document.addEventListener('DOMContentLoaded',()=>{
    observer.observe(document.body,{childList:true,subtree:true});
  });
})();
