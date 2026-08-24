# Trhoncal Travel — SEO/AEO SSR Preview

Fecha: 2026-08-24
Rama: `feat/seo-ssr-stable-slugs`
PR: #4 (DRAFT)
Preview Vercel: `https://viajes-troncal-proye-git-4f8e45-david-castros-projects-75de0086.vercel.app`
Producción permanece en `main` / `https://viajes.trhoncalhomes.com.mx/`.

## Objetivo
Que cada ficha `/mexico/<slug>` entregue desde servidor el contenido principal y metadata SEO/AEO, sin depender de JavaScript para que un robot pueda leer la ficha.

## Hecho
- `Slug_Web` agregado al Archivo Maestro.
- 30/30 destinos cargados con slug estable equivalente a la URL que el sitio generaba al corte.
- Apps Script del repositorio actualizado para usar `Slug_Web` con fallback a `Nombre`.
- Nuevo `api/destination.js` server-rendered.
- `vercel.json` enruta `/mexico/:slug` a `api/destination` en esta rama.
- La respuesta SSR incluye: title, description, canonical, Open Graph, robots, JSON-LD `TouristDestination` + `BreadcrumbList`, contenido de ficha, fuentes, CTA de WhatsApp y cotización.
- En preview se emite `noindex,nofollow`; sólo el host público se plantea como indexable.
- Vercel reportó el deployment de la rama como SUCCESS.

## URLs de control
- `/mexico/cancun`
- `/mexico/puerto-vallarta`
- `/mexico/tulum`

## Regla de URL
- `Slug_Web` es identificador público estable.
- Cambiar `Nombre` no debe cambiar la URL.
- `Slug_Web` no se cambia después de publicar sin un plan explícito de redirección 301 y actualización de sitemap/canonical.

## Dependencia antes de merge
El Apps Script desplegado actualmente todavía usa la versión anterior del código. Antes o junto con el merge de PR #4 debe publicarse la nueva versión de `apps-script/Code.gs` para que el endpoint del Maestro use `Slug_Web` como fuente efectiva. Como los slugs cargados son iguales a los actuales, el preview SSR puede probarse sin cambiar URLs.

## No tocar todavía
- `Mostrar_Web`.
- `Destacado_Home`.
- Ofertas.
- DNS.
- Producción `main`.

## Criterio para aprobar merge
1. Preview responde en las tres URLs de control.
2. HTML inicial contiene el nombre, resumen, secciones y fuentes de la ficha.
3. Canonical apunta a `https://viajes.trhoncalhomes.com.mx/mexico/<slug>`.
4. Preview permanece noindex.
5. Diseño usable en escritorio y móvil.
6. Nueva versión de Apps Script desplegada y `Slug_Web` confirmado en `/api/master`.
