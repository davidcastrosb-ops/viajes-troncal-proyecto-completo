# Trhoncal Travel V2 — Estado actual

Fecha de corte: 2026-08-24 15:36 (America/Mexico_City)

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
- Subdominio objetivo inicial: `viajes.trhoncalhomes.com.mx`.

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

### Tercera ola — activada 2026-08-24
14. Tulum — imagen Camilo Laverde / Pexels.
15. Bacalar — imagen Carlos Bedoy / Pexels.
16. Loreto — imagen Jorge Sandoval Lopez / Pexels.

- Total público: 16 destinos.
- Sólo los primeros 6 conservan `Destacado_Home = Sí`.
- Los destinos 7–16 quedan en la biblioteca secundaria y no saturan el escaparate inicial.
- Acapulco permanece fuera hasta revisión operativa/producto.

## Control visual
- Toda imagen pública exige URL, fuente, licencia/permiso, crédito, alt text y fecha de verificación.
- Licencia registrada en las olas actuales: `Pexels License`.
- `Permiso_uso_web = Sí` es requisito para que Apps Script exponga la imagen.
- Si una imagen remota falla, el frontend vuelve al tratamiento gráfico de Trhoncal en vez de mostrar imagen rota.
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
- `robots.txt` quedó protegido por host: previews reciben `Disallow: /` y `X-Robots-Tag: noindex, nofollow`.
- `sitemap.xml` sólo se sirve cuando el host es exactamente `viajes.trhoncalhomes.com.mx`.
- `assets/js/seo-host.js` crea canonical y `og:url` únicamente en el host público real; no canoniza previews.
- El sitemap toma dinámicamente los destinos públicos desde `/api/master`, por lo que al activar o desactivar destinos cambia sin mantener una lista manual.
- Todo queda listo para activarse automáticamente en cuanto Vercel y DNS hagan resolver el subdominio.

## Readiness de subdominio
- Documento operativo: `docs/SUBDOMINIO_VIAJES_READINESS.md`.
- No se ha tocado DNS.
- Flujo seguro: Vercel Project Settings → Domains → agregar `viajes.trhoncalhomes.com.mx` → copiar el registro exacto mostrado por Vercel → crear únicamente el host `viajes` en el DNS actual → esperar validación/HTTPS.
- No tocar raíz, `www`, MX, SPF, DKIM, DMARC ni registros de Trhoncal Homes.
- Vercel documenta actualmente que los subdominios usan CNAME y que el dashboard muestra el destino específico del proyecto; prevalece siempre el valor que muestre el proyecto en ese momento.

## Investigación acumulada
- 30/30 destinos iniciales de México con ficha base verificada.
- 177/177 Pueblos Mágicos cargados como índice oficial federal.
- 65/177 Pueblos Mágicos con enriquecimiento individual v1.
- 162 registros de fuente/evidencia en `05_Fuentes`.
- Nuevo León permanece pausado mientras avanza la fase comercial de playas.

## Reglas comerciales que siguen vigentes
- Un destino bonito no se publica sólo por ser bonito: debe tener información suficiente y sentido comercial/operativo.
- Oferta, precio, cupo y condiciones permanecen separados del contenido estable.
- Capturas/links de PriceAgencies siguen siendo demostraciones del proveedor salvo selección expresa de producto real.
- Ofertas públicas continúan en 0.

## GitHub / despliegue
- Repositorio: `davidcastrosb-ops/viajes-troncal-proyecto-completo`.
- Rama: `feat/trhoncal-travel-knowledge-site-v2`.
- PR #2: `Trhoncal Travel V2 — portal editorial + Maestro control web`.
- Estado: abierto, DRAFT, sin merge.

## Pendiente inmediato
1. Conectar `viajes.trhoncalhomes.com.mx` al proyecto Vercel correcto y copiar el registro DNS exacto que Vercel solicite.
2. Confirmar HTTPS y probar home, `/api/master`, `/robots.txt`, `/sitemap.xml` y tres fichas.
3. Verificar canonical en home y fichas ya sobre el host real.
4. Revisar Acapulco antes de decidir si entra a una cuarta ola.
5. Continuar profundidad editorial/SEO de las fichas ya públicas sin aumentar los 6 destacados.
6. Mantener ofertas en 0 hasta selección expresa de David.

## Continuidad y recuperación
- El historial de ChatGPT NO es fuente única del proyecto.
- Checkpoint duradero: `docs/CHECKPOINT_MAESTRO_2026-08-24.md`.
- Recuperación: PR #2 → STATUS/CHECKPOINT → `00_Control` del Archivo Maestro → pestañas específicas → Jotform/Vercel según la tarea.
- Las decisiones estructurales y avances materiales deben dejar rastro en GitHub y/o Archivo Maestro.
