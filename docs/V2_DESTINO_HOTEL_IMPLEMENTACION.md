# Implementación V2 — Hub de destino + mini sitio de hotel

## Objetivo

Convertir las fichas de destino en hubs comerciales que enseñen primero configuraciones reales de viaje y después la información editorial del destino. Cada opción conecta con un mini sitio permanente del hotel y una promoción temporal.

## Arquitectura

- Destino permanente: `01_Destinos` + `02_Fichas_Destino`.
- Oferta temporal: `07_Ofertas_Vigentes`.
- Hotel permanente: `21_Hoteles_Maestro`.
- Galería de hotel: `22_Hotel_Imagenes`.
- Segmentación de viajeros: `23_Oferta_Segmentos`.
- Leads: `13_Solicitudes_Web`.

## Rutas preview

- `/destino-v2/:slug` → hub comercial de destino.
- `/hotel-v2/:slug?oferta=...` → mini sitio del hotel con promoción contextual.
- `/cotizar-v2/:slug` → formulario interno familiar V2.
- `/oferta-v2/:id.pdf` → PDF V2 con galería aprobada.

Las rutas actuales `/mexico/:slug`, `/oferta/:id` y `/oferta/:id.pdf` permanecen sin cambios durante la revisión.

## Segmentos

1. `pareja` → Escapada para dos.
2. `familia-beneficio` → Familia · menores con beneficio.
3. `juniors` → Familias con juniors.

Máximo 2 ofertas por segmento. Nunca se rellenan espacios con productos inventados.

## Conversión

Cuando ninguna oferta encaja, el Hub dirige al formulario V2 con destino precargado. El formulario solicita adultos, menores/juniors y edad exacta de cada menor porque las reglas y precios pueden depender de esa edad.

## Estado actual

- Puerto Vallarta tiene ofertas reales para el segmento pareja.
- Los segmentos familiares permanecen vacíos hasta contar con promociones reales verificadas.
- El PDF V2 admite una portada y agrega página de galería cuando existen al menos 2 imágenes disponibles/aprobadas.
- `Q-018` sigue en REVISAR hasta verificar permisos de uso de imágenes reales del hotel.
