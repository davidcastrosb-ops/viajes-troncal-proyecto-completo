# Trhoncal Travel — Plan de Medición Web

## Objetivo
Medir qué contenido genera solicitudes reales antes de invertir fuerte en campañas.

## Herramientas pendientes de conectar
- Google Analytics 4.
- Google Search Console.
- Meta Pixel / Conversion API cuando se definan campañas de Meta.

## Eventos mínimos
1. `view_destination` — ficha de destino abierta.
2. `view_when_to_travel` — página Cuándo viajar.
3. `view_occasion` — ocasión/puente consultado.
4. `view_promotion` — clic en promoción externa de proveedor.
5. `open_quote_form` — formulario abierto.
6. `submit_quote_form` — solicitud registrada con éxito.
7. `whatsapp_click` — clic a WhatsApp.
8. `promo_quote_click` — clic en Quiero este viaje desde una oferta.

## Dimensiones útiles
- destino_id
- ocasion_id
- oferta_id
- slug_destino
- source_page
- utm_source
- utm_medium
- utm_campaign

## Conversiones recomendadas
**Principal:** `submit_quote_form`.

**Secundarias:** `whatsapp_click`, `promo_quote_click`, `view_promotion`.

## Indicadores de negocio
- Sesiones → solicitudes.
- Ficha → apertura de formulario.
- Promoción → solicitud.
- Ocasión → solicitud.
- Costo por lead cuando haya pauta.
- Lead → cotización.
- Cotización → venta.
- Margen por venta/campaña.

## Reglas
- No instalar identificadores inventados.
- Crear la capa de eventos primero; activar GA4/Meta sólo con IDs reales de la propiedad/cuenta.
- UTM no sustituye CRM: conservar origen también en `13_Solicitudes_Web` y posteriormente en Kommo.
- No considerar WhatsApp como venta; la conversión real se valida en CRM/operación.