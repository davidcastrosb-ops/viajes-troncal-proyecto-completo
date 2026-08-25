# Trhoncal Travel — Flujo Promo Maker v1

Fecha: 2026-08-24
Estado: diseño aprobado por David; implementación técnica a ejecutar en rama segura.

## Hechos confirmados
- Travel Promo Maker genera promociones desde un usuario/agencia de PriceAgencies.
- Una promoción puede tener: landing pública de producto, enlace para compartir y landing de captura de lead.
- El formulario de captura envía una notificación al correo asociado al usuario que generó la promoción; se verificó con una prueba real recibida desde `ofertas@travelpromomaker.com`.
- El correo receptor no se fija en la web de Trhoncal porque depende del usuario con el que se genere la promoción.
- Los ejemplos de City Lodge/Sabaneta usados durante la prueba NO son ofertas activas de Trhoncal Travel.

## Regla comercial
Una promoción sólo puede aparecer en Trhoncal cuando: `Mostrar_Web = Sí`, `Publicable = Sí`, `Estado = Vigente`, existe confirmación reciente de precio y no está vencida.

Cuando la promoción tenga un enlace generado por la agencia y David lo autorice, la tarjeta puede abrir la landing real de Promo Maker. Si no existe autorización de salida directa, el CTA permanece dentro de Trhoncal (WhatsApp/cotización).

## Campos de control propuestos
- `URL_Promo_Publica`: landing de producto generada por la agencia.
- `URL_Promo_Compartir`: enlace de compartir de Promo Maker.
- `URL_Formulario_Lead`: landing de captura de lead.
- `Enlace_Publico_Autorizado`: Sí/No.
- `Destino_Lead_Verificado`: texto de control, por ejemplo `Correo del usuario generador`.
- `Imagen_Promo_URL`: imagen autorizada para la tarjeta/banner cuando exista una URL reutilizable.

## UX pública
- Hero emocional permanente: nunca depende de promociones.
- Promociones: franja/carrusel dinámico sólo cuando hay ofertas publicables.
- Cada tarjeta muestra lo mínimo útil: destino/título, precio, duración, vigencia y condiciones resumidas.
- CTA primario: `Ver promoción` cuando hay URL autorizada.
- CTA secundario: `Quiero asesoría` por WhatsApp de Trhoncal.
- El formulario de Promo Maker se usa como tercer camino de captación cuando exista y esté verificado.

## Riesgos y controles
- No publicar muestras o ejemplos automáticamente.
- No exponer `URL_proveedor_interna`.
- No fijar un correo receptor en código.
- No mantener una promoción visible después de su vencimiento.
- No afirmar disponibilidad garantizada: siempre reconfirmar precio, cupo y condiciones.
