import baseHandler from './hotel-v2.js';

function escAttr(value=''){
  return String(value).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

export default async function handler(req,res){
  const slug=String(req.query.slug||'').trim();
  const offer=String(req.query.oferta||'').trim();
  const quote=`/cotizar-v2/${encodeURIComponent(slug)}?${new URLSearchParams({oferta:offer,cta:'hotel_minisite_v2'}).toString()}`;
  const pdf=offer?`/oferta-v2/${encodeURIComponent(offer)}.pdf`:'';
  const originalSend=res.send.bind(res);
  res.send=(body)=>{
    if(typeof body==='string'&&body.includes('<!doctype html>')){
      let html=body;
      html=html.replace(/href="https:\/\/viajes\.trhoncalhomes\.com\.mx\/\?travelQuote=[^"]+"/g,`href="${escAttr(quote)}"`);
      if(offer&&pdf){
        const oldPdf=`/oferta/${offer}.pdf`;
        html=html.split(oldPdf).join(pdf);
      }
      html=html.replace('VISTA PREVIA · NUEVO MINI SITIO DE HOTEL · la ficha /oferta actual sigue intacta','VISTA PREVIA · MINI SITIO DE HOTEL V2 + FORMULARIO V2 · la ficha /oferta actual sigue intacta');
      return originalSend(html);
    }
    return originalSend(body);
  };
  return baseHandler(req,res);
}
