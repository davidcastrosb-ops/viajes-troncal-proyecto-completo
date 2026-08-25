# Promo Maker v1 — implementación

Fecha: 2026-08-24

## Estado
Construido en rama segura y listo para integración después de preview verde.

## Implementado
- Campos separados para landing pública, enlace de compartir, formulario de lead, verificación del destino del lead e imagen de promoción.
- Apps Script sólo expone enlaces públicos cuando el interruptor manual de autorización está activo.
- La URL interna del proveedor no se expone al sitio.
- Filtro de publicación conserva: Mostrar_Web, Publicable, Estado Vigente, confirmación de precio y autoexpiración.
- Hero puede mostrar hasta tres promociones vigentes.
- Sección Ofertas preparada como carrusel responsive con controles escritos, contador, autoplay suave, pausa, Ver todas y swipe móvil.
- CTA principal: Ver promoción si hay landing autorizada; si no, Cotizar con Trhoncal.
- CTA adicional: Quiero asesoría por WhatsApp.
- CTA opcional: Dejar mis datos cuando existe formulario de lead y su destino está verificado.
- El correo receptor del formulario no se fija en código porque depende del usuario que genera la promoción.
- Los ejemplos usados para pruebas no se cargaron como oferta activa.

## Dependencia
Para que los nuevos campos lleguen al endpoint público, la implementación existente de Apps Script deberá publicarse como nueva versión conservando la misma URL /exec. Con cero ofertas activas, esta dependencia no altera la web actual.
