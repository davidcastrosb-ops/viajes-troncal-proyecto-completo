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

  document.addEventListener('click',event=>{
    if(!event.target.closest('[data-calendar-open],[data-calendar-prev],[data-calendar-next],[data-calendar-quick]')) return;
    setTimeout(syncSources,120);
    setTimeout(syncSources,450);
  },true);
})();
