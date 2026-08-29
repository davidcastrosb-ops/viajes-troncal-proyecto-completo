# Trhoncal Travel V2 — Hubs de destino + mini sitios de hotel

## Principio
La V2 se construye en paralelo. Las rutas públicas actuales permanecen intactas hasta aprobación final.

## Flujo comercial V2
Destino → ofertas reales vigentes → mini sitio del hotel → solicitud precargada.

## Hub de destino
- Conserva la información editorial y verificable existente.
- Muestra primero producto real.
- El CTA principal comunica cuántos viajes existen para ese destino.
- No muestra el rótulo público “Escapada para dos”.
- Cuando existan promociones familiares se separan únicamente los bloques que aportan una diferencia real:
  - Familias con menores con beneficio.
  - Familias con juniors.
- Máximo 2 opciones por configuración comercial.
- Un segmento sin producto no se muestra.
- Una oferta vencida u oculta no debe mostrarse.
- Si ninguna oferta convence, el cliente pasa a “Personalizar mi viaje”, con destino precargado.

## Mini sitio del hotel
- Promoción contextual arriba.
- Regreso visible a “viajes para [destino]”.
- Galería permanente del hotel.
- Habitación, servicios, ubicación y condiciones.
- CTA a formulario con destino, fechas, hotel, plan y Oferta_ID precargados.
- PDF V2 compartible.

## Formulario V2
- Regreso determinístico a la lista del destino.
- Adultos.
- Menores / juniors.
- Edad individual de cada menor/junior.
- Destino, fechas, plan y Oferta_ID conservan el contexto de navegación.

## PDF V2
- Nunca inventa fotografías del hotel.
- Usa oferta + biblioteca de imágenes aprobadas del hotel.
- Página de portada comercial.
- Galería cuando existen al menos 2 imágenes válidas.
- Resumen de viaje, condiciones, contacto y QR.

## Seguridad de rollout
- `/mexico/:slug` actual: intacto.
- `/oferta/:id` actual: intacto.
- `/oferta/:id.pdf` actual: intacto.
- Preview: `/destino-v2/:slug`, `/hotel-v2/:slug`, `/cotizar-v2`, `/oferta-v2/:id.pdf`.
- PR #13 permanece Draft hasta revisión y migración uno por uno.
- Rollback: `backup-ofertas-estable-2026-08-29`.

## Pendientes que sí requieren insumo real
- Aprobar derechos/fuente de fotografías de cada hotel (Q-018).
- Cargar promociones reales de familias con menores/juniors para probar esos bloques.
- Desplegar Master API v6 una sola vez cuando el modelo de datos quede congelado.
