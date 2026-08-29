import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as QRCode from 'qrcode';

const PUBLIC_HOST = 'viajes.trhoncalhomes.com.mx';
const MASTER_ENDPOINT = process.env.TRHONCAL_MASTER_ENDPOINT ||
  'https://script.google.com/macros/s/AKfycbxq6OxUnMWH004OKyspo7eAbI0GvJvwwDgSnfffSzn9amtKzOWqaDmtWUnrk52rz7U8/exec';

const FALLBACK_HOTEL_ID = {
  'OF-PA-PVR-REV26-001': 'HOT-PVR-FRIENDLY-001',
  'OF-PA-PVR-SEP26-002': 'HOT-PVR-BARCELO-001',
  'OF-PA-NAY-REV26-003': 'HOT-NAY-DECAMERON-001'
};

function clean(v=''){return String(v==null?'':v).replace(/[–—]/g,'-').replace(/[•·]/g,'-').replace(/[“”]/g,'"').replace(/[‘’]/g,"'").replace(/→|↗/g,'').replace(/\s+/g,' ').trim();}
function money(v){const n=Number(String(v??'').replace(/[^0-9.-]/g,''));return Number.isFinite(n)?new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(n):clean(v);}
function dateMx(v=''){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(v)))return clean(v);return new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'long',year:'numeric'}).format(new Date(`${v}T12:00:00`));}
function safe(v=''){try{const u=new URL(String(v));return /^https?:$/.test(u.protocol)?u.toString():'';}catch(_){return '';}}
async function master(){const sep=MASTER_ENDPOINT.includes('?')?'&':'?';const c=new AbortController();const t=setTimeout(()=>c.abort(),10000);try{const r=await fetch(`${MASTER_ENDPOINT}${sep}_ts=${Date.now()}`,{cache:'no-store',redirect:'follow',signal:c.signal,headers:{'User-Agent':'TrhoncalTravel-OfferPDFV2/1.0'}});if(!r.ok)throw new Error(`Master ${r.status}`);return await r.json();}finally{clearTimeout(t);}}
function wrap(text,font,size,maxWidth){const words=clean(text).split(' ').filter(Boolean),lines=[];let line='';for(const w of words){const test=line?`${line} ${w}`:w;if(font.widthOfTextAtSize(test,size)<=maxWidth)line=test;else{if(line)lines.push(line);line=w;}}if(line)lines.push(line);return lines;}
function drawWrapped(page,text,{x,y,font,size,maxWidth,color,lineHeight=size*1.28,maxLines=20}){const lines=wrap(text,font,size,maxWidth).slice(0,maxLines);lines.forEach((line,i)=>page.drawText(line,{x,y:y-i*lineHeight,font,size,color}));return y-lines.length*lineHeight;}
async function embedImage(pdf,url){if(!url)return null;try{const r=await fetch(url,{redirect:'follow'});if(!r.ok)return null;const type=String(r.headers.get('content-type')||'').toLowerCase();const bytes=new Uint8Array(await r.arrayBuffer());if(type.includes('png'))return await pdf.embedPng(bytes);if(type.includes('jpeg')||type.includes('jpg'))return await pdf.embedJpg(bytes);return null;}catch(_){return null;}}
function cover(page,img,x,y,w,h){const scale=Math.max(w/img.width,h/img.height),dw=img.width*scale,dh=img.height*scale;page.drawImage(img,{x:x+(w-dw)/2,y:y+(h-dh)/2,width:dw,height:dh});}

export default async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).send('Method not allowed');}
  const id=String(req.query.id||'').trim();if(!id||!/^[A-Za-z0-9_-]+$/.test(id))return res.status(404).send('Oferta no disponible');
  let payload;try{payload=await master();}catch(_){return res.status(503).send('No pudimos generar el PDF V2.');}
  const offers=Array.isArray(payload.offers)?payload.offers:[],destinations=Array.isArray(payload.destinations)?payload.destinations:[],hotels=Array.isArray(payload.hotels)?payload.hotels:[],hotelImages=Array.isArray(payload.hotelImages)?payload.hotelImages:[];
  const offer=offers.find(x=>x&&x.id===id);if(!offer)return res.status(404).send('Oferta no disponible');
  const destination=destinations.find(d=>d&&d.id===offer.destinationId)||null;
  const hotelId=offer.hotelId||FALLBACK_HOTEL_ID[offer.id]||'';
  const hotelProfile=hotels.find(h=>h&&h.id===hotelId)||null;
  const approved=hotelImages.filter(img=>img&&img.hotelId===hotelId&&safe(img.url)).sort((a,b)=>(a.order||999)-(b.order||999)).map(x=>x.url);
  const gallery=[];[offer.image,...approved].forEach(u=>{const s=safe(u);if(s&&!gallery.includes(s))gallery.push(s);});

  const destinationName=clean(destination?.name||offer.leadDestinationVerified||'Viaje especial');
  const title=clean(offer.title||destinationName),hotel=clean(offer.hotel||hotelProfile?.name||''),price=money(offer.price);
  const dates=[offer.travelStart?dateMx(offer.travelStart):'',offer.travelEnd?dateMx(offer.travelEnd):''].filter(Boolean).join(' - ');
  const duration=[offer.days?`${offer.days} días`:'',offer.nights?`${offer.nights} noches`:''].filter(Boolean).join(' / ');
  const includes=Array.isArray(offer.includes)?offer.includes.map(clean).filter(Boolean):[];
  const canonical=`https://${PUBLIC_HOST}/oferta/${encodeURIComponent(offer.id)}`;

  const pdf=await PDFDocument.create();pdf.setTitle(`${title} | Trhoncal Travel`);pdf.setAuthor('Trhoncal Travel');pdf.setSubject('Mini folleto compartible de promoción de viaje');
  const regular=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold);
  const navy=rgb(.024,.247,.325),navyDark=rgb(.012,.18,.243),gold=rgb(.847,.686,.345),cream=rgb(.969,.957,.925),gray=rgb(.36,.43,.46),white=rgb(1,1,1);
  const W=595.28,H=841.89;

  const p1=pdf.addPage([W,H]);p1.drawRectangle({x:0,y:0,width:W,height:H,color:cream});p1.drawRectangle({x:0,y:H-92,width:W,height:92,color:navy});
  p1.drawText('TRHONCAL',{x:42,y:H-50,font:bold,size:23,color:white});p1.drawText('TRAVEL',{x:43,y:H-68,font:bold,size:10,color:gold});p1.drawText('Una opción para compartir',{x:385,y:H-55,font:regular,size:10,color:white});
  let y=H-126;const hero=await embedImage(pdf,gallery[0]||'');if(hero){cover(p1,hero,42,y-205,W-84,205);p1.drawRectangle({x:42,y:y-205,width:W-84,height:205,borderColor:rgb(.86,.82,.72),borderWidth:1});y-=229;}
  y=drawWrapped(p1,title,{x:42,y,font:bold,size:23,maxWidth:W-84,color:navyDark,lineHeight:27,maxLines:3})-8;
  if(hotel){p1.drawText(`Hotel: ${hotel}`,{x:42,y,font:bold,size:12,color:navy});y-=19;}p1.drawText(destinationName,{x:42,y,font:bold,size:11,color:gold});y-=24;
  const meta=[dates,duration,clean(offer.plan),clean(offer.occupancy)].filter(Boolean).join('  |  ');if(meta)y=drawWrapped(p1,meta,{x:42,y,font:regular,size:10.5,maxWidth:W-84,color:gray,lineHeight:14,maxLines:3})-8;
  if(price){p1.drawText('PRECIO PUBLICADO',{x:42,y,font:bold,size:9,color:gold});p1.drawText(price,{x:42,y:y-30,font:bold,size:28,color:navy});p1.drawText('MXN',{x:170,y:y-25,font:bold,size:10,color:navy});y-=52;}
  drawWrapped(p1,clean(offer.note||'Precio, disponibilidad y condiciones se reconfirman antes de reservar.'),{x:42,y,font:regular,size:9.5,maxWidth:W-84,color:gray,lineHeight:14,maxLines:5});
  p1.drawText('Trhoncal Travel · WhatsApp 33 2933 5952 · viajestroncal@gmail.com',{x:42,y:28,font:regular,size:8.4,color:gray});

  const embedded=[];for(const url of gallery.slice(0,7)){const img=await embedImage(pdf,url);if(img)embedded.push(img);}
  if(embedded.length>=2){const p2=pdf.addPage([W,H]);p2.drawRectangle({x:0,y:0,width:W,height:H,color:cream});p2.drawText('CONOCE EL HOTEL',{x:42,y:H-58,font:bold,size:10,color:gold});p2.drawText(hotel||destinationName,{x:42,y:H-88,font:bold,size:28,color:navyDark});p2.drawText('Fotografías reales aprobadas para esta biblioteca del hotel.',{x:42,y:H-110,font:regular,size:10,color:gray});
    const slots=[[42,H-365,330,230],[384,H-245,169,110],[384,H-365,169,110],[42,H-540,245,150],[300,H-540,253,150]];embedded.slice(0,5).forEach((img,i)=>{const s=slots[i];cover(p2,img,s[0],s[1],s[2],s[3]);p2.drawRectangle({x:s[0],y:s[1],width:s[2],height:s[3],borderColor:white,borderWidth:2});});
    p2.drawText(`${embedded.length} fotografía${embedded.length===1?'':'s'} disponible${embedded.length===1?'':'s'} en esta versión del PDF.`,{x:42,y:90,font:bold,size:10,color:navy});p2.drawText('La galería crecerá automáticamente conforme aprobemos nuevas imágenes reales del hotel.',{x:42,y:72,font:regular,size:9,color:gray});
  }

  const p3=pdf.addPage([W,H]);p3.drawRectangle({x:0,y:0,width:W,height:H,color:cream});p3.drawText('TU VIAJE',{x:42,y:H-58,font:bold,size:10,color:gold});p3.drawText('Lo esencial de esta promoción',{x:42,y:H-90,font:bold,size:28,color:navyDark});let py=H-130;
  const facts=[hotel?`Hotel: ${hotel}`:'',dates?`Fechas: ${dates}`:'',duration?`Estancia: ${duration}`:'',offer.plan?`Plan: ${clean(offer.plan)}`:'',offer.occupancy?`Viajeros: ${clean(offer.occupancy)}`:'',price?`Precio publicado: ${price} MXN`:'' ].filter(Boolean);
  facts.forEach(f=>{p3.drawText('•',{x:48,y:py,font:bold,size:12,color:gold});py=drawWrapped(p3,f,{x:62,y:py,font:regular,size:11,maxWidth:485,color:navy,lineHeight:15,maxLines:2})-8;});
  if(includes.length){py-=8;p3.drawText('INCLUYE',{x:42,y:py,font:bold,size:10,color:gold});py-=22;includes.slice(0,8).forEach(item=>{p3.drawText('•',{x:48,y:py,font:bold,size:11,color:gold});py=drawWrapped(p3,item,{x:62,y:py,font:regular,size:10.5,maxWidth:485,color:gray,lineHeight:15,maxLines:2})-6;});}
  py=Math.min(py-18,290);p3.drawText('CONDICIONES',{x:42,y:py,font:bold,size:10,color:gold});drawWrapped(p3,clean(offer.note||'Precio, disponibilidad y condiciones se reconfirman antes de reservar.'),{x:42,y:py-20,font:regular,size:10,maxWidth:340,color:gray,lineHeight:14,maxLines:8});
  const qrBuffer=await QRCode.toBuffer(canonical,{type:'png',width:220,margin:1,color:{dark:'#063F53',light:'#FFFFFF'}}),qr=await pdf.embedPng(qrBuffer),qs=120,qx=W-42-qs,qy=105;p3.drawRectangle({x:qx-8,y:qy-8,width:qs+16,height:qs+16,color:white,borderColor:gold,borderWidth:1});p3.drawImage(qr,{x:qx,y:qy,width:qs,height:qs});p3.drawText('Escanea para abrir la versión vigente',{x:qx-5,y:qy-24,font:bold,size:8,color:navy});p3.drawText('de esta promoción en Trhoncal Travel.',{x:qx-1,y:qy-37,font:regular,size:8,color:gray});
  p3.drawText('Trhoncal Travel',{x:42,y:58,font:bold,size:11,color:navy});p3.drawText('WhatsApp 33 2933 5952 · viajestroncal@gmail.com',{x:42,y:40,font:regular,size:9,color:gray});p3.drawText('Precio y disponibilidad se reconfirman antes de cualquier pago o reservación.',{x:42,y:24,font:regular,size:8.2,color:gray});

  const bytes=await pdf.save(),safeName=clean(hotel||destinationName).replace(/[^A-Za-z0-9áéíóúÁÉÍÓÚñÑ]+/g,'-').replace(/^-|-$/g,'')||'oferta';res.setHeader('Content-Type','application/pdf');res.setHeader('Content-Disposition',`attachment; filename="Trhoncal-Travel-${safeName}-V2.pdf"`);res.setHeader('Cache-Control','no-store, max-age=0');res.setHeader('X-Robots-Tag','noindex,nofollow');return res.status(200).send(Buffer.from(bytes));
}
