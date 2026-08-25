# Trhoncal Travel — Convención UTM y eventos de conversión

## Objetivo
Que una campaña pueda rastrearse desde el clic hasta el lead, la cotización y eventualmente la venta.

## UTMs
### utm_source
Origen: `facebook`, `instagram`, `google`, `whatsapp`, `email`, `organic`, `priceagencies`.

### utm_medium
Medio: `paid_social`, `organic_social`, `cpc`, `email`, `referral`, `direct`.

### utm_campaign
Formato recomendado: `aaaa-mm_ocasion_destino_objetivo`.
Ejemplo: `2026-11_revolucion_puerto-vallarta_leads`.

### utm_content
Formato: `formato_creativo_angulo_version`.
Ejemplo: `video_playa_precio_v1`.

## IDs internos
Nunca sustituir IDs del Maestro por nombres libres:
- `Ocasion_ID`
- `Oferta_ID`
- `Destino_ID`
- `Lead_ID`

## Eventos web estándar
- `view_destination`
- `view_travel_occasion`
- `view_promotion`
- `click_promotion_provider`
- `open_quote`
- `submit_lead`
- `lead_success`
- `whatsapp_click`

## Parámetros comunes
- destination_id / destination_name
- occasion_id
- offer_id
- source_page
- cta_origin
- utm_source / utm_medium / utm_campaign / utm_content

## Regla
No cambiar nombres de eventos cada campaña. La campaña cambia en parámetros; el evento permanece estable para poder comparar periodos.

## Pendiente de activación
Cuando existan los IDs reales de GA4/Meta, mapear estos mismos eventos a las plataformas sin cambiar la nomenclatura interna.