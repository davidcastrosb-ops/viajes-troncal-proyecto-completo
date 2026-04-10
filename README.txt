PROYECTO LIMPIO - VIAJES TRONCAL

Este ZIP ya viene limpio para subir:
- sin vercel.json
- con api/preview.js
- con package.json para Node 20
- con promociones automáticas por links
- con formulario para Google Sheets + WhatsApp

ARCHIVOS QUE VAS A EDITAR NORMALMENTE

1) assets/data/promos.json
Ahí pegas solo tus links de promociones.
Lo abres con clic derecho > Abrir con > Bloc de notas

Ejemplo:
[
  "https://mx.travelpromomaker.com/promomaker/contact/45921/copy",
  "https://mx.travelpromomaker.com/promomaker/contact/99999/copy"
]

2) assets/data/site.json
Ahí cambias:
- WhatsApp
- redes
- colores
- logo
- banner
- endpoint de Google Sheets

Google Sheets:
en assets/data/site.json busca:
"sheetsEndpoint": "PEGA_AQUI_TU_URL_DE_GOOGLE_APPS_SCRIPT"
y reemplázalo por tu URL

Subir a GitHub y Vercel:
1. Borra de tu repo actual todo lo viejo
2. Copia todo lo de este ZIP
3. Commit
4. Push
5. Vercel redeploya
