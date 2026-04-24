VIAJES TRONCAL - LANDING PREMIUM CON JOTFORM + KOMMO

Esta versión usa la landing como portada bonita y el formulario real de Jotform incrustado dentro de la página.

Flujo confirmado:
Landing viajes.3dhomes.com.mx
→ Jotform incrustado
→ Make
→ Kommo
→ Lead + nota con datos del viaje

IMPORTANTE:
No se usa formulario propio de la landing para mandar datos. Esto evita errores. El formulario visible es el de Jotform que ya quedó conectado a Make y Kommo.

FORMULARIO JOTFORM:
https://form.jotform.com/261127730314044

PARA CAMBIAR LA PORTADA:
Opción fácil:
1. Entra a assets/images/portadas/
2. Reemplaza hero-viajes-troncal.jpg por otra imagen con el mismo nombre.
3. Sube cambios a GitHub Desktop y haz Push.
4. Vercel actualizará el sitio.

Opción ordenada:
1. Agrega otra imagen en assets/images/portadas/, por ejemplo navidad.jpg
2. Abre assets/data/site.json
3. Cambia esta línea:
   "image": "assets/images/portadas/hero-viajes-troncal.jpg"
   por:
   "image": "assets/images/portadas/navidad.jpg"
4. Guarda, commit y push.

PARA CAMBIAR WHATSAPP:
Abre assets/data/site.json y cambia:
"whatsapp": "523329335952"

PARA CAMBIAR EL FORMULARIO:
Abre assets/data/site.json y cambia:
"jotformUrl": "https://form.jotform.com/261127730314044"

SUBIR A GITHUB / VERCEL:
1. Descomprime este ZIP.
2. Copia todo a la carpeta del proyecto conectado a Vercel.
3. En GitHub Desktop: Commit.
4. Push origin.
5. Vercel redeploya automáticamente.
