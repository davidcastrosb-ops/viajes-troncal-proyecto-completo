VIAJES TRONCAL - LANDING PREMIUM + KOMMO

Esta versión usa un formulario propio dentro de la landing, NO abre Jotform en la página.
El formulario envía la información al webhook de Make y Make la manda a Kommo como lead + nota.

FLUJO:
Cliente llena formulario en viajes.3dhomes.com.mx
→ webhook de Make
→ Kommo / embudo Viajes Troncal
→ nota con datos del viaje

IMPORTANTE:
- El botón principal de la portada baja al formulario dentro de la misma página.
- Ya no aparece el botón extra "Abrir formulario" para no confundir al cliente.
- Jotform queda solo como respaldo externo si lo necesitas; el formulario bonito de la landing es el principal.

CAMBIAR PORTADA:
Opción fácil:
1. Reemplaza la imagen assets/images/portadas/hero-viajes-troncal.jpg
2. Usa el mismo nombre: hero-viajes-troncal.jpg
3. Haz commit y push desde GitHub Desktop.

Opción por temporada:
1. Sube otra imagen en assets/images/portadas/
2. Edita assets/data/site.json
3. Cambia la línea:
   "image": "assets/images/portadas/hero-viajes-troncal.jpg"
   por ejemplo:
   "image": "assets/images/portadas/navidad.jpg"

CONFIGURACIÓN PRINCIPAL:
Archivo: assets/data/site.json
Ahí puedes cambiar:
- WhatsApp
- correo
- redes sociales
- imagen de portada
- webhook de Make
- link de Jotform de respaldo

SUBIR A VERCEL:
1. Descomprime este ZIP.
2. Copia los archivos al repositorio de viajes.3dhomes.com.mx.
3. Abre GitHub Desktop.
4. Commit.
5. Push origin.
6. Vercel actualizará automáticamente.
