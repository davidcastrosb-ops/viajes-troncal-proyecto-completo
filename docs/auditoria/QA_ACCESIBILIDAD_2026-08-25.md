# Auditoría de accesibilidad — Trhoncal Travel — 2026-08-25

## Elementos ya bien resueltos
- Modal con `role="dialog"` y `aria-modal="true"`.
- Título del modal enlazado con `aria-labelledby`.
- Escape cierra primero calendario y después modal.
- Al cerrar el modal se devuelve el foco al disparador anterior.
- Botones de calendario y carruseles tienen etiquetas `aria-label`.
- Estados del formulario usan `role="status"` / `aria-live`.
- Imágenes de destinos usan texto alternativo controlado desde Maestro.
- Controles táctiles no dependen únicamente de hover en móvil.

## Pendientes de mejora
1. Implementar trampa de foco dentro del modal para que `Tab` no llegue al contenido detrás mientras está abierto.
2. Marcar el contenido de fondo como inerte/oculto a tecnologías de asistencia cuando el modal esté activo si la compatibilidad elegida lo permite.
3. Revisar contraste de texto pequeño sobre fotografías en tarjetas expansivas; mantener overlay suficiente.
4. Verificar navegación completa sólo con teclado en home, `/cuando-viajar/` y una ficha SSR.
5. Confirmar orden visible y orden de foco en carruseles horizontales.
6. Evitar texto significativo únicamente mediante color: calendario ya usa leyenda, conservarla.
7. Probar zoom 200% y ancho móvil sin pérdida de contenido.

## Prueba mínima antes de campaña
- Tab desde header hasta CTA final sin quedar atrapado.
- Abrir/cerrar modal con teclado.
- Seleccionar fecha sin mouse.
- Enviar formulario sólo con teclado.
- Revisar foco después de error y después de cerrar.

## Riesgo actual
Medio-bajo. No se detectó un bloqueo obvio para uso básico, pero la trampa de foco del modal y la prueba de contraste/zoom deben cerrarse antes de considerar accesibilidad pulida.