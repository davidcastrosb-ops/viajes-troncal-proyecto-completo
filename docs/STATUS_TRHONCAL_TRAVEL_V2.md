# Trhoncal Travel V2 — Estado actual

Fecha de corte: 2026-08-24 20:21 (America/Mexico_City)

## Producción
- Host público activo: `https://viajes.trhoncalhomes.com.mx/`.
- DNS en GoDaddy: CNAME `viajes` → `56b5c49cda876d5a.vercel-dns-017.com`.
- SSL operativo.
- `main` contiene la web nueva de Trhoncal Travel.
- PR #2 integrado: portal editorial + Archivo Maestro.
- PR #4 integrado: fichas server-rendered + slugs estables.
- PR #5 integrado: carrusel visible/móvil + FAQ + corrección visual H1 en fichas.
- PR #6 integrado: carrusel por intención de viaje + filtros comerciales.
- PR #7 integrado: favicon global + títulos comerciales + hero emocional + arquitectura segura de promos.
- Commit actual de producción: `dc6bd77b228ed2ebb3e9f6e832d847fd9afe13b4`.
- Vercel reportó SUCCESS para ese commit.
- La página antigua quedó preservada en `legacy/viajes-3dhomes-2026-08-24`.
- `viajes.3dhomes.com.mx` ya no está asociado como dominio personalizado del proyecto Vercel.

## Archivo Maestro / CMS inicial
- Google Sheet: `Trhoncal Travel | Archivo Maestro`.
- Spreadsheet ID: `1jVIIMyQuNseDidYkErYDd58Ha3yxJA9oFXleFPjmUJw`.
- Zona horaria: `America/Mexico_City`.
- `Modo_actual = PRODUCCIÓN`.
- `Slug_Web` cargado para 30/30 destinos sin cambiar URLs públicas.
- `Mostrar_Web` controla biblioteca pública; `Destacado_Home` y `Orden_Home` controlan escaparate.
- Imágenes sólo salen cuando tienen permiso, fuente/licencia, crédito, alt y verificación.
- `07_Ofertas_Vigentes` conserva `URL_Promo_Compartir` y agrega `Enlace_Publico_Autorizado` como gate para futuros enlaces externos.

## Flujo de datos
- Archivo Maestro → Apps Script v4 → `/api/master` → frontend/SSR.
- Apps Script es de solo lectura hacia la web.
- Respuesta JSON confirmada: 16 destinos públicos, slugs estables y 0 ofertas.

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

## UX / descubrimiento
- Biblioteca secundaria con carrusel híbrido: Anterior/Siguiente, contador, Ver todos, autoplay pausado por interacción, swipe móvil y reduced-motion.
- Segunda capa `Viaja según lo que buscas`: Familia, Pareja, Playa, Cultura, Naturaleza y Gastronomía.
- FAQ pública con 6 preguntas comerciales.
- Home renovada con hero emocional basado en imágenes de destinos públicos con derechos verificados, en lugar de usar el logo grande como único protagonista.
- El logo permanece como sello de marca discreto dentro del hero.
- Título comercial de home: `Atrévete a viajar | Trhoncal Travel`.
- Fichas usan formato: `<Destino>: inspírate y viaja | Trhoncal Travel`.
- Favicon/logo cargado en home, fichas y páginas de error de destino.

## Promociones dinámicas
- El hero ya contiene una franja de promociones oculta mientras no existan ofertas públicas.
- Cuando existan ofertas publicables puede mostrar destino, precio/precio desde, noches y vigencia.
- CTA por defecto permanece en Trhoncal/WhatsApp.
- Un link externo sólo debe salir si llega como `publicUrl` autorizado desde la capa pública.
- Regla: un link público normal de PriceTravel no se activa automáticamente como CTA de Trhoncal; debe validarse que conserve relación/comisión o que sea un enlace de cliente/agencia autorizado.
- Documento de decisión: `docs/DECISION_HERO_PROMOS_2026-08-24.md`.

## SEO/AEO
- Home con title, description, Open Graph y JSON-LD básico de Organization.
- `robots.txt`, `sitemap.xml`, canonical y `og:url` configurados para host público.
- Fichas `/mexico/<slug>` renderizadas desde servidor con `TouristDestination` + `BreadcrumbList`.
- Previews mantienen `noindex,nofollow`.
- Regla permanente: `Slug_Web` no cambia después de publicar sin plan 301.

## Auditorías y checkpoints
- `docs/PRODUCTION_AUDIT_2026-08-24.md`.
- `docs/SEO_SSR_PREVIEW_2026-08-24.md`.
- `docs/CHECKPOINT_MAESTRO_2026-08-24.md`.
- `docs/DECISION_HERO_PROMOS_2026-08-24.md`.
- `10_Revisiones`: REV-037 a REV-045; REV-045 registra favicon + títulos + hero emocional + gate de promos.

## Jotform / conversión
- Jotform ID `261127730314044` — `Cotiza tu viaje con Trhoncal Travel` — ENABLED.
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
- Imágenes/licencias listas; `Mostrar_Web` permanece en No hasta validación comercial.

## Siguiente bloque
1. Revisión visual de hero emocional en desktop y celular.
2. Definir/validar el primer enlace de cliente de PriceAgencies/PriceTravel antes de exponer proveedor directo.
3. Cuando exista la primera oferta real, actualizar Apps Script para exponer `publicUrl` sólo si `Enlace_Publico_Autorizado = Sí`.
4. Pulir copy de los 6 destinos destacados.
5. Evaluar Guadalajara + Tequila y luego arquitectura de tours/circuitos.

## Reglas comerciales vigentes
- Un destino no se publica sólo por ser atractivo: debe tener sentido comercial/operativo.
- Precio, cupo y condiciones permanecen separados del contenido estable.
- Muestras de proveedores no se convierten en ofertas automáticamente.
- Ofertas públicas continúan en 0 hasta selección y reconfirmación expresa.

## Continuidad
- El historial del chat no es fuente única del proyecto.
- Decisiones estructurales y avances materiales quedan en GitHub y/o Archivo Maestro.
