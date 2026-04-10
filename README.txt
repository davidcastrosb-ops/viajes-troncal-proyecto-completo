
VIAJES TRONCAL - PROYECTO COMPLETO

ESTE PROYECTO YA VIENE LISTO PARA:
- Subir a GitHub
- Publicar en Vercel
- Mostrar promociones automáticas pegando solo links
- Cambiar fotos desde la carpeta assets
- Guardar formularios en Google Sheets
- Abrir WhatsApp con resumen del destino

========================================
1) DÓNDE CAMBIAR TU WHATSAPP, REDES Y COLORES
========================================

Abre este archivo:
assets/data/site.json

Ese archivo se abre fácil:
- clic derecho
- Abrir con
- Bloc de notas

Dentro verás:
- whatsapp
- phoneDisplay
- facebook
- instagram
- tiktok
- colores

Ejemplo:
"whatsapp": "523329335952"

Si luego cambias de número, solo reemplazas ese valor.

========================================
2) DÓNDE PEGAR TU GOOGLE SHEETS
========================================

En el mismo archivo:
assets/data/site.json

Busca esta línea:
"sheetsEndpoint": "PEGA_AQUI_TU_URL_DE_GOOGLE_APPS_SCRIPT"

Y reemplázala por la URL de tu Apps Script.

========================================
3) CÓMO CAMBIAR LAS IMÁGENES
========================================

BANNER PRINCIPAL:
assets/images/banner/banner-principal.svg

Si quieres cambiarlo por foto real:
- puedes poner banner-principal.jpg
- o banner-principal.webp

Solo recuerda actualizar la ruta en:
assets/data/site.json

MEDIDA RECOMENDADA DEL BANNER:
1920 x 980 px

LOGO:
assets/images/logo/logo-viajes-troncal.svg

Si quieres usar tu logo:
- pon tu archivo dentro de assets/images/logo/
- ejemplo: logo.png
- luego cambia la ruta en site.json

MEDIDA RECOMENDADA DEL LOGO:
alto aproximado 60 px visible en pantalla
archivo recomendado PNG transparente

FOTOS DE DESTINOS:
Cada destino tiene su carpeta, por ejemplo:
assets/images/destinos/cancun/
assets/images/destinos/tulum/
assets/images/destinos/puerto-vallarta/

Cada carpeta trae:
1.svg
2.svg
3.svg
4.svg

Puedes reemplazarlas por:
1.jpg
2.jpg
3.jpg
4.jpg

Si cambias el nombre o la extensión:
abre assets/data/site.json
y cambia las rutas del destino correspondiente.

MEDIDA RECOMENDADA DE CADA FOTO:
1200 x 800 px

========================================
4) CÓMO FUNCIONAN LAS PROMOCIONES AUTOMÁTICAS
========================================

Abre:
assets/data/promos.json

Se abre con Bloc de notas.

Vas a ver algo así:
[
  "https://mx.travelpromomaker.com/promomaker/contact/45921/copy"
]

Para agregar otra promo:
[
  "https://mx.travelpromomaker.com/promomaker/contact/45921/copy",
  "https://mx.travelpromomaker.com/promomaker/contact/99999/copy"
]

Reglas fáciles:
- cada link entre comillas
- cada línea con coma, menos la última
- debe iniciar con [ y terminar con ]

La PRIMERA promo del archivo se pone sola en el banner destacado.
Las demás salen abajo como tarjetas.

========================================
5) CÓMO SUBIR A GITHUB Y VERCEL
========================================

1. Descomprime el ZIP
2. Abre tu repositorio en GitHub Desktop
3. Copia TODO el contenido del proyecto dentro de tu repo
4. Commit
5. Push
6. Vercel se actualiza solo

========================================
6) ARCHIVOS IMPORTANTES
========================================

index.html
assets/css/styles.css
assets/js/site.js
assets/data/site.json
assets/data/promos.json
api/preview.js

========================================
7) NOTA IMPORTANTE
========================================

Las promos automáticas funcionan leyendo metadatos del link.
Si alguna promo no trae buena imagen o buen texto desde el sitio externo,
la tarjeta puede salir menos bonita.
En la mayoría de los casos, sí funciona bien para título, descripción e imagen.
