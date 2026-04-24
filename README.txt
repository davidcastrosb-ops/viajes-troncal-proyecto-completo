VIAJES TRONCAL — LANDING PREMIUM + KOMMO

Esta versión ya trae:
- Diseño tipo agencia premium tropical.
- Formulario bonito en la landing.
- Envío directo al webhook de Make que crea lead + nota en Kommo.
- Botón flotante de WhatsApp.
- Portada editable por temporada.
- Sección de promociones desde assets/data/promos.json.
- Mockup de referencia guardado en assets/images/referencia/mockup-viajes-troncal.png

ARCHIVO IMPORTANTE PARA CAMBIOS RÁPIDOS:
assets/data/site.json

Ahí puedes cambiar:
- WhatsApp
- correo
- redes sociales
- imagen de portada
- URL de Make
- URL del formulario Jotform de respaldo

CAMBIAR PORTADA:
1. Guarda tu nueva imagen en:
   assets/images/portadas/
2. Abre assets/data/site.json
3. Cambia esta línea:
   "image": "assets/images/portadas/hero-viajes-troncal.jpg"
   por ejemplo:
   "image": "assets/images/portadas/navidad.jpg"
4. Sube cambios con GitHub Desktop.
5. Vercel actualizará la página.

IMPORTANTE SOBRE KOMMO:
El formulario de esta landing manda directo al webhook de Make configurado en:
assets/data/site.json → integrations → makeWebhookUrl

Si cambias el escenario de Make o creas otro webhook, reemplaza esa URL.

FORMULARIO JOTFORM DE RESPALDO:
https://form.jotform.com/261127730314044

PROMOCIONES:
Para agregar promos edita:
assets/data/promos.json

Ejemplo:
[
  "https://mx.travelpromomaker.com/promomaker/contact/45981/copy",
  "https://otro-link-de-promocion.com"
]

SUBIR A GITHUB + VERCEL:
1. Descomprime este ZIP.
2. Copia todo dentro de la carpeta de tu repo de viajes.
3. En GitHub Desktop: Commit to main.
4. Push origin.
5. Vercel redeploya solo.
