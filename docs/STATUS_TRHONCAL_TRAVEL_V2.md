# Trhoncal Travel V2 — Estado actual

Fecha de corte: 2026-08-24 15:24 (America/Mexico_City)

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
- Capturas/links de PriceAgencies son demostración de herramientas del proveedor; no se convierten en ofertas ni prioridades automáticamente.
- Jotform ID `261127730314044` renombrado y verificado como `Cotiza tu viaje con Trhoncal Travel`.
- Subdominio objetivo inicial: `viajes.trhoncalhomes.com.mx`.

## Primera ola visual — completada 2026-08-24
- Se estableció en `00_Control` una regla de trazabilidad visual: cada destino publicado debe registrar imagen, fuente, licencia/permiso, crédito, alt text y fecha de verificación de derechos.
- Las 6 playas iniciales ya tienen imagen principal autorizada desde el Archivo Maestro.
- Cancún: foto aérea de costa y zona hotelera; Angel Valladares / Pexels.
- Riviera Maya / Playa del Carmen: frente de playa y ciudad; hugoteconecta / Pexels.
- Puerto Vallarta: se sustituyó la imagen documental anterior por un atardecer de playa más aspiracional; Elmira Danilova / Pexels.
- Nuevo Nayarit / Bahía de Banderas: amanecer de playa; Luis Delgado / Pexels.
- Los Cabos / Cabo San Lucas: El Arco con actividad marítima; Joanie Tidwell / Pexels.
- Bahías de Huatulco: vista aérea de playa y agua clara; Jorge Pantaleon / Pexels.
- Licencia registrada para las 6: `Pexels License`; derechos verificados 2026-08-24.
- `brand-v2.css` uniforma la ventana fotográfica a relación 16:9, altura visual consistente, tarjetas estiradas por fila y crédito legible.
- Las imágenes siguen controladas desde `01_Destinos`; una imagen sin `Permiso_uso_web = Sí` no sale por el Apps Script.

## Segunda ola de playas — activada 2026-08-24
- Se activaron 7 destinos adicionales desde el Archivo Maestro con imagen, licencia, crédito, alt text y verificación de derechos.
- Orden web 7: Mazatlán — Isla Venados; Mafer Castañeda / Pexels.
- Orden web 8: Ixtapa-Zihuatanejo — actividad de paddle frente al mar en Zihuatanejo; Jorge Acre / Pexels.
- Orden web 9: Puerto Escondido — playa tropical y vegetación; Mafer Castañeda / Pexels.
- Orden web 10: Isla Mujeres — vista aérea de aguas turquesa; carlos meza / Pexels.
- Orden web 11: Cozumel — playa caribeña aérea; Luis Flores / Pexels.
- Orden web 12: Sayulita — costa y pueblo vistos desde el aire; Archie McNicol / Pexels.
- Orden web 13: La Paz — Playa Balandra; Josué Rodríguez / Pexels.
- Licencia registrada para las 7: `Pexels License`; derechos verificados 2026-08-24.
- Total de destinos activados para la web: 13.
- Los 6 de primera ola conservan `Destacado_Home = Sí`; los 7 de segunda ola quedan públicos pero no marcados como destacados.
- `site.js` incorpora fallback: si una imagen remota falla, la tarjeta vuelve automáticamente al tratamiento gráfico de Trhoncal en vez de mostrar una imagen rota.

## Jerarquía nueva del home — implementada 2026-08-24
- El home ya diferencia entre `publicado` y `destacado`; son decisiones distintas.
- `Mostrar_Web = Sí` incorpora un destino a la biblioteca pública.
- `Destacado_Home = Sí` lo coloca en el primer escaparate del home.
- Límite operativo del escaparate principal: 6 destinos.
- `Orden_Home` sigue controlando el orden.
- El primer bloque muestra los 6 destinos destacados con distintivo `Selección Trhoncal`.
- Un segundo bloque `Más destinos de México` muestra los destinos públicos restantes sin saturar el primer pantallazo.
- Los filtros Playa / Cultura / Naturaleza / Pueblo Mágico operan sobre ambos bloques.
- Las fichas completas y sus rutas `/mexico/<slug>` funcionan tanto en el bloque destacado como en la biblioteca secundaria.
- La jerarquía quedó documentada también en `00_Control`, `12_Config_Web` y `assets/data/site.json`.

## SEO/AEO técnico inicial
- Título de home actualizado a `Trhoncal Travel | Destinos de México y cotización personalizada`.
- Meta descripción orientada a destinos + información revisada + cotización.
- Open Graph básico incorporado: tipo, sitio, título y descripción.
- Marcado JSON-LD básico de `Organization` incorporado con la marca Trhoncal Travel y correo comercial.
- Las rutas limpias de destino continúan actualizando título y descripción de la página según la ficha abierta.
- Canonical y sitemap se dejarán para el momento en que `viajes.trhoncalhomes.com.mx` esté resolviendo correctamente, para no canonizar a un host todavía no publicado.

## Decisión comercial vigente — prioridad playas
- David decidió pausar temporalmente el enriquecimiento de Nuevo León.
- La prioridad inmediata pasa a destinos de playa con salida incremental a la web; no se esperará a terminar toda la base nacional para publicar.
- Primera ola: Cancún, Riviera Maya / Playa del Carmen, Puerto Vallarta, Nuevo Nayarit / Bahía de Banderas, Los Cabos / Cabo San Lucas y Bahías de Huatulco.
- Segunda ola: Mazatlán, Ixtapa-Zihuatanejo, Puerto Escondido, Isla Mujeres, Cozumel, Sayulita y La Paz.
- Guadalajara y Tequila permanecen fuera de publicación por ahora para mantener la primera versión pública enfocada comercialmente en playa.
- Acapulco permanece pendiente de revisión operativa y de producto antes de activarse, por su proceso de recuperación.

## Razón de la primera fase
- La selección combina destinos ya verificados en el Maestro con señales oficiales recientes de demanda/ocupación y potencial comercial.
- DataTur 2026 coloca de manera recurrente entre los destinos de mayor ocupación a varios integrantes de la primera ola.
- Esta señal sirve para priorizar investigación y publicación; no equivale por sí sola a margen, comisión o rentabilidad de Trhoncal.

## Investigación acumulada
- 30/30 destinos iniciales de México con ficha base verificada.
- 177/177 Pueblos Mágicos cargados como índice oficial federal.
- 65/177 Pueblos Mágicos con enriquecimiento individual v1.
- 162 registros de fuente/evidencia en `05_Fuentes`.
- Nuevo León queda pendiente hasta que termine la primera fase comercial de playas.

## Método de publicación incremental
1. Publicar primero destinos ya verificados y comercialmente fuertes.
2. Mejorar cada ficha con imagen legal, contenido editorial, CTA y SEO/AEO.
3. Añadir nuevas tandas sin esperar a que toda la base nacional esté perfecta.
4. Mantener precios/ofertas separados y publicar sólo cuando David seleccione producto real y se reconfirme vigencia.
5. No frenar la web por investigación de destinos secundarios.

## GitHub / despliegue
- Repositorio: `davidcastrosb-ops/viajes-troncal-proyecto-completo`.
- Rama: `feat/trhoncal-travel-knowledge-site-v2`.
- PR #2: `Trhoncal Travel V2 — portal editorial + Maestro control web`.
- Estado: abierto, DRAFT, sin merge.
- Mantener como DRAFT hasta revisión de David.

## Pendiente inmediato
1. Revisar visualmente el nuevo home jerarquizado: 6 destacados + biblioteca secundaria.
2. Preparar `viajes.trhoncalhomes.com.mx` sin cambiar DNS hasta que Vercel muestre el registro exacto requerido.
3. Al quedar el subdominio resolviendo: agregar canonical, sitemap y validaciones finales de indexación.
4. Revisar Acapulco antes de decidir si entra a una siguiente ola.
5. Mantener ofertas en 0 hasta selección expresa de David.

## Continuidad y recuperación
- El historial de ChatGPT NO es fuente única del proyecto.
- Checkpoint duradero creado en `docs/CHECKPOINT_MAESTRO_2026-08-24.md`.
- Si un chat se trunca, recuperar desde: PR #2 → STATUS/CHECKPOINT → `00_Control` del Archivo Maestro → pestañas específicas → Jotform/Vercel según la tarea.
- Las decisiones estructurales y avances materiales deben dejar rastro en GitHub y/o Archivo Maestro para que una falla de interfaz no implique pérdida del trabajo.
