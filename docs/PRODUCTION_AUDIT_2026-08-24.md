# Trhoncal Travel — Auditoría de producción

Fecha: 2026-08-24
Host público: `https://viajes.trhoncalhomes.com.mx/`

## Estado general
- El host público ya resuelve y muestra la versión nueva de Trhoncal Travel.
- Producción corre desde `main`.
- La versión antigua asociada históricamente a `viajes.3dhomes.com.mx` quedó fuera del proyecto público y respaldada en `legacy/viajes-3dhomes-2026-08-24`.
- Snapshot de seguridad de la versión nueva: `snapshot/trhoncal-travel-v2-2026-08-24`.
- Archivo Maestro controla publicación editorial.
- Estado público al corte: 16 destinos, 6 destacados, 0 ofertas.

## Auditoría por frente

### 1. Home
- Validación visual confirmada sobre el host público.
- Marca Trhoncal Travel, logo, navegación, CTA, contador de destinos y jerarquía 6 destacados + biblioteca secundaria operativos.
- La sección Ofertas permanece oculta mientras no existan ofertas publicables.

### 2. `/api/master`
- Proxy Vercel de solo lectura hacia Apps Script.
- Apps Script filtra `Mostrar_Web`, permisos de imagen y reglas de ofertas antes de exponer datos públicos.
- La API de producción fue endurecida para no devolver previews del upstream ni detalles internos de errores.
- La hoja `07_Ofertas_Vigentes` tiene únicamente encabezados: 0 ofertas públicas al corte.

### 3. Fichas auditadas
Se revisaron datos y rutas de tres fichas representativas:
- `/mexico/cancun`
- `/mexico/puerto-vallarta`
- `/mexico/tulum`

Las tres cuentan con ficha completa en `02_Fichas_Destino`, fuentes asociadas, resumen, contexto, experiencias, estancia, clima, conectividad, combinaciones, riesgos y reconocimientos.

### 4. WhatsApp
- Configuración web: `523329335952`.
- Los CTA generan enlaces `wa.me` con mensaje contextual de Trhoncal Travel y, en fichas, con el nombre del destino.

### 5. Jotform
- Form ID: `261127730314044`.
- Título verificado: `Cotiza tu viaje con Trhoncal Travel`.
- Estado: ENABLED.
- 14 preguntas y 21 envíos existentes al corte.

### 6. `robots.txt`
- En `viajes.trhoncalhomes.com.mx`: `Allow: /` y referencia al sitemap público.
- En hosts de preview: `Disallow: /` y `X-Robots-Tag: noindex, nofollow` para el endpoint de robots.

### 7. `sitemap.xml`
- Sólo se sirve en el host público.
- Se genera dinámicamente desde `/api/master`.
- Incluye home + destinos públicos con slug y `lastmod` cuando existe.

### 8. Canonical
- `assets/js/seo-host.js` inyecta canonical y `og:url` sólo cuando el hostname real es `viajes.trhoncalhomes.com.mx`.
- En previews elimina canonical dinámico.

## Hallazgo SEO/AEO importante
Las fichas `/mexico/<slug>` usan actualmente un shell HTML común y el contenido/título/meta se completa en cliente con JavaScript. Google puede renderizar JavaScript, pero la documentación vigente de Google recomienda renderizado de servidor o prerenderizado cuando sea posible porque no todos los bots ejecutan JavaScript y el HTML inicial es más claro para rastreadores.

### Recomendación
Siguiente mejora técnica prioritaria: servir metadata y contenido principal de cada ficha desde servidor/prerender sin cambiar la experiencia visual. No es un bloqueo para mantener la web en producción, pero sí es importante antes de escalar fuerte SEO/AEO.

## Hallazgo de rutas
`11_Publicacion_Web` conservaba algunos slugs abreviados antiguos. Se corrigieron las 16 rutas públicas para coincidir con los slugs que genera hoy Apps Script.

Riesgo residual: el slug se deriva todavía del nombre visible del destino. Cambiar el nombre podría cambiar la URL. Recomendación futura: incorporar `Slug_Web` estable en el Maestro y hacer que Apps Script lo use con fallback al nombre.

## Archivo Maestro actualizado
- `12_Config_Web!Modo_actual` = `PRODUCCIÓN`.
- Host público y fecha de salida registrados.
- Estado registrado: 16 destinos / 6 destacados / 0 ofertas.
- `11_Publicacion_Web` actualizado a `Publicado v1` para las 16 fichas públicas y rutas actuales.

## Próximo bloque recomendado
1. Mejorar renderizado SEO/AEO de fichas.
2. Añadir slug estable controlado desde Maestro.
3. Pulir copy público de las seis fichas destacadas.
4. Preparar cuarta ola de contenido sin aumentar todavía los seis destacados.
5. Revisar Acapulco por separado antes de publicarlo.
