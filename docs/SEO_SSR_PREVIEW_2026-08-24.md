# Trhoncal Travel — SEO/AEO SSR

Fecha: 2026-08-24
Estado: integrado a producción
PR: #4 — MERGED
Commit de merge: `5fb975f48b05acaa06f68473e20f8590453e7115`
Producción: `https://viajes.trhoncalhomes.com.mx/`

## Objetivo
Que cada ficha `/mexico/<slug>` entregue desde servidor el contenido principal y metadata SEO/AEO, sin depender de JavaScript para que un robot pueda leer la ficha.

## Hecho
- `Slug_Web` agregado al Archivo Maestro.
- 30/30 destinos cargados con slug estable equivalente a la URL pública existente.
- `api/destination.js` renderiza las fichas desde servidor.
- `vercel.json` enruta `/mexico/:slug` a `api/destination`.
- La respuesta SSR incluye title, description, canonical, Open Graph, robots, JSON-LD `TouristDestination` + `BreadcrumbList`, contenido de ficha, fuentes y CTA.
- En preview se mantiene `noindex,nofollow`; el host público es indexable.
- PR #4 fue integrado a `main`.
- Vercel reportó SUCCESS para el commit de producción.

## URLs de control
- `/mexico/cancun`
- `/mexico/puerto-vallarta`
- `/mexico/tulum`

## Regla de URL
- `Slug_Web` es el identificador público estable.
- Cambiar `Nombre` no debe cambiar la URL.
- `Slug_Web` no se cambia después de publicar sin redirección 301 y actualización de sitemap/canonical.

## Apps Script
El código `apps-script/Code.gs` ya está actualizado en `main` para usar `Slug_Web` con fallback a `Nombre` y caché `public-payload-v2`.

Pendiente operativo: publicar una nueva versión del Web App en Google Apps Script. El conector disponible de Google Drive/Sheets no expone despliegues de Apps Script, por lo que ese clic no puede ejecutarse desde ChatGPT. Esto no rompe las URLs actuales porque los 30 `Slug_Web` cargados coinciden con los slugs ya generados por la versión desplegada.

## Estado de seguridad
- `Mostrar_Web`: sin cambios.
- `Destacado_Home`: sin cambios.
- Ofertas públicas: 0.
- DNS: sin cambios.
- Producción: desplegada correctamente.
