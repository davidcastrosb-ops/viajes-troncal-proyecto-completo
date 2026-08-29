# Smoke tests V2

## Seguridad de producción
- [ ] `main` no cambia durante la revisión.
- [ ] `/mexico/:slug` sigue usando la ficha actual.
- [ ] `/oferta/:id` sigue usando la ficha actual.
- [ ] `/oferta/:id.pdf` sigue usando el PDF actual.

## Hub de destino V2
- [ ] Hero muestra destino correcto.
- [ ] Oferta sólo aparece si pertenece al `Destino_ID`.
- [ ] Máximo 2 tarjetas por segmento.
- [ ] No aparece un segmento vacío.
- [ ] No se inventan beneficios, edades o precios.
- [ ] CTA de opción abre mini sitio de hotel.
- [ ] CTA de personalización abre formulario V2 con destino contextual.
- [ ] Información editorial aparece después del producto.

## Mini sitio de hotel
- [ ] Nombre comercial no se traduce.
- [ ] Promoción contextual corresponde al `Oferta_ID`.
- [ ] Precio, fechas, plan y ocupación coinciden con `07_Ofertas_Vigentes`.
- [ ] Galería/lightbox funciona.
- [ ] Habitación y amenidades no contradicen la promoción.
- [ ] CTA principal abre formulario V2.
- [ ] Descargar PDF usa ruta V2 durante preview.

## Formulario V2
- [ ] Destino se precarga desde el contexto.
- [ ] Oferta se conserva cuando llega desde mini sitio.
- [ ] Adultos >= 1.
- [ ] Menores >= 0.
- [ ] Si hay menores, se exige una edad por menor.
- [ ] Total viajeros = adultos + menores.
- [ ] Lead se registra con `Oferta_ID`, `Adultos`, `Menores`, `Edades_Menores`.

## PDF V2
- [ ] Funciona con una sola portada.
- [ ] Agrega galería sólo cuando logra cargar 2+ imágenes.
- [ ] No inventa imágenes.
- [ ] QR apunta a la promoción vigente de Trhoncal.

## Móvil
- [ ] Tarjetas apilan correctamente.
- [ ] CTA principal visible y táctil.
- [ ] Galería/lightbox usable con pantalla pequeña.
- [ ] Formulario no desborda horizontalmente.
