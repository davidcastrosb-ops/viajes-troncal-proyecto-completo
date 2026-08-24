(()=>{
  let publicHost='';

  function ensureCanonical(){
    let link=document.querySelector('link[rel="canonical"]');
    if(!link){
      link=document.createElement('link');
      link.setAttribute('rel','canonical');
      document.head.appendChild(link);
    }
    return link;
  }

  function ensureOgUrl(){
    let meta=document.querySelector('meta[property="og:url"]');
    if(!meta){
      meta=document.createElement('meta');
      meta.setAttribute('property','og:url');
      document.head.appendChild(meta);
    }
    return meta;
  }

  function normalizedPath(){
    const path=location.pathname||'/';
    return path.length>1?path.replace(/\/+$/,''):path;
  }

  function sync(){
    if(!publicHost)return;
    const currentHost=String(location.hostname||'').toLowerCase();
    const canonical=document.querySelector('link[rel="canonical"]');
    const ogUrl=document.querySelector('meta[property="og:url"]');

    if(currentHost!==publicHost){
      if(canonical)canonical.remove();
      if(ogUrl)ogUrl.removeAttribute('content');
      return;
    }

    const url=`https://${publicHost}${normalizedPath()}`;
    ensureCanonical().setAttribute('href',url);
    ensureOgUrl().setAttribute('content',url);
  }

  function patchHistory(){
    ['pushState','replaceState'].forEach(name=>{
      const original=history[name];
      if(typeof original!=='function')return;
      history[name]=function(...args){
        const result=original.apply(this,args);
        queueMicrotask(sync);
        return result;
      };
    });
    window.addEventListener('popstate',sync);
  }

  async function init(){
    try{
      const response=await fetch('/assets/data/site.json',{cache:'no-store'});
      if(!response.ok)return;
      const config=await response.json();
      publicHost=String(config.hosting?.initialHost||'').toLowerCase();
      if(!publicHost)return;
      patchHistory();
      sync();
    }catch(error){
      console.warn('SEO host controller no disponible.',error);
    }
  }

  document.addEventListener('DOMContentLoaded',init);
})();
