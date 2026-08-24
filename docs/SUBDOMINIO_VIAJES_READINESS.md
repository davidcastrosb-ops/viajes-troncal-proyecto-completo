# Trhoncal Travel — readiness para `viajes.trhoncalhomes.com.mx`

Fecha: 2026-08-24
Estado: PREPARADO, DNS AÚN NO TOCADO

## Objetivo
Publicar la versión inicial de Trhoncal Travel en `viajes.trhoncalhomes.com.mx` sin comprar todavía un dominio exclusivo de viajes y sin romper el sitio principal de Trhoncal Homes.

## Regla de seguridad
No crear ni modificar registros DNS por memoria ni por ejemplos genéricos. Primero agregar el dominio al proyecto correcto de Vercel y copiar exactamente el registro que Vercel solicite en ese momento. El proveedor DNS puede requerir CNAME, A, ALIAS u otra forma según la configuración vigente.

## Precondiciones ya cumplidas
- Repositorio GitHub conectado a Vercel.
- Rama de desarrollo activa: `feat/trhoncal-travel-knowledge-site-v2`.
- Preview funcionando.
- Archivo Maestro → Apps Script → `/api/master` → frontend funcionando.
- 13 destinos públicos.
- 6 destinos destacados en home.
- Ofertas públicas: 0.
- Jotform actualizado a Trhoncal Travel.
- Logo y paleta de marca integrados.

## Pasos cuando David abra Vercel/DNS
1. Entrar al proyecto correcto de Trhoncal Travel en Vercel.
2. Abrir Settings → Domains.
3. Agregar `viajes.trhoncalhomes.com.mx`.
4. Copiar el registro DNS EXACTO que Vercel muestre.
5. Abrir el proveedor donde vive la zona DNS de `trhoncalhomes.com.mx`.
6. Crear únicamente el registro para el host/subdominio `viajes`; no tocar raíz, `www`, correo, SPF, DKIM, DMARC ni registros del sitio inmobiliario.
7. Volver a Vercel y esperar validación de dominio y certificado HTTPS.
8. Probar home, `/api/master`, Jotform, WhatsApp y al menos tres rutas `/mexico/<slug>`.
9. Sólo después de que el host resuelva bien, agregar canonical y sitemap apuntando al subdominio real.
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

## Después del subdominio
- Añadir `<link rel="canonical">` al home y a las fichas.
- Generar `sitemap.xml` a partir de destinos públicos del Maestro.
- Definir `robots.txt` para producción.
- Verificar Search Console/Bing Webmaster cuando corresponda.
- Revisar Open Graph con imagen social propia de Trhoncal Travel.
- Mantener rutas relativas para facilitar migración futura al dominio exclusivo de viajes.
