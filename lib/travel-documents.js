import { createHash, timingSafeEqual } from 'node:crypto';
import { PDFDocument, StandardFonts, rgb, PDFString } from 'pdf-lib';
import * as QRCode from 'qrcode';

// Prototipo protegido. No almacena expedientes personales.
const W=595,H=842;
const colors={navy:rgb(.025,.19,.28),gold:rgb(.83,.65,.34),cream:rgb(.98,.97,.94),white:rgb(1,1,1),ink:rgb(.14,.23,.29),green:rgb(.12,.51,.34)};
const theme={playa:['Playa',rgb(.10,.57,.67)],ciudad:['Ciudad',rgb(.24,.4,.60)],pueblos:['Pueblos mágicos',rgb(.57,.36,.20)],montana:['Montaña y nieve',rgb(.34,.49,.56)],naturaleza:['Naturaleza',rgb(.26,.47,.35)],cultural:['Cultural',rgb(.46,.35,.48)]};
const clean=(v,n=200)=>String(v??'').normalize('NFC').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,n);
const d=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+'T12:00:00Z'));
const mx=s=>d(s)?new Intl.DateTimeFormat('es-MX',{dateStyle:'long',timeZone:'UTC'}).format(new Date(s+'T12:00:00Z')):s;
const price=n=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(n);
function authorized(req){
  const u=process.env.TRAVEL_DOCUMENTS_USER,p=process.env.TRAVEL_DOCUMENTS_PASSWORD;
  if(!u||!p||p.length<16)return false;
  const h=String(req.headers.authorization||'');
  if(!h.startsWith('Basic '))return false;
  let decoded='';try{decoded=Buffer.from(h.slice(6),'base64').toString('utf8');}catch{return false;}
  return timingSafeEqual(createHash('sha256').update(decoded).digest(),createHash('sha256').update(u+':'+p).digest());
}
function validate(body){
  if(!body||typeof body!=='object'||Array.isArray(body))throw Error('Expediente inválido.');
  const fields=['kind','theme','name','reservation','payment','amount','hotelReservation','hotelAmount','busAmount','hotel','room','guests','food','arrival','departure','arrivalTime','departureTime','address','phone','provider','locator','from','to','outDate','outTime','outSeat','backFrom','backTo','backDate','backTime','backSeat','lat','lon'];
  const p={};for(const k of fields)p[k]=clean(body[k],k==='address'?250:160);
  if(!['hotel','autobus','combinado'].includes(p.kind)||!p.name||!p.reservation)throw Error('Selecciona tipo, pasajero y reservación principal.');
  if(!['PAGADO','PENDIENTE','NO INDICADO'].includes(p.payment))throw Error('Estado de pago inválido.');
  if(!/^\d{1,8}(\.\d{1,2})?$/.test(p.amount))throw Error('Monto inválido. Captura dos decimales como máximo.');
  if(p.kind!=='autobus'&&(!p.hotel||!p.room||!d(p.arrival)||!d(p.departure)||p.departure<=p.arrival))throw Error('Falta hotel, habitación o fechas válidas.');
  if(p.kind!=='hotel'&&(!p.provider||!p.from||!p.to||!p.backFrom||!p.backTo||!d(p.outDate)||!d(p.backDate)))throw Error('Completa transportista, terminales y fechas de ida/regreso.');
  if(p.kind==='combinado'){
    if(!p.hotelReservation||!p.locator)throw Error('Para hotel + autobús faltan los dos localizadores.');
    if(!/^\d{1,8}(\.\d{1,2})?$/.test(p.hotelAmount)||!/^\d{1,8}(\.\d{1,2})?$/.test(p.busAmount))throw Error('Separa el importe de hotel y autobús.');
    const total=Math.round(Number(p.amount)*100),parts=Math.round(Number(p.hotelAmount)*100)+Math.round(Number(p.busAmount)*100);
    if(total!==parts)throw Error('El importe total no coincide con la suma de hotel y autobús.');
  }
  if(Boolean(p.lat)!==Boolean(p.lon))throw Error('Las coordenadas se capturan juntas.');
  if(p.lat&&(!Number.isFinite(Number(p.lat))||!Number.isFinite(Number(p.lon))||Math.abs(Number(p.lat))>90||Math.abs(Number(p.lon))>180))throw Error('Coordenadas incorrectas.');
  for(const k of ['arrivalTime','departureTime','outTime','backTime'])if(p[k]&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(p[k]))throw Error('Revisa la hora '+k+'.');
  return p;
}
function latin(s){return clean(s,600).replace(/[^\x20-\x7e\u00c0-\u00ff]/g,'-');}
function write(page,s,x,y,font,size=11,color=colors.ink,maxWidth=505,maxLines=4){
  const words=latin(s).split(/\s+/).filter(Boolean);let line='',lines=[];
  for(const word of words){const t=line?line+' '+word:word;if(font.widthOfTextAtSize(t,size)<=maxWidth)line=t;else{if(line)lines.push(line);line=word;if(font.widthOfTextAtSize(line,size)>maxWidth){line=line.slice(0,Math.max(1,Math.floor(maxWidth/(size*.62))));}}}
  if(line)lines.push(line);
  lines.slice(0,maxLines).forEach((part,i)=>page.drawText(part,{x,y:y-i*(size+4),font,size,color}));
  return y-Math.min(lines.length,maxLines)*(size+4);
}
function heading(pdf,label,t,bold,regular,pageNumber){
  const pg=pdf.addPage([W,H]),accent=(theme[t]||theme.playa)[1];
  pg.drawRectangle({x:0,y:0,width:W,height:H,color:colors.cream});
  pg.drawRectangle({x:0,y:676,width:W,height:166,color:colors.navy});
  pg.drawRectangle({x:0,y:674,width:W,height:6,color:accent});
  write(pg,'TRHONCAL',37,793,bold,23,colors.white);
  write(pg,'T R A V E L',39,773,bold,10,colors.gold);
  write(pg,label,37,722,bold,23,colors.white);
  write(pg,'Estilo de viaje: '+(theme[t]||theme.playa)[0],38,692,regular,10,colors.white);
  pg.drawLine({start:{x:38,y:35},end:{x:557,y:35},color:colors.gold,width:1});
  write(pg,'TRHONCAL TRAVEL  ·  Documento para pasajero',38,20,regular,8);
  write(pg,String(pageNumber),540,20,bold,9);
  return pg;
}
function field(page,label,value,y,bold,regular,size=12){
  write(page,label.toUpperCase(),42,y,bold,9,colors.gold);
  return write(page,value||'No indicado',42,y-17,regular,size,colors.ink,505,3)-15;
}
async function pdfFor(p){
  const pdf=await PDFDocument.create(),bold=await pdf.embedFont(StandardFonts.HelveticaBold),regular=await pdf.embedFont(StandardFonts.Helvetica);
  pdf.setTitle('Trhoncal Travel - '+p.reservation);pdf.setAuthor('Trhoncal Travel');
  let no=0;
  if(p.kind!=='autobus'){
    const pg=heading(pdf,'Confirmación de hospedaje',p.theme,bold,regular,++no);
    pg.drawRectangle({x:38,y:624,width:519,height:35,color:colors.gold});
    write(pg,'RESERVACIÓN   '+(p.kind==='combinado'?p.hotelReservation:p.reservation),53,636,bold,15,colors.navy);
    let y=599;
    y=field(pg,'Titular',p.name,y,bold,regular,14);
    pg.drawRectangle({x:38,y:y-107,width:519,height:105,color:rgb(.88,.95,.97)});
    write(pg,'HABITACIÓN CONFIRMADA',53,y-25,bold,10,colors.navy);
    write(pg,p.room,53,y-60,bold,19,colors.navy,480,2);y-=132;
    y=field(pg,'Hotel',p.hotel,y,bold,regular,13);
    y=field(pg,'Huéspedes / plan',(p.guests||'Sin indicar')+'  ·  '+(p.food||'Sin indicar'),y,bold,regular);
    y=field(pg,'Llegada',mx(p.arrival)+'  '+p.arrivalTime,y,bold,regular);
    y=field(pg,'Salida',mx(p.departure)+'  '+p.departureTime,y,bold,regular);
    if(p.address)y=field(pg,'Dirección',p.address,y,bold,regular,10);
    if(p.phone)y=field(pg,'Contacto hotel',p.phone,y,bold,regular,10);
    pg.drawRectangle({x:38,y:65,width:519,height:62,color:colors.white});
    write(pg,'ESTADO: '+p.payment,53,105,bold,12,p.payment==='PAGADO'?colors.green:colors.navy);
    write(pg,'IMPORTE HOSPEDAJE: '+price(Number(p.kind==='combinado'?p.hotelAmount:p.amount)),53,82,bold,15,colors.navy);
  }
  if(p.kind!=='hotel'){
    const pg=heading(pdf,'Traslados en autobús',p.theme,bold,regular,++no);
    pg.drawRectangle({x:38,y:624,width:519,height:35,color:colors.gold});
    write(pg,'RESERVACIÓN   '+(p.kind==='combinado'?p.locator:p.reservation),53,636,bold,15,colors.navy);
    let y=600;
    y=field(pg,'Pasajero',p.name,y,bold,regular,14);
    y=field(pg,'Transportista / localizador',p.provider+'  ·  '+(p.locator||'No indicado'),y,bold,regular);
    pg.drawRectangle({x:38,y:280,width:519,height:208,color:rgb(.88,.95,.97)});
    write(pg,'IDA',53,457,bold,13,colors.navy);
    write(pg,p.from+'  →  '+p.to,53,432,bold,13,colors.navy,479,3);
    write(pg,mx(p.outDate)+'  '+p.outTime+' h',53,367,regular,11);
    write(pg,'ASIENTO IDA: '+(p.outSeat||'No indicado'),53,340,bold,12,colors.navy);
    pg.drawRectangle({x:38,y:145,width:519,height:121,color:colors.white});
    write(pg,'REGRESO',53,240,bold,13,colors.navy);
    write(pg,p.backFrom+'  →  '+p.backTo,53,216,bold,12,colors.navy,480,2);
    write(pg,mx(p.backDate)+'  '+p.backTime+' h',53,174,regular,11);
    write(pg,'ASIENTO REGRESO: '+(p.backSeat||'No indicado'),53,155,bold,12,colors.navy);
    write(pg,'ESTADO: '+p.payment+'   |   IMPORTE: '+price(Number(p.kind==='combinado'?p.busAmount:p.amount)),42,105,bold,13,p.payment==='PAGADO'?colors.green:colors.navy,495,2);
  }
  if(p.lat){
    const pg=heading(pdf,'Cómo llegar al hotel',p.theme,bold,regular,++no);
    let y=621;y=field(pg,'Destino',p.hotel||p.to,y,bold,regular,14);
    y=field(pg,'Dirección',p.address||p.to,y,bold,regular);
    y=field(pg,'Coordenadas',p.lat+', '+p.lon,y,bold,regular);
    const url='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(p.lat+','+p.lon);
    const qr=await pdf.embedPng(await QRCode.toBuffer(url,{type:'png',width:480,margin:1}));
    const x=171,qy=200,s=252;
    pg.drawRectangle({x:x-14,y:qy-14,width:s+28,height:s+28,color:colors.white});
    pg.drawImage(qr,{x,y:qy,width:s,height:s});
    write(pg,'ESCANEA Y ABRE GOOGLE MAPS',115,163,bold,14,colors.navy,400,1);
    write(pg,'La ruta parte desde la ubicación que el pasajero permita.',80,142,regular,10,colors.ink,460,2);
    const annot=pdf.context.obj({Type:'Annot',Subtype:'Link',Rect:[x,qy,x+s,qy+s],Border:[0,0,0],A:{Type:'Action',S:'URI',URI:PDFString.of(url)}});
    pg.node.addAnnot(pdf.context.register(annot));
    write(pg,'Código QR y área del mapa clicables en PDF.',42,86,regular,10);
  }
  return Buffer.from(await pdf.save());
}
const inputs=[
 ['name','Nombre del pasajero','text'],['reservation','Reserva principal o folio del expediente','text'],
 ['amount','Importe total MXN','number'],['hotelReservation','Localizador hotel (paquete)','text'],['hotelAmount','Importe hotel (paquete)','number'],['busAmount','Importe autobús (paquete)','number'],['hotel','Nombre del hotel','text'],['room','Habitación confirmada','text'],
 ['guests','Huéspedes','text'],['food','Plan de alimentos','text'],['arrival','Llegada','date'],['arrivalTime','Hora llegada','time'],
 ['departure','Salida','date'],['departureTime','Hora salida','time'],['address','Dirección del hotel','text'],['phone','Teléfono hotel','text'],
 ['provider','Empresa transportista','text'],['locator','Localizador autobús','text'],['from','Salida ida (terminal)','text'],['to','Llegada ida (terminal)','text'],
 ['outDate','Fecha ida','date'],['outTime','Hora ida','time'],['outSeat','Asiento ida','text'],['backFrom','Salida regreso','text'],
 ['backTo','Llegada regreso','text'],['backDate','Fecha regreso','date'],['backTime','Hora regreso','time'],['backSeat','Asiento regreso','text'],
 ['lat','Latitud mapa','number'],['lon','Longitud mapa','number']
];
function html(){
  const hotelFields=new Set(['hotelReservation','hotelAmount','hotel','room','guests','food','arrival','arrivalTime','departure','departureTime','address','phone']);
  const busFields=new Set(['busAmount','provider','locator','from','to','outDate','outTime','outSeat','backFrom','backTo','backDate','backTime','backSeat']);
  const rows=inputs.map(([k,label,type])=>{
    const group=hotelFields.has(k)?'hotel':busFields.has(k)?'bus':(k==='lat'||k==='lon'?'map':'common');
    const combinedOnly=['hotelReservation','hotelAmount','busAmount'].includes(k)?' data-combined="1"':'';
    return '<label data-group="'+group+'"'+combinedOnly+'>'+label+'<input name="'+k+'" type="'+type+'" '+(type==='number'?'step="any" ':'')+'maxlength="250"></label>';
  }).join('');
  return '<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Documentos Trhoncal Travel</title><style>body{margin:0;background:#f7f8f6;color:#123849;font:16px system-ui}header{background:#073a4d;color:white;padding:25px}main{max-width:1000px;margin:25px auto;padding:18px}form,section{background:white;padding:25px;border:1px solid #ddd;border-radius:12px}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:15px}label{font-size:13px;font-weight:700}label[hidden]{display:none}input,select{display:block;width:100%;padding:10px;margin-top:5px;border:1px solid #bbc7cc;border-radius:7px;box-sizing:border-box}button{margin:15px 10px 0 0;padding:12px 20px;background:#073a4d;color:white;border:0;border-radius:8px;cursor:pointer}button:disabled{opacity:.5}iframe{width:100%;height:600px} @media(max-width:650px){.grid{grid-template-columns:1fr}}</style><header><strong style="font-size:24px">TRHONCAL</strong> TRAVEL · OPERACIONES</header><main><h1>Generador de documentos</h1><p>Acceso privado. Completa los datos de la confirmación y verifica la vista previa. No se guarda información en el servidor.</p><form id="f"><div class="grid"><label>Tipo<select name="kind"><option value="hotel">Hospedaje</option><option value="autobus">Autobús</option><option value="combinado">Hotel + autobús</option></select></label><label>Temática<select name="theme">'+Object.entries(theme).map(([k,v])=>'<option value="'+k+'">'+v[0]+'</option>').join('')+'</select></label><label>Estado del pago<select name="payment"><option>NO INDICADO</option><option>PENDIENTE</option><option>PAGADO</option></select></label></div><div class="grid" style="margin-top:16px">'+rows+'</div><button type="submit">Generar vista previa</button><button type="button" id="save" disabled>Descargar PDF</button><p id="msg" role="status"></p></form><section id="result" hidden><h2>Vista previa</h2><iframe id="preview" title="PDF generado"></iframe></section></main><script>let u="";const f=document.getElementById("f"),m=document.getElementById("msg"),save=document.getElementById("save");function groups(){const k=f.elements.kind.value;document.querySelectorAll("[data-group]").forEach(el=>{const g=el.dataset.group;el.hidden=(g==="hotel"&&k==="autobus")||(g==="bus"&&k==="hotel")||(el.dataset.combined==="1"&&k!=="combinado")});}f.elements.kind.addEventListener("change",groups);groups();f.addEventListener("input",()=>{save.disabled=true;m.textContent="Cambios pendientes de generar."});f.addEventListener("submit",async e=>{e.preventDefault();save.disabled=true;m.textContent="Generando...";try{const r=await fetch(location.pathname,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.fromEntries(new FormData(f)))});if(!r.ok){const j=await r.json();throw Error(j.error||"Error de generación")}const b=await r.blob();if(u)URL.revokeObjectURL(u);u=URL.createObjectURL(b);document.getElementById("preview").src=u;document.getElementById("result").hidden=false;save.disabled=false;m.textContent="Revisa todos los datos antes de descargar."}catch(x){m.textContent=x.message}});save.addEventListener("click",()=>{if(!u)return;const a=document.createElement("a");a.href=u;a.download="Trhoncal-Travel-"+f.elements.reservation.value.replace(/[^a-z0-9_-]/gi,"-")+".pdf";a.click()})</script></html>';
}
export default async function handler(req,res){
  res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Robots-Tag','noindex,nofollow');
  if(!process.env.TRAVEL_DOCUMENTS_USER||!process.env.TRAVEL_DOCUMENTS_PASSWORD||process.env.TRAVEL_DOCUMENTS_PASSWORD.length<16)
    return res.status(503).send('Módulo pendiente de credenciales privadas.');
  if(!authorized(req)){res.setHeader('WWW-Authenticate','Basic realm="Trhoncal Travel"');return res.status(401).send('Acceso restringido.');}
  if(req.method==='GET'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.status(200).send(html());}
  if(req.method!=='POST')return res.status(405).send('Método no permitido.');
  try{if(Number(req.headers['content-length']||0)>16000)return res.status(413).json({error:'Expediente demasiado grande.'});
    const p=validate(req.body),out=await pdfFor(p);
    res.setHeader('Content-Type','application/pdf');res.setHeader('Content-Disposition','inline; filename="Trhoncal-Travel-Documento.pdf"');
    return res.status(200).send(out);
  }catch(e){return res.status(400).json({error:e.message||'Error al generar PDF'});}
}
