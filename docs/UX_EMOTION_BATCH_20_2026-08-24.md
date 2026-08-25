# Trhoncal Travel — UX/Emoción Batch 20

Fecha: 2026-08-24
Estado: autorizado por David para implementación completa sin nuevas preguntas.

## Objetivo
Subir la emoción visual y la conversión del sitio sin perder el tono editorial/premium ni convertirlo en una OTA genérica. Mantener el Archivo Maestro como control de publicación y usar solamente imágenes de destinos que ya cuenten con permiso web/licencia verificada.

## 20 cambios autorizados
1. Mantener favicon de marca en home y fichas.
2. Home con título comercial `Atrévete a viajar | Trhoncal Travel`.
3. Fichas con título comercial `Descubre [Destino] | Trhoncal Travel`.
4. Hero con copy emocional y comercial, no sólo informativo.
5. Hero visual construido con fotografías verificadas de destinos públicos.
6. Mantener sello/logo de marca dentro del hero, sin hacerlo protagonista absoluto.
7. Categorías de viaje con fotografía superior dinámica.
8. Cada fotografía de categoría se toma sólo de un destino visible con imagen autorizada.
9. Copys de categorías reescritos para vender emoción/experiencia.
10. Destinos ejemplo mostrados como chips, no texto corrido.
11. CTA de categoría cambia a `Descubrir destinos`.
12. Carrusel conserva Anterior/Siguiente, contador y swipe.
13. Carrusel conserva autoplay suave, pausa por interacción y reduced-motion.
14. En móvil se deja visible parte de la siguiente tarjeta.
15. Se añade señal visual/overlay para que la imagen tenga legibilidad consistente.
16. Promociones usan el módulo Promo Maker v1 cuando existan ofertas reales.
17. Se cargan CSS/JS de Promo Maker en la home; con 0 ofertas la sección permanece oculta.
18. CTA de promo abre landing autorizada; WhatsApp queda como segundo camino; formulario lead sólo si está verificado.
19. Ningún ejemplo de Travel Promo Maker se publica como oferta real.
20. Todo cambio pasa por rama segura, preview Vercel, PR, merge sólo con estado SUCCESS y checkpoint en Archivo Maestro.

## Reglas que permanecen
- `Mostrar_Web=Sí` no basta para ofertas: también deben ser Publicable, Vigente, con precio confirmado y no vencidas.
- `URL_proveedor_interna` nunca sale al frontend.
- El correo receptor de Travel Promo Maker depende del usuario generador y no se fija en código.
- Las imágenes de categorías no agregan derechos nuevos: reutilizan únicamente imágenes ya autorizadas por el Maestro.
- Con 0 ofertas reales no debe aparecer un bloque vacío de promociones.
