# Trhoncal Travel V2 — Estado actual

Fecha de corte: 2026-08-24 16:32 (America/Mexico_City)

## Producción
- Host público activo: `https://viajes.trhoncalhomes.com.mx/`.
- DNS creado en GoDaddy mediante CNAME `viajes` → `56b5c49cda876d5a.vercel-dns-017.com`.
- Vercel reconoce el dominio y SSL quedó operativo.
- `main` contiene la web nueva de Trhoncal Travel.
- PR #2 fue integrado a `main`.
- La página vieja quedó preservada en `legacy/viajes-3dhomes-2026-08-24`.
- Snapshot de seguridad de la nueva web: `snapshot/trhoncal-travel-v2-2026-08-24`.
- `viajes.3dhomes.com.mx` ya no está asociado como dominio personalizado del proyecto Vercel.

## Archivo Maestro / CMS inicial
- Google Sheet: `Trhoncal Travel | Archivo Maestro`.
- Spreadsheet ID: `1jVIIMyQuNseDidYkErYDd58Ha3yxJA9oFXleFPjmUJw`.
- Zona horaria: `America/Mexico_City`.
- `12_Config_Web!Modo_actual` actualizado a `PRODUCCIÓN`.
- Host público, SSL, fecha de salida y estado de contenido registrados en `12_Config_Web`.
- `11_Publicacion_Web` actualizado a `Publicado v1` para las 16 fichas públicas.
- Las rutas documentadas se alinearon con los slugs que genera Apps Script actualmente.

## Flujo de datos
- Archivo Maestro → Apps Script → `/api/master` → frontend.
- Apps Script es de solo lectura hacia la web.
- `Mostrar_Web` controla biblioteca pública.
- `Destacado_Home` controla escaparate principal.
- `Orden_Home` controla orden.
- Imágenes sólo salen cuando `Permiso_uso_web = Sí` y existen fuente/licencia/crédito/alt/verificación.
- `/api/master` fue endurecido para no exponer previews del upstream ni detalles internos de errores.

## Contenido público
### Destacados — 6
1. Cancún.
2. Riviera Maya / Playa del Carmen.
3. Puerto Vallarta.
4. Nuevo Nayarit / Bahía de Banderas.
5. Los Cabos / Cabo San Lucas.
6. Bahías de Huatulco.

### Biblioteca secundaria — 10
7. Mazatlán.
8. Ixtapa-Zihuatanejo.
9. Puerto Escondido.
10. Isla Mujeres.
11. Cozumel.
12. Sayulita.
13. La Paz.
14. Tulum.
15. Bacalar.
16. Loreto.

- Total público: 16 destinos.
- Ofertas públicas: 0.
- Acapulco continúa fuera hasta revisión operativa/producto.

## Auditoría de producción 2026-08-24
Documento: `docs/PRODUCTION_AUDIT_2026-08-24.md`.

### Home
- Host real validado visualmente.
- Marca, navegación, CTA, contador de 16 destinos y jerarquía 6 + biblioteca operativos.
- Ofertas permanecen ocultas con 0 registros publicables.

### API
- `api/master.js` conserva GET-only, no-store y validación de payload.
- Errores de producción ya no devuelven preview del upstream ni detalle de excepción al navegador.

### Fichas auditadas
- `/mexico/cancun`
- `/mexico/puerto-vallarta`
- `/mexico/tulum`

Las tres tienen ficha completa en `02_Fichas_Destino`, fuentes asociadas y datos suficientes para renderizar detalle.

### WhatsApp
- Número configurado: `523329335952`.
- CTA general y CTA por destino generan mensaje contextual de Trhoncal Travel.

### Jotform
- ID: `261127730314044`.
- Título: `Cotiza tu viaje con Trhoncal Travel`.
- Estado: ENABLED.
- 14 preguntas; 21 envíos conservados al corte.

### robots / sitemap / canonical
- `robots.txt` permite rastreo sólo en el host público y apunta al sitemap.
- `sitemap.xml` se sirve sólo en `viajes.trhoncalhomes.com.mx` y toma destinos activos desde `/api/master`.
- `seo-host.js` crea canonical y `og:url` en el host público.

## Hallazgo SEO/AEO prioritario
Las fichas `/mexico/<slug>` todavía parten de un shell HTML común y completan contenido, title, meta y canonical en cliente con JavaScript.

Google puede renderizar JavaScript, pero para una arquitectura orientada a SEO/AEO conviene que el contenido principal y metadata de cada ficha lleguen ya en el HTML del servidor/prerender.

Próxima mejora técnica prioritaria: server-side/pre-render de fichas sin cambiar la experiencia visual.

## Hallazgo de URLs
El slug público se deriva actualmente de `Nombre` en Apps Script. Si el nombre visible cambia, podría cambiar la URL.

Mejora recomendada: incorporar un campo estable `Slug_Web` al Maestro y hacer que Apps Script lo utilice con fallback al nombre. No cambiar URLs públicas existentes sin 301.

## Investigación acumulada
- 30/30 destinos iniciales de México con ficha base verificada.
- 177/177 Pueblos Mágicos cargados como índice oficial federal.
- 65/177 Pueblos Mágicos con enriquecimiento individual v1.
- 162 registros de fuente/evidencia en `05_Fuentes`.

## Reglas comerciales vigentes
- Un destino no se publica sólo por ser atractivo: debe tener información suficiente y sentido comercial/operativo.
- Precio, cupo y condiciones permanecen separados del contenido estable.
- Muestras de PriceAgencies no se convierten en ofertas automáticamente.
- Ofertas públicas continúan en 0 hasta selección y reconfirmación expresa.

## Siguiente bloque
1. Mejorar renderizado SEO/AEO de fichas.
2. Estabilizar slugs controlados desde Maestro.
3. Pulir copy público de los 6 destinos destacados.
4. Preparar cuarta ola de contenido sin aumentar todavía los 6 destacados.
5. Revisar Acapulco por separado antes de cualquier activación.
6. Después: Search Console / Bing Webmaster y Open Graph social propio.

## Continuidad
- El historial del chat no es fuente única del proyecto.
- Checkpoint duradero: `docs/CHECKPOINT_MAESTRO_2026-08-24.md`.
- Auditoría de producción: `docs/PRODUCTION_AUDIT_2026-08-24.md`.
- Mantener decisiones estructurales en GitHub y/o Archivo Maestro.
