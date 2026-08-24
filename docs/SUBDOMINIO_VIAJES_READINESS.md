# Trhoncal Travel — readiness para `viajes.trhoncalhomes.com.mx`

Fecha: 2026-08-24
Estado: CÓDIGO PREPARADO, DNS AÚN NO TOCADO

## Objetivo
Publicar la versión inicial de Trhoncal Travel en `viajes.trhoncalhomes.com.mx` sin comprar todavía un dominio exclusivo de viajes y sin romper el sitio principal de Trhoncal Homes.

## Regla de seguridad
No crear ni modificar registros DNS por memoria ni por ejemplos genéricos. Primero agregar `viajes.trhoncalhomes.com.mx` al proyecto correcto de Vercel y copiar exactamente el registro que Vercel muestre. Para un subdominio, Vercel normalmente solicita un CNAME y actualmente documenta que el dashboard muestra el destino específico del proyecto. No tocar raíz, `www`, MX, SPF, DKIM, DMARC ni registros inmobiliarios.

## Precondiciones ya cumplidas
- Repositorio GitHub conectado a Vercel.
- Rama de desarrollo activa: `feat/trhoncal-travel-knowledge-site-v2`.
- Preview funcionando.
- Archivo Maestro → Apps Script → `/api/master` → frontend funcionando.
- 16 destinos públicos.
- 6 destinos destacados en home.
- Ofertas públicas: 0.
- Jotform actualizado a Trhoncal Travel.
- Logo y paleta de marca integrados.
- `robots.txt`, `sitemap.xml` y canonical preparados con activación condicionada al host público.

## SEO seguro antes del lanzamiento
- En previews `.vercel.app`, `robots.txt` devuelve `Disallow: /` y `X-Robots-Tag: noindex, nofollow`.
- `sitemap.xml` no se sirve en previews; sólo responde cuando el host es exactamente `viajes.trhoncalhomes.com.mx`.
- `assets/js/seo-host.js` sólo crea canonical y `og:url` cuando el navegador está realmente en `viajes.trhoncalhomes.com.mx`.
- Al conectar el subdominio no será necesario volver a editar estas piezas: se activarán automáticamente en el host correcto.

## Pasos cuando se conecte Vercel
1. Entrar al proyecto correcto de Trhoncal Travel en Vercel.
2. Abrir Settings → Domains.
3. Agregar `viajes.trhoncalhomes.com.mx`.
4. Copiar el registro DNS EXACTO que Vercel muestre para ese proyecto.
5. Abrir el proveedor donde vive la zona DNS de `trhoncalhomes.com.mx`.
6. Crear únicamente el registro para el host `viajes`.
7. Volver a Vercel y esperar validación de dominio y certificado HTTPS.
8. Probar home, `/api/master`, `/robots.txt`, `/sitemap.xml`, Jotform, WhatsApp y al menos tres rutas `/mexico/<slug>`.
9. Verificar que el canonical de home y fichas apunte a `https://viajes.trhoncalhomes.com.mx/...`.
10. Mantener el PR en DRAFT hasta revisión visual y funcional final de David.

## Validación mínima de lanzamiento
- HTTPS válido.
- Home carga sin errores.
- El contador de destinos coincide con el Maestro.
- Los 6 destacados aparecen primero.
- La biblioteca secundaria aparece debajo.
- Filtros funcionan en ambos bloques.
- Imágenes cargan; si alguna falla aparece el fallback de marca.
- Fichas limpias `/mexico/<slug>` abren correctamente.
- Formulario Jotform dice Trhoncal Travel.
- WhatsApp apunta al número comercial configurado.
- Sección Ofertas permanece oculta mientras haya 0 ofertas publicables.
- `robots.txt` permite producción y bloquea previews.
- `sitemap.xml` contiene únicamente destinos públicos.
- canonical y `og:url` usan el host público.

## Tercera ola activada sin tocar destacados
- Tulum — orden 14, no destacado.
- Bacalar — orden 15, no destacado.
- Loreto — orden 16, no destacado.
- Los tres conservan la regla de imagen con fuente, licencia, crédito y fecha de verificación.
- Acapulco sigue fuera hasta revisión operativa/producto.

## Después de que el host resuelva
- Verificar Search Console/Bing Webmaster cuando corresponda.
- Añadir imagen social específica de Trhoncal Travel para Open Graph.
- Mantener rutas relativas para facilitar migración futura al dominio exclusivo de viajes.
