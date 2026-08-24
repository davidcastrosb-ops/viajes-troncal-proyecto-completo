# Trhoncal Travel — Checkpoint maestro de continuidad

Fecha de corte: 2026-08-24 14:37 (America/Mexico_City)

## Objetivo de este archivo
Este documento existe para que el proyecto no dependa del historial visual de un chat. Si una conversación se trunca, desaparecen mensajes o se cambia de chat, la continuidad debe reconstruirse desde activos verificables: GitHub, Archivo Maestro, Jotform y despliegues.

## Estado verificado del proyecto

### GitHub / Vercel
- Repositorio: `davidcastrosb-ops/viajes-troncal-proyecto-completo`.
- Rama de desarrollo: `feat/trhoncal-travel-knowledge-site-v2`.
- PR #2: `Trhoncal Travel V2 — portal editorial + Maestro control web`.
- Estado del PR: abierto, DRAFT, sin merge.
- Head verificado al corte: `f6f096050e0ae80568711eba2f1aa32ba64c5481`.
- Vercel sobre ese head: SUCCESS.
- El PR acumula 66 commits y 25 archivos cambiados al corte.
- `/api/master` funciona como proxy de solo lectura hacia Apps Script.
- El control Maestro → Apps Script → web fue probado en ambos sentidos con Cancún.

### Archivo Maestro Google Sheets
- Archivo: `Trhoncal Travel | Archivo Maestro`.
- Spreadsheet ID: `1jVIIMyQuNseDidYkErYDd58Ha3yxJA9oFXleFPjmUJw`.
- Zona horaria: `America/Mexico_City`.
- 30 destinos candidatos iniciales.
- 30 destinos con ficha base verificada.
- 177/177 Pueblos Mágicos cargados como índice federal.
- 65/177 Pueblos Mágicos con enriquecimiento individual v1.
- 162 registros de fuente/evidencia.
- 0 ofertas reales activas.
- Control web operativo con `Mostrar_Web`, `Destacado_Home` y `Orden_Home`.
- Al corte, Cancún está nuevamente con `Mostrar_Web=No` y `Destacado_Home=No`.
- Regla vigente: dato sin fuente + fecha de verificación = no publicable; precio/cupo sin reconfirmación = oferta no publicable.

### Jotform
- Form ID: `261127730314044`.
- Título verificado: `Cotiza tu viaje con Trhoncal Travel`.
- Estado: ENABLED.
- 14 preguntas.
- 21 submissions existentes al corte.
- No se debe romper el flujo comercial ya conectado.

### Marca / web
- Marca pública: Trhoncal Travel.
- Razón social operadora: Trhoncal Homes S.A.S. de C.V.; no usar como marca visible al cliente salvo necesidad legal.
- El repo contiene `assets/images/trhoncal-travel-logo.svg`.
- Subdominio objetivo inicial: `viajes.trhoncalhomes.com.mx`.
- La web es informativa, inspiracional y de captación; no es motor de reservas.
- Ofertas de proveedor nunca se publican automáticamente por aparecer en una captura, link o muestra.

## Investigación y contenido acumulado
- 30/30 destinos iniciales de México con base verificada.
- 177/177 Pueblos Mágicos indexados.
- Enriquecimiento individual v1 completado hasta 65 pueblos, incluyendo Jalisco, Guanajuato, Guerrero, Hidalgo, Estado de México, Michoacán, Morelos y Nayarit según el estado reportado en el PR.
- Siguiente bloque de enriquecimiento: Nuevo León.

## Pendiente inmediato
1. Continuar enriquecimiento individual estado por estado; siguiente bloque: Nuevo León.
2. Mantener PR #2 como DRAFT y no hacer merge hasta revisión de David.
3. Acumular cambios de Apps Script y hacer un solo redeploy cuando exista la primera imagen legal/documentada lista.
4. Elegir y registrar primeras imágenes con URL, fuente, licencia/permiso, crédito y fecha de revisión.
5. Configurar `viajes.trhoncalhomes.com.mx` cuando el preview visual esté suficientemente listo.
6. Mantener ofertas reales en 0 hasta que David seleccione expresamente una promoción/producto.

## Protocolo anti-pérdida
A partir de este checkpoint, el chat NO será la única memoria operativa.

Después de cada bloque importante se debe actualizar, en este orden:
1. `00_Control` del Archivo Maestro si cambian métricas, prioridades o publicación.
2. PR #2 / commits de GitHub si cambia código, configuración o arquitectura.
3. `docs/STATUS_TRHONCAL_TRAVEL_V2.md` para estado corriente.
4. Este checkpoint o uno nuevo fechado cuando haya una decisión estructural o un avance material.

Si el historial del chat vuelve a fallar, reconstruir continuidad así:
1. Leer el body actual del PR #2.
2. Leer `docs/STATUS_TRHONCAL_TRAVEL_V2.md` y el último `CHECKPOINT_MAESTRO_*.md`.
3. Leer `00_Control`, `01_Destinos`, `04_Pueblos_Magicos`, `05_Fuentes`, `07_Ofertas_Vigentes` y `12_Config_Web` del Archivo Maestro según la tarea.
4. Verificar Jotform y Vercel sólo cuando la tarea toque captación o despliegue.
5. Reanudar desde activos verificados, nunca desde una reconstrucción de memoria no comprobada.

## Regla de gobernanza
- David decide publicación, promociones, precios y prioridades comerciales.
- El comité y el asistente detectan inconsistencias y riesgos, pero no convierten ejemplos de proveedor en ofertas ni prioridades sin autorización expresa.
- Sanity queda pospuesto; Google Sheets + Apps Script es el CMS/control inicial.
- El objetivo de continuidad es que una falla de interfaz de ChatGPT no implique pérdida real del proyecto.
