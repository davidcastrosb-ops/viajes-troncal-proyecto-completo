# Trhoncal Travel V2 — Estado actual

Fecha de corte: 2026-08-24 14:42 (America/Mexico_City)

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

## Decisión comercial vigente — prioridad playas
- David decidió pausar temporalmente el enriquecimiento de Nuevo León.
- La prioridad inmediata pasa a destinos de playa con salida incremental a la web; no se esperará a terminar toda la base nacional para publicar.
- Primera ola activada desde el Archivo Maestro: Cancún, Riviera Maya / Playa del Carmen, Puerto Vallarta, Nuevo Nayarit / Bahía de Banderas, Los Cabos / Cabo San Lucas y Bahías de Huatulco.
- Guadalajara y Tequila quedaron fuera de publicación por ahora para que la primera versión pública se enfoque comercialmente en playa.
- Orden de salida inicial: 1 Cancún, 2 Riviera Maya / Playa del Carmen, 3 Puerto Vallarta, 4 Nuevo Nayarit / Bahía de Banderas, 5 Los Cabos / Cabo San Lucas, 6 Bahías de Huatulco.

## Razón de la primera ola
- La selección combina destinos ya verificados en el Maestro con señales oficiales recientes de demanda/ocupación hotelera.
- DataTur 2026 coloca de manera recurrente entre los destinos de mayor ocupación a Playacar/Playa del Carmen, Nuevo Nayarit, Cabo San Lucas/Los Cabos, Cancún, Puerto Vallarta y Bahías de Huatulco.
- Esta señal se usa para priorizar publicación e investigación comercial; no equivale por sí sola a margen, comisión o rentabilidad de Trhoncal.

## Investigación acumulada
- 30/30 destinos iniciales de México con ficha base verificada.
- 177/177 Pueblos Mágicos cargados como índice oficial federal.
- 65/177 Pueblos Mágicos con enriquecimiento individual v1.
- 162 registros de fuente/evidencia en `05_Fuentes`.
- Nuevo León queda pendiente hasta que termine la primera fase comercial de playas.

## Método de publicación incremental
1. Publicar primero destinos ya verificados y comercialmente fuertes.
2. Mejorar después cada ficha con imagen legal, contenido editorial, CTA y SEO/AEO.
3. Añadir la siguiente tanda de playas sin esperar a que todas estén perfectas.
4. Mantener precios/ofertas separados y publicar sólo cuando David seleccione producto real y se reconfirme vigencia.
5. No frenar la web por investigación de destinos secundarios.

## Siguiente ola de playas
- Mazatlán.
- Ixtapa-Zihuatanejo.
- Puerto Escondido.
- Isla Mujeres.
- Cozumel.
- Sayulita.
- La Paz.
- Acapulco, con revisión operativa y de producto antes de destacarlo por su proceso de recuperación.

## GitHub / despliegue
- Repositorio: `davidcastrosb-ops/viajes-troncal-proyecto-completo`.
- Rama: `feat/trhoncal-travel-knowledge-site-v2`.
- PR #2: `Trhoncal Travel V2 — portal editorial + Maestro control web`.
- Estado: abierto, DRAFT, sin merge.
- Mantener como DRAFT hasta revisión de David.

## Pendiente inmediato
1. Confirmar visualmente que la primera ola de 6 playas aparece correctamente en la preview.
2. Elegir y documentar imágenes con derechos de uso para esos 6 destinos; la web puede seguir funcionando con contenido mientras las imágenes se completan.
3. Continuar la segunda ola de playas en bloques pequeños.
4. Configurar `viajes.trhoncalhomes.com.mx` cuando la primera ola tenga presentación visual suficiente.
5. Mantener ofertas en 0 hasta selección expresa de David.

## Continuidad y recuperación
- El historial de ChatGPT NO es fuente única del proyecto.
- Checkpoint duradero creado en `docs/CHECKPOINT_MAESTRO_2026-08-24.md`.
- Si un chat se trunca, recuperar desde: PR #2 → STATUS/CHECKPOINT → `00_Control` del Archivo Maestro → pestañas específicas → Jotform/Vercel según la tarea.
- Las decisiones estructurales y avances materiales deben dejar rastro en GitHub y/o Archivo Maestro para que una falla de interfaz no implique pérdida del trabajo.
