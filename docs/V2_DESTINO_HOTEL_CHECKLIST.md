# Trhoncal Travel — V2 Destino + Hotel

Estado: **preview / no publicar aún**

## Flujo objetivo

Home → Hub de destino → opción real por tipo de viajeros → mini sitio permanente del hotel + promoción → formulario interno V2 → lead.

## Segmentos comerciales

- Escapada para dos — máximo 2 ofertas.
- Familia · menores con beneficio — máximo 2 ofertas, siempre con edades y condición verificadas.
- Familias con juniors — máximo 2 ofertas, siempre con edades/tarifa verificadas.
- Si faltan ofertas de un segmento, no se inventan ni se rellenan.
- Si ninguna opción funciona, CTA al formulario personalizado con destino precargado.

## Fuentes de verdad

- `07_Ofertas_Vigentes`: producto/promoción temporal.
- `21_Hoteles_Maestro`: ficha permanente del hotel.
- `22_Hotel_Imagenes`: fotografías reales y aprobadas del hotel.
- `23_Oferta_Segmentos`: configuración de viajeros y beneficios/tarifas infantiles.
- `13_Solicitudes_Web`: leads, incluyendo adultos, menores y edades.

## Reglas de imágenes

- No usar IA para representar instalaciones reales de un hotel.
- No publicar una imagen en la galería V2 hasta que `Permiso_Uso_Web = Sí`.
- `Imagen_Promo_URL` puede funcionar como portada específica de la promoción.
- La galería permanente pertenece al hotel y se reutiliza entre promociones.

## PDF V2

- Página 1: promoción + portada + precio + fechas.
- Página 2: galería sólo cuando hay 2+ imágenes disponibles/aprobadas.
- Página 3: producto, condiciones y QR.
- Debe funcionar con una sola portada y enriquecerse automáticamente al aprobar nuevas imágenes.

## Migración pública

1. No cambiar `/mexico/...`, `/oferta/...` ni PDF actual durante preview.
2. Revisar primero Puerto Vallarta y Friendly Fun.
3. Validar desktop y móvil.
4. Validar formulario V2 y registro del lead.
5. Validar PDF V2.
6. Publicar Master API v6 cuando corresponda.
7. Migrar enlaces uno por uno, nunca todos a la vez.
8. Mantener rollback a `backup-ofertas-estable-2026-08-29`.

## Pendientes que requieren evidencia real

- Aprobar derechos de fotografías de Friendly Fun, Barceló y Grand Decameron (Q-018).
- Cargar promociones familiares reales antes de mostrar bloques de menores con beneficio o juniors.
- No inventar precios, edades, beneficios o políticas infantiles.
