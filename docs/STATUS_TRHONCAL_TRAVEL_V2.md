# Trhoncal Travel V2 — Estado actual

Fecha de corte: 2026-08-24 18:05 (America/Mexico_City)

## Producción
- Host público activo: `https://viajes.trhoncalhomes.com.mx/`.
- DNS en GoDaddy: CNAME `viajes` → `56b5c49cda876d5a.vercel-dns-017.com`.
- SSL operativo.
- `main` contiene la web nueva de Trhoncal Travel.
- PR #2 integrado: portal editorial + Archivo Maestro.
- PR #4 integrado: fichas server-rendered + slugs estables.
- PR #5 integrado: carrusel visible/móvil + FAQ + corrección visual H1 en fichas.
- Commit UX producción: `dc07891f8447ba1a064bda1472924071fb17b804`.
- Vercel reportó SUCCESS para ese commit.
- La página antigua quedó preservada en `legacy/viajes-3dhomes-2026-08-24`.
- Snapshot de seguridad de la nueva web: `snapshot/trhoncal-travel-v2-2026-08-24`.
- `viajes.3dhomes.com.mx` ya no está asociado como dominio personalizado del proyecto Vercel.

## Archivo Maestro / CMS inicial
- Google Sheet: `Trhoncal Travel | Archivo Maestro`.
- Spreadsheet ID: `1jVIIMyQuNseDidYkErYDd58Ha3yxJA9oFXleFPjmUJw`.
- Zona horaria: `America/Mexico_City`.
- `Modo_actual = PRODUCCIÓN`.
- `Slug_Web` agregado y cargado para 30/30 destinos sin cambiar las URLs públicas actuales.
- `Mostrar_Web` controla biblioteca pública.
- `Destacado_Home` controla escaparate principal.
- `Orden_Home` controla orden.
- Imágenes sólo salen cuando tienen permiso, fuente/licencia, crédito, alt y verificación.

## Flujo de datos
- Archivo Maestro → Apps Script → `/api/master` → frontend/SSR.
- Apps Script es de solo lectura hacia la web.
- `api/master.js` no expone previews del upstream ni detalles internos de errores.
- Apps Script Web App actualizado a versión 4 el 2026-08-24.
- La implementación conserva el mismo ID y la misma URL `/exec` usada por Vercel.
- El endpoint desplegado ya usa `Slug_Web` con fallback a `Nombre` y caché `public-payload-v2`.
- Respuesta JSON confirmada después del despliegue: 16 destinos públicos, slugs estables y 0 ofertas.
- Slugs de control confirmados en la respuesta: `cancun`, `puerto-vallarta` y `tulum`.

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
- Acapulco permanece fuera hasta revisión operativa/producto.

## UX / descubrimiento
- La biblioteca secundaria ahora usa un carrusel híbrido controlado por los destinos públicos del Maestro.
- Desktop: muestra varias tarjetas y ofrece controles con texto `Anterior` / `Siguiente`, contador y `Ver todos`.
- Móvil: swipe horizontal y una fracción de la siguiente tarjeta visible para indicar continuidad.
- Autoplay cada ~5.5 s solamente cuando no hay interacción; se pausa con hover, foco, touch o uso manual.
- Botón explícito para `Pausar movimiento` / `Reanudar movimiento`.
- `prefers-reduced-motion` desactiva autoplay y movimiento suave.
- Se agregó FAQ pública con 6 preguntas sobre cotización, producto, ofertas, datos necesarios, fuentes y asesoría sin destino definido.
- Se corrigió el contraste del H1/H2 de las fichas SSR para que el nombre del destino sea visible sobre fondo petróleo.

## SEO/AEO
- Home con title, description, Open Graph y JSON-LD básico de Organization.
- `robots.txt` permite rastreo sólo en el host público.
- `sitemap.xml` toma dinámicamente los destinos públicos desde `/api/master`.
- Canonical y `og:url` se fijan al host público.
- Las fichas `/mexico/<slug>` ya se renderizan desde servidor mediante `api/destination.js`.
- Cada ficha SSR incluye HTML principal, title, description, canonical, Open Graph, robots, JSON-LD `TouristDestination` y `BreadcrumbList`, fuentes y CTA.
- Previews mantienen `noindex,nofollow`.
- Regla permanente: `Slug_Web` no cambia después de publicar sin plan 301.

## Auditorías y checkpoints
- `docs/PRODUCTION_AUDIT_2026-08-24.md`.
- `docs/SEO_SSR_PREVIEW_2026-08-24.md` — rollout integrado.
- `docs/CHECKPOINT_MAESTRO_2026-08-24.md`.
- `10_Revisiones`: REV-037 salida a producción; REV-038 auditoría SEO/AEO; REV-039 slugs estables; REV-040 SSR integrado a `main`; REV-041 Apps Script v4 + endpoint confirmado; REV-042 corrección CSS SSR; REV-043 carrusel + FAQ + UX móvil.

## Jotform / conversión
- Jotform ID `261127730314044`.
- Título: `Cotiza tu viaje con Trhoncal Travel`.
- Estado ENABLED.
- WhatsApp configurado: `523329335952`.
- CTA por destino genera mensaje contextual.

## Investigación acumulada
- 30/30 destinos iniciales de México con ficha base verificada.
- 177/177 Pueblos Mágicos cargados como índice oficial federal.
- 65/177 Pueblos Mágicos con enriquecimiento individual v1.
- 162 registros de fuente/evidencia en `05_Fuentes`.

## Cuarta ola preparada — NO PUBLICADA
- Ciudad de México.
- Guadalajara.
- Tequila.
- Oaxaca de Juárez.
- Mérida.
- Imágenes y licencias listas; `Mostrar_Web` permanece en No hasta validación comercial.

## Siguiente bloque
1. Revisión visual en producción del carrusel en escritorio y celular.
2. Pulir copy público de los 6 destinos destacados.
3. Diseñar el segundo carrusel por intención de viaje (familia, pareja, playa, cultura, naturaleza) sin inventario vivo.
4. Evaluar comercialmente Guadalajara + Tequila antes de activar la cuarta ola.
5. Después: Search Console / Bing Webmaster y Open Graph social propio.

## Reglas comerciales vigentes
- Un destino no se publica sólo por ser atractivo: debe tener información suficiente y sentido comercial/operativo.
- Precio, cupo y condiciones permanecen separados del contenido estable.
- Muestras de PriceAgencies no se convierten en ofertas automáticamente.
- Ofertas públicas continúan en 0 hasta selección y reconfirmación expresa.

## Continuidad
- El historial del chat no es fuente única del proyecto.
- Decisiones estructurales y avances materiales deben quedar en GitHub y/o Archivo Maestro.
