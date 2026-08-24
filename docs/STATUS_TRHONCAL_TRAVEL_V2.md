# Trhoncal Travel V2 — Estado actual

Fecha de corte: 2026-08-24 14:37 (America/Mexico_City)

## Ya operativo
- Archivo Maestro convertido a Google Sheet nativo.
- Spreadsheet ID: `1jVIIMyQuNseDidYkErYDd58Ha3yxJA9oFXleFPjmUJw`.
- Zona horaria del Sheet: `America/Mexico_City`.
- Apps Script desplegado como web app de solo lectura.
- Frontend usa `/api/master` como fuente primaria y JSON local sólo como fallback de desarrollo.
- Puente Maestro → Apps Script → Vercel → web probado y funcionando en ambos sentidos con Cancún.
- Control editorial: `Mostrar_Web`, `Destacado_Home`, `Orden_Home`.
- Cancún quedó nuevamente en `Mostrar_Web=No` y `Destacado_Home=No` tras la prueba.
- Control de ofertas: publicación sólo con autorización, estado vigente, confirmación de precio y no expiración.
- Ofertas reales activas: 0.
- Capturas/links de PriceAgencies son demostración de herramientas del proveedor; no se convierten en ofertas ni prioridades automáticamente.
- Jotform ID `261127730314044` renombrado y verificado como `Cotiza tu viaje con Trhoncal Travel`; sigue ENABLED con 14 preguntas y 21 submissions al corte.
- Subdominio objetivo inicial: `viajes.trhoncalhomes.com.mx`.
- Despliegue de Vercel sobre el head verificado del PR #2: SUCCESS.

## Investigación acumulada
- 30/30 destinos iniciales de México con ficha base verificada.
- 177/177 Pueblos Mágicos cargados como índice oficial federal.
- 65/177 Pueblos Mágicos con enriquecimiento individual v1.
- 162 registros de fuente/evidencia en `05_Fuentes`.
- Bloques con enriquecimiento individual v1 reportados en el PR: Jalisco, Guanajuato, Guerrero, Hidalgo, Estado de México, Michoacán, Morelos y Nayarit.
- Siguiente bloque: Nuevo León.

## GitHub / despliegue
- Repositorio: `davidcastrosb-ops/viajes-troncal-proyecto-completo`.
- Rama: `feat/trhoncal-travel-knowledge-site-v2`.
- PR #2: `Trhoncal Travel V2 — portal editorial + Maestro control web`.
- Estado: abierto, DRAFT, sin merge.
- Mantener como DRAFT hasta revisión de David.

## Pendiente inmediato
1. Continuar enriquecimiento individual estado por estado; siguiente bloque: Nuevo León.
2. Elegir y documentar primeras imágenes con derechos de uso: URL, fuente, licencia/permiso, crédito y fecha de revisión.
3. Acumular cambios de Apps Script y hacer un solo redeploy cuando exista la primera imagen legal lista.
4. Configurar `viajes.trhoncalhomes.com.mx` cuando el preview visual esté listo.
5. Mantener ofertas en 0 hasta selección expresa de David.

## Continuidad y recuperación
- El historial de ChatGPT NO es fuente única del proyecto.
- Checkpoint duradero creado en `docs/CHECKPOINT_MAESTRO_2026-08-24.md`.
- Si un chat se trunca, recuperar desde: PR #2 → STATUS/CHECKPOINT → `00_Control` del Archivo Maestro → pestañas específicas → Jotform/Vercel según la tarea.
- Las decisiones estructurales y avances materiales deben dejar rastro en GitHub y/o Archivo Maestro para que una falla de interfaz no implique pérdida del trabajo.
