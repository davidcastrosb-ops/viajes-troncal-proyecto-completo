# Trhoncal Travel V2 — Estado actual

Fecha de corte: 2026-08-24 16:20 (America/Mexico_City)

## Producción y separación de legado
- `main` ya contiene la nueva web de Trhoncal Travel.
- PR #2 fue integrado a `main` mediante squash merge.
- Commit de producción base: `7b45cb8a1f853824313fee2b55fad2c394ec610b`.
- Vercel confirmó el despliegue de ese commit con estado `SUCCESS`.
- `viajes.3dhomes.com.mx` fue retirado de los dominios personalizados del proyecto Vercel.
- La página antigua quedó preservada en `legacy/viajes-3dhomes-2026-08-24`.
- La versión nueva previa al merge quedó preservada en `snapshot/trhoncal-travel-v2-2026-08-24`.
- El dominio comercial objetivo queda exclusivamente en `viajes.trhoncalhomes.com.mx`.
- Pendiente de limpieza externa: si todavía existe el registro DNS de `viajes.3dhomes.com.mx` en el proveedor DNS de `3dhomes.com.mx`, retirarlo posteriormente sin tocar ningún otro registro.

## Ya operativo
- Archivo Maestro convertido a Google Sheet nativo.
- Spreadsheet ID: `1jVIIMyQuNseDidYkErYDd58Ha3yxJA9oFXleFPjmUJw`.
- Zona horaria del Sheet: `America/Mexico_City`.
- Apps Script desplegado como web app de solo lectura.
- Frontend usa `/api/master` como fuente primaria y JSON local sólo como fallback de desarrollo.
- Puente Maestro → Apps Script → Vercel → web probado y funcionando en ambos sentidos.
- Control editorial: `Mostrar_Web`, `Destacado_Home`, `Orden_Home`.
- Control de ofertas: publicación sólo con autorización, estado vigente, confirmación de precio y no expiración.
- Ofertas reales activas: 0.
- Jotform ID `261127730314044` renombrado y verificado como `Cotiza tu viaje con Trhoncal Travel`.

## Destinos públicos
### Primera ola — destacados
1. Cancún.
2. Riviera Maya / Playa del Carmen.
3. Puerto Vallarta.
4. Nuevo Nayarit / Bahía de Banderas.
5. Los Cabos / Cabo San Lucas.
6. Bahías de Huatulco.

### Segunda ola — biblioteca pública
7. Mazatlán.
8. Ixtapa-Zihuatanejo.
9. Puerto Escondido.
10. Isla Mujeres.
11. Cozumel.
12. Sayulita.
13. La Paz.

### Tercera ola
14. Tulum.
15. Bacalar.
16. Loreto.

- Total público: 16 destinos.
- Sólo los primeros 6 conservan `Destacado_Home = Sí`.
- Los destinos 7–16 quedan en la biblioteca secundaria.
- Acapulco permanece fuera hasta revisión operativa/producto.

## Control visual
- Toda imagen pública exige URL, fuente, licencia/permiso, crédito, alt text y fecha de verificación.
- `Permiso_uso_web = Sí` es requisito para que Apps Script exponga la imagen.
- Si una imagen remota falla, el frontend vuelve al tratamiento gráfico de Trhoncal.
- Las tarjetas usan relación 16:9 y jerarquía visual consistente.

## Jerarquía del home
- `Mostrar_Web = Sí` publica el destino.
- `Destacado_Home = Sí` lo coloca en el primer escaparate.
- Límite del escaparate principal: 6.
- Los demás destinos públicos aparecen en `Más destinos de México`.
- Los filtros Playa / Cultura / Naturaleza / Pueblo Mágico operan sobre ambos bloques.
- Las fichas completas `/mexico/<slug>` funcionan en ambos niveles.

## SEO/AEO técnico
- Home con título, descripción, Open Graph y JSON-LD básico de Organization.
- `robots.txt` bloquea previews y sólo permite rastreo en el host público definitivo.
- `sitemap.xml` sólo se sirve cuando el host es exactamente `viajes.trhoncalhomes.com.mx`.
- `assets/js/seo-host.js` crea canonical y `og:url` únicamente en el host público real.
- El sitemap toma dinámicamente los destinos públicos desde `/api/master`.

## Readiness de subdominio
- Documento operativo: `docs/SUBDOMINIO_VIAJES_READINESS.md`.
- El proyecto Vercel ya quedó sin `viajes.3dhomes.com.mx`.
- La nueva web ya es la producción de `main` en el dominio técnico de Vercel.
- Siguiente paso seguro: agregar `viajes.trhoncalhomes.com.mx` al proyecto → copiar el registro DNS exacto mostrado por Vercel → crear únicamente el host `viajes` en el DNS de `trhoncalhomes.com.mx` → esperar validación/HTTPS.
- No tocar raíz, `www`, MX, SPF, DKIM, DMARC ni otros registros de Trhoncal Homes.

## Investigación acumulada
- 30/30 destinos iniciales de México con ficha base verificada.
- 177/177 Pueblos Mágicos cargados como índice oficial federal.
- 65/177 Pueblos Mágicos con enriquecimiento individual v1.
- 162 registros de fuente/evidencia en `05_Fuentes`.

## Reglas comerciales vigentes
- Un destino no se publica sólo por ser atractivo: debe tener información suficiente y sentido comercial/operativo.
- Oferta, precio, cupo y condiciones permanecen separados del contenido estable.
- Capturas/links de PriceAgencies son demostraciones del proveedor salvo selección expresa de producto real.
- Ofertas públicas continúan en 0.

## GitHub / despliegue
- Repositorio: `davidcastrosb-ops/viajes-troncal-proyecto-completo`.
- Rama de producción: `main`.
- PR #2: integrado y cerrado por merge.
- Respaldo legado: `legacy/viajes-3dhomes-2026-08-24`.
- Snapshot nueva: `snapshot/trhoncal-travel-v2-2026-08-24`.

## Pendiente inmediato
1. Agregar `viajes.trhoncalhomes.com.mx` al proyecto Vercel.
2. Copiar y crear únicamente el registro DNS exacto que Vercel solicite.
3. Confirmar HTTPS y probar home, `/api/master`, `/robots.txt`, `/sitemap.xml` y al menos tres fichas.
4. Verificar canonical en home y fichas sobre el host real.
5. Mantener ofertas en 0 hasta selección expresa de producto real.

## Continuidad y recuperación
- El historial de ChatGPT no es fuente única del proyecto.
- Checkpoint duradero: `docs/CHECKPOINT_MAESTRO_2026-08-24.md`.
- Las decisiones estructurales y avances materiales deben dejar rastro en GitHub y/o Archivo Maestro.
