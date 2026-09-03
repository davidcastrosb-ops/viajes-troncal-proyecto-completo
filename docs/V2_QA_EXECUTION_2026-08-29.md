# Ejecución QA V2 — 2026-08-29

## Alcance
Auditoría técnica sobre `feature/destination-hubs-v2-2026-08-29` sin modificar `main` ni desplegar Apps Script.

## Revisado y corregido en código
- Navegación explícita Destinos → Hub → Hotel → Formulario, sin depender de `history.back()`.
- Enlaces consistentes a Todos los destinos y Todas las ofertas desde Hub, Hotel y Formulario.
- Banners internos de preview ocultos cuando `VERCEL_ENV=production`.
- Singular/plural del número de viajes en Hub.
- Estados de Hub con 0 y 1 promoción con CTA útil y sin contenido inventado.
- Segmentos familiares/junior sólo con evidencia de menores/edades/beneficio real.
- Una oferta no se duplica entre segmentos salvo autorización explícita `allowDuplicate`.
- Filtro de expiración / visibilidad reforzado en vistas V2.
- Oferta sin `Hotel_ID` no se fuerza a un mini sitio de hotel; conserva ruta de promoción.
- Precio homologado como Por persona / Total publicado / Desde / unidad informada.
- Hotel usa fotografías permanentes únicamente desde `hotelImages` aprobadas por el Maestro.
- Si no hay fotografías aprobadas, se muestra un placeholder comercial y no un error técnico.
- Nombres comerciales de hotel marcados para no traducirse.
- Compartir desde hotel usa el host actual (Preview o Producción), no un host fijo incorrecto.
- Lightbox: ESC, flechas y retorno de foco al control que abrió la galería.
- PDF: sin lenguaje interno “V2” en CTA/nombre de archivo; galería sólo con imágenes aprobadas; sin cuadros vacíos; QR contextual al mini sitio cuando existe y con host actual.
- Formulario: salida/regreso saneadas, regreso no puede ser anterior a salida, adultos 1–20, menores/juniors 0–8, edad 0–17 por cada menor/junior, `aria-live` para estado.
- CSS común V2: foco visible, objetivos táctiles mínimos, protección contra overflow y apilado móvil.
- Directorio de ofertas respeta `Hotel_ID` y unidad de precio.

## Controles que todavía requieren prueba de navegador / insumo real
- Revisión visual de Hub con 1, 2 y 3+ promociones reales.
- Spot-check móvil real en Hub, Hotel y Formulario.
- Touch real de lightbox en teléfono.
- Envío real de un lead contextual hasta `13_Solicitudes_Web`.
- Confirmación visual del PDF descargado en Preview.
- Q-018 / Q-025: derechos de fotografías de hotel pendientes de aprobación real.
- Promociones familiares/junior: no se muestran hasta existir datos reales.

## Criterio de salida
No migrar rutas públicas ni desplegar Apps Script hasta que:
1. el HEAD completo tenga Vercel SUCCESS;
2. pase el spot-check visual/móvil;
3. pase una solicitud real contextual;
4. se mantenga el PR #13 en Draft durante QA;
5. `main` permanezca intacto.

## Seguridad
- Rutas públicas actuales `/mexico/:slug`, `/oferta/:id` y `/oferta/:id.pdf` permanecen fuera de esta migración.
- Rollback de referencia: `backup-ofertas-estable-2026-08-29`.
