# Smoke tests V2

## Seguridad de producción
- [ ] `main` no cambia durante la revisión.
- [ ] `/mexico/:slug` sigue usando la ficha actual.
- [ ] `/oferta/:id` sigue usando la ficha actual.
- [ ] `/oferta/:id.pdf` sigue usando el PDF actual.
- [ ] PR permanece en Draft hasta aprobación visual y funcional.
- [ ] Rollback `backup-ofertas-estable-2026-08-29` sigue disponible.

## Navegación general
- [ ] Ninguna pantalla depende de la flecha Atrás del navegador.
- [ ] Hub tiene acceso visible a Todos los destinos y Todas las ofertas.
- [ ] Mini sitio permite volver al destino, ver otros destinos y ver ofertas.
- [ ] Formulario permite volver al destino, ver otros destinos y ver ofertas.
- [ ] Los enlaces de regreso conservan el destino correcto.
- [ ] En móvil las acciones de navegación no se enciman.

## Hub de destino V2
- [ ] Hero muestra destino correcto.
- [ ] Oferta sólo aparece si pertenece al `Destino_ID`.
- [ ] Máximo 2 tarjetas por segmento.
- [ ] Una oferta no se duplica accidentalmente en varios segmentos.
- [ ] No aparece un segmento vacío.
- [ ] No se inventan beneficios, edades o precios.
- [ ] Oferta con `Mostrar_Web = No` no aparece.
- [ ] Oferta vencida no aparece.
- [ ] 0 ofertas muestra CTA de cotización sin huecos visuales.
- [ ] 1 oferta mantiene composición equilibrada.
- [ ] 2 ofertas mantienen simetría visual.
- [ ] 3+ ofertas no rompen layout ni conteo.
- [ ] CTA de opción abre mini sitio de hotel.
- [ ] CTA de personalización abre formulario con destino contextual.
- [ ] Información editorial aparece después del producto.
- [ ] Bloque de viaje a medida aparece después de la información del destino.

## Mini sitio de hotel
- [ ] Nombre comercial no se traduce.
- [ ] Promoción contextual corresponde al `Oferta_ID`.
- [ ] Promoción vencida/no visible no se presenta como vigente.
- [ ] Si una promoción dejó de existir, el hotel sigue siendo navegable y ofrece cotización actualizada.
- [ ] Precio conserva su unidad real: total / por persona / desde.
- [ ] Fechas, plan y ocupación coinciden con `07_Ofertas_Vigentes`.
- [ ] Galería/lightbox funciona con mouse/touch.
- [ ] ESC cierra lightbox.
- [ ] Flechas izquierda/derecha cambian fotografía.
- [ ] El foco vuelve al control que abrió la galería.
- [ ] Habitación y amenidades no contradicen la promoción.
- [ ] CTA principal abre formulario contextual.
- [ ] Compartir/copiar usa el host actual de Preview o Producción, no un dominio incorrecto.
- [ ] Descargar PDF no muestra lenguaje interno "V2" al cliente.

## Formulario
- [ ] Destino se precarga desde el contexto.
- [ ] Hotel se conserva cuando llega desde mini sitio.
- [ ] Oferta se conserva cuando llega desde mini sitio.
- [ ] Fechas válidas se precargan.
- [ ] Fecha de regreso no puede ser anterior a la salida.
- [ ] Adultos >= 1 y <= 20.
- [ ] Menores/juniors >= 0 y <= 8.
- [ ] Si hay menores/juniors, se exige una edad por cada uno.
- [ ] Edades aceptadas 0–17.
- [ ] Total viajeros = adultos + menores/juniors.
- [ ] Lead conserva `Oferta_ID`, `Adultos`, `Menores`, `Edades_Menores`.
- [ ] Estado de envío usa `aria-live` y muestra éxito/error.
- [ ] Reintento se habilita después de error.

## PDF
- [ ] Sólo genera PDF para promoción vigente y visible.
- [ ] Funciona con una sola portada.
- [ ] Agrega galería sólo cuando logra cargar 2+ imágenes.
- [ ] No crea cuadros vacíos por imágenes faltantes.
- [ ] No inventa imágenes.
- [ ] Imágenes permanentes del hotel requieren permiso web explícito.
- [ ] Precio conserva su unidad real.
- [ ] QR apunta al mini sitio contextual del hotel/promoción cuando existe.
- [ ] QR usa host Preview durante QA y dominio público cuando corresponda.
- [ ] Nombre de archivo no contiene lenguaje interno "V2".

## Accesibilidad y móvil
- [ ] Foco visible en links, botones, inputs y selects.
- [ ] Contraste de CTAs y texto es legible.
- [ ] `prefers-reduced-motion` elimina animaciones no esenciales.
- [ ] Tarjetas apilan correctamente.
- [ ] CTA principal visible y táctil.
- [ ] Galería/lightbox usable con pantalla pequeña.
- [ ] Formulario no desborda horizontalmente.
- [ ] Navegación contextual se apila sin perder enlaces.
