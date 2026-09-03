# Smoke tests V2

## Estado del bloque técnico — 2026-08-29
- [x] HEAD completo compila en Vercel: SUCCESS.
- [x] PR #13 continúa en Draft.
- [x] `main` permanece en `18da2042b2d89c62e31dd75ab6d1733922875497` y la rama V2 está 78 commits adelante / 0 atrás al cierre de esta revisión.
- [x] Navegación, validaciones, permisos de imágenes, PDF y responsive recibieron revisión/corrección de código.
- [ ] Falta spot-check visual real en navegador/móvil.
- [ ] Falta enviar un lead contextual real hasta `13_Solicitudes_Web`.
- [ ] Q-018 / Q-025 siguen pendientes por permisos reales de fotografías.

## Seguridad de producción
- [x] `main` no cambia durante la revisión.
- [x] `/mexico/:slug` sigue usando la ficha actual.
- [x] `/oferta/:id` sigue usando la ficha actual.
- [x] `/oferta/:id.pdf` sigue usando el PDF actual.
- [x] PR permanece en Draft hasta aprobación visual y funcional.
- [x] Rollback `backup-ofertas-estable-2026-08-29` sigue disponible.

## Navegación general
- [x] Ninguna pantalla V2 revisada depende de la flecha Atrás del navegador.
- [x] Hub tiene acceso visible a Todos los destinos y Todas las ofertas.
- [x] Mini sitio permite volver al destino, ver otros destinos y ver ofertas.
- [x] Formulario permite volver al destino, ver otros destinos y ver ofertas.
- [x] Los enlaces de regreso conservan el destino correcto en código.
- [ ] En móvil las acciones de navegación no se enciman — validar visualmente.

## Hub de destino V2
- [x] Hero obtiene el destino del slug verificado.
- [x] Oferta sólo aparece si pertenece al `Destino_ID`.
- [x] Máximo 2 tarjetas por segmento.
- [x] Una oferta no se duplica accidentalmente en varios segmentos; sólo se admite duplicación con intención explícita.
- [x] No aparece un segmento vacío.
- [x] No se inventan beneficios, edades o precios.
- [x] Oferta con `Mostrar_Web = No` no aparece.
- [x] Oferta vencida no aparece.
- [x] 0 ofertas muestra CTA de cotización sin contenido inventado.
- [ ] 1 oferta mantiene composición equilibrada — validar visualmente.
- [ ] 2 ofertas mantienen simetría visual — validar visualmente.
- [ ] 3+ ofertas no rompen layout ni conteo — validar con datos reales.
- [x] CTA de opción abre mini sitio de hotel cuando existe `Hotel_ID`; si no, conserva ruta de promoción.
- [x] CTA de personalización abre formulario con destino contextual.
- [x] Información editorial aparece después del producto.
- [ ] Orden final de viaje a medida vs. información del destino — confirmar visualmente antes de migrar.

## Mini sitio de hotel
- [x] Nombre comercial no se traduce.
- [x] Promoción contextual corresponde al `Oferta_ID` disponible.
- [x] Promoción vencida/no visible no se presenta como vigente.
- [x] Si una promoción dejó de existir, el hotel sigue siendo navegable y ofrece cotización actualizada.
- [x] Precio conserva su unidad real: total / por persona / desde / unidad informada.
- [x] Fechas, plan y ocupación provienen de la oferta pública.
- [ ] Galería/lightbox funciona con mouse/touch — validar en Preview.
- [x] ESC cierra lightbox en código.
- [x] Flechas izquierda/derecha cambian fotografía en código.
- [x] El foco vuelve al control que abrió la galería.
- [x] Habitación y amenidades usan Maestro/fallback controlado sin inventar categoría exacta.
- [x] CTA principal abre formulario contextual.
- [x] Compartir/copiar usa el host actual de Preview o Producción.
- [x] Descargar PDF no muestra lenguaje interno "V2" al cliente.

## Formulario
- [x] Destino se precarga desde el contexto.
- [x] Oferta se conserva cuando llega desde mini sitio.
- [x] Fechas ISO válidas se precargan.
- [x] Fecha de regreso no puede ser anterior a la salida.
- [x] Adultos >= 1 y <= 20.
- [x] Menores/juniors >= 0 y <= 8.
- [x] Si hay menores/juniors, se exige una edad por cada uno.
- [x] Edades aceptadas 0–17.
- [x] Total viajeros = adultos + menores/juniors.
- [x] Lead conserva `Oferta_ID`, `Adultos`, `Menores`, `Edades_Menores` en el payload.
- [x] Estado de envío usa `aria-live` y muestra éxito/error.
- [x] Reintento se habilita después de error.
- [ ] Confirmar un envío real hasta `13_Solicitudes_Web`.

## PDF
- [x] Sólo encuentra ofertas que llegaron al payload público.
- [x] Funciona sin galería aprobada: no deja cuadros vacíos.
- [x] Agrega galería sólo cuando logra cargar 2+ imágenes aprobadas.
- [x] No crea cuadros vacíos por imágenes faltantes.
- [x] No inventa imágenes.
- [x] Imágenes permanentes del hotel proceden de `hotelImages`, filtradas por permiso web en Apps Script.
- [x] Precio conserva su unidad real.
- [x] QR apunta al mini sitio contextual del hotel/promoción cuando existe.
- [x] QR usa host Preview durante QA y dominio público cuando corresponda.
- [x] Nombre de archivo no contiene lenguaje interno "V2".
- [ ] Abrir/inspeccionar un PDF real generado desde Preview.

## Accesibilidad y móvil
- [x] Foco visible en links, botones, inputs y selects.
- [ ] Contraste de CTAs y texto — spot-check visual final.
- [x] `prefers-reduced-motion` elimina animaciones no esenciales.
- [x] Reglas responsive apilan navegación/acciones y protegen overflow.
- [ ] CTA principal visible y táctil — validar en móvil real.
- [ ] Galería/lightbox usable con pantalla pequeña — validar en móvil real.
- [x] Formulario tiene protección de overflow y grid móvil.
- [x] Navegación contextual tiene reglas de apilado móvil.
