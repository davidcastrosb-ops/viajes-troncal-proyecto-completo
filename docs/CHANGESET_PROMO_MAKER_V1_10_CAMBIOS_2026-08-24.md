# Trhoncal Travel — 10 cambios autorizados Promo Maker v1

Fecha: 2026-08-24
Autorización: David autorizó ejecutar 10 cambios siguientes, documentados.

1. Documentar Travel Promo Maker como canal de producto/lead de agencia, no como enlace genérico de OTA.
2. Ampliar `07_Ofertas_Vigentes` con campos separados para landing pública, enlace de compartir, formulario de lead, verificación de destino del lead e imagen de promo.
3. Mantener `Enlace_Publico_Autorizado` como interruptor manual para salida directa a Promo Maker.
4. Actualizar Apps Script para exponer únicamente URLs públicas autorizadas; nunca `URL_proveedor_interna`.
5. Mantener autoexpiración de ofertas y reforzar que precio confirmado + vigencia son requisitos de publicación.
6. Convertir el bloque de ofertas en una experiencia de tarjeta/carrusel preparada para desktop y móvil.
7. CTA primario `Ver promoción` cuando exista landing pública autorizada; fallback a `Cotizar con Trhoncal` cuando no exista.
8. CTA secundario de asesoría por WhatsApp de Trhoncal y CTA opcional `Dejar mis datos` cuando exista formulario de lead verificado.
9. Mostrar en la tarjeta sólo información comercial mínima: título/destino, precio, duración, vigencia y nota de reconfirmación; no duplicar toda la landing del proveedor.
10. Registrar arquitectura, revisión y estado en GitHub/Archivo Maestro; los ejemplos City Lodge/Sabaneta permanecen como prueba técnica y NO como oferta activa.

## Criterio de éxito
- Cero ofertas de prueba publicadas automáticamente.
- La web sigue funcionando con 0 ofertas.
- Cuando David cargue una oferta real y la autorice, el sitio puede mostrarla sin cambio de código.
- El correo receptor del formulario no se fija en código porque depende del usuario que genera la promoción.
