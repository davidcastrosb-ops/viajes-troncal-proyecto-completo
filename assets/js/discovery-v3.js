(()=>{
  const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let autoplayTimer=null;
  let userPaused=false;
  let hoverPaused=false;
  let focusPaused=false;
  let lastInteraction=0;

  const qs=id=>document.getElementById(id);
  const track=()=>qs('destinationMoreGrid');
  const section=()=>qs('destinationMoreSection');
  const cards=()=>Array.from(track()?.querySelectorAll('.destination-card')||[]);

  function currentIndex(){
    const t=track();const list=cards();if(!t||!list.length)return 0;
    const left=t.scrollLeft;
    let best=0;let distance=Infinity;
    list.forEach((card,i)=>{
      const d=Math.abs(card.offsetLeft-left);
      if(d<distance){distance=d;best=i;}
    });
    return best;
  }

  function updateStatus(){
    const status=qs('destinationCarouselStatus');
    const count=cards().length;
    if(status)status.textContent=count?`${currentIndex()+1} de ${count}`:'0 de 0';
  }

  function markInteraction(ms=12000){lastInteraction=Date.now()+ms;}

  function scrollToIndex(index,{manual=false}={}){
    const t=track();const list=cards();if(!t||!list.length)return;
    const safe=((index%list.length)+list.length)%list.length;
    if(manual)markInteraction();
    t.scrollTo({left:list[safe].offsetLeft,behavior:reducedMotion?'auto':'smooth'});
    setTimeout(updateStatus,reducedMotion?0:380);
  }

  function next(manual=false){scrollToIndex(currentIndex()+1,{manual});}
  function prev(manual=false){scrollToIndex(currentIndex()-1,{manual});}

  function canAutoplay(){
    const s=section();
    return !reducedMotion&&!userPaused&&!hoverPaused&&!focusPaused&&Date.now()>lastInteraction&&!s?.classList.contains('is-expanded')&&cards().length>1;
  }

  function startAutoplay(){clearInterval(autoplayTimer);autoplayTimer=setInterval(()=>{if(canAutoplay())next(false);},5500);}

  function syncPauseButton(){
    const btn=qs('destinationCarouselPause');if(!btn)return;
    btn.textContent=userPaused?'Reanudar movimiento':'Pausar movimiento';
    btn.setAttribute('aria-pressed',String(userPaused));
  }

  function toggleExpanded(){
    const s=section();const btn=qs('destinationCarouselViewAll');if(!s||!btn)return;
    const expanded=s.classList.toggle('is-expanded');
    btn.textContent=expanded?'Volver al carrusel':'Ver todos';
    btn.setAttribute('aria-expanded',String(expanded));
    if(!expanded)setTimeout(()=>scrollToIndex(0),30);
  }

  function rewritePreviewDestinationLinks(root=document){
    if(!location.hostname.endsWith('.vercel.app'))return;
    root.querySelectorAll?.('a.detail-link[href^="/mexico/"]').forEach(a=>{
      const current=a.getAttribute('href')||'';
      a.setAttribute('href',current.replace(/^\/mexico\//,'/destino-v2/'));
      a.textContent='Ver viajes y destino →';
      a.setAttribute('aria-label',(a.getAttribute('aria-label')||'').replace('Ver ficha completa','Ver viajes y destino'));
    });
  }

  function bind(){
    const t=track();const s=section();if(!t||!s)return;
    if(t.dataset.carouselReady==='1')return;
    t.dataset.carouselReady='1';

    qs('destinationCarouselNext')?.addEventListener('click',()=>next(true));
    qs('destinationCarouselPrev')?.addEventListener('click',()=>prev(true));
    qs('destinationCarouselViewAll')?.addEventListener('click',toggleExpanded);
    qs('destinationCarouselPause')?.addEventListener('click',()=>{userPaused=!userPaused;syncPauseButton();});

    t.addEventListener('scroll',()=>window.requestAnimationFrame(updateStatus),{passive:true});
    t.addEventListener('pointerdown',()=>markInteraction(15000),{passive:true});
    t.addEventListener('touchstart',()=>markInteraction(15000),{passive:true});
    t.addEventListener('mouseenter',()=>{hoverPaused=true;});
    t.addEventListener('mouseleave',()=>{hoverPaused=false;});
    t.addEventListener('focusin',()=>{focusPaused=true;});
    t.addEventListener('focusout',()=>{focusPaused=false;});

    const observer=new MutationObserver(()=>{
      updateStatus();rewritePreviewDestinationLinks(document);
      const count=cards().length;
      ['destinationCarouselPrev','destinationCarouselNext','destinationCarouselPause','destinationCarouselViewAll'].forEach(id=>{const el=qs(id);if(el)el.hidden=count<2;});
    });
    observer.observe(t,{childList:true,subtree:false});

    updateStatus();syncPauseButton();startAutoplay();rewritePreviewDestinationLinks(document);
  }

  document.addEventListener('visibilitychange',()=>{if(document.hidden)hoverPaused=true;else hoverPaused=false;});
  document.addEventListener('DOMContentLoaded',()=>{
    bind();rewritePreviewDestinationLinks(document);
    if(location.hostname.endsWith('.vercel.app')){
      const routeObserver=new MutationObserver(()=>rewritePreviewDestinationLinks(document));
      routeObserver.observe(document.body,{childList:true,subtree:true});
    }
  });
})();
