# Trhoncal Travel — Cierre funcional MVP

Fecha de preparación: 2026-09-15
Rama de trabajo: `codex/cierre-funcional-mvp-2026-09`

## 0. Objetivo

Cerrar Trhoncal Travel para vender cuanto antes, sin rehacer ni embellecer de nuevo lo que ya funciona.

El resultado mínimo debe permitir:

**Promoción en Maestro → publicación vigente → cliente consulta → lead llega → Trhoncal da seguimiento → promoción caduca sola cuando corresponda.**

Después se conecta el mismo Maestro con Meta Catalog, WhatsApp Business y Kommo.

## 1. Congelamiento visual y estructural — REGLA DURA

Durante este bloque NO modificar sin autorización expresa de David:

- layout de la home;
- estructura visual de micrositios de hoteles;
- estructura visual de páginas de oferta;
- colores, tipografías, espacios, imágenes, galerías, footer o hero;
- navegación visible, salvo corrección funcional imprescindible;
- copy comercial visible, salvo corrección funcional imprescindible;
- estructura de formularios visible al cliente;
- Apps Script de leads/correo si no existe una falla comprobada.

Si una corrección funcional exige un cambio visible o estructural, detenerse y presentar a David un SOLO bloque enumerado con todas las preguntas/decisiones necesarias. No preguntar tornillo por tornillo.

## 2. Fuente única de verdad

Mantener:

- `Hotel_ID` = identidad permanente del hotel.
- `Oferta_ID` = promoción temporal/específica.
- `Trhoncal Travel | Archivo Maestro` = única fuente operativa.
- `21_Hoteles_Maestro` = hotel permanente.
- `22_Hotel_Imagenes` = fotos del hotel.
- `23_Oferta_Segmentos` = composición/segmentos de viajeros.
- `24_Publicador_Ofertas` = captura simplificada de promociones nuevas.
- `07_Ofertas_Vigentes` = salida normalizada consumida por la web.

No duplicar manualmente precio, fechas, ocupación o vigencia en web, Meta o WhatsApp.

## 3. Definición única de promoción ACTIVA

Una oferta puede salir a canales públicos únicamente si se cumplen todas estas condiciones:

1. `Publicable = Sí`.
2. `Mostrar_Web = Sí` para la salida web.
3. `Estado = Vigente` o equivalente normalizado.
4. Existe fecha de última confirmación de precio.
5. `Fecha_Expiracion_Web` / `Vigente_hasta` no ha pasado.
6. La fecha de inicio del viaje no ha pasado.
7. Existe `Oferta_ID` único.
8. El hotel/destino relacionado es válido.

Regla de fechas propuesta:

- la fecha `Vigente_hasta` es INCLUSIVA;
- al día siguiente, la oferta queda inactiva;
- si el viaje ya comenzó, la oferta queda inactiva aunque una fecha de vigencia haya quedado mal capturada;
- una oferta vencida NO se elimina: queda como histórico.

Esta misma función/regla debe alimentar posteriormente web, dashboard, feed Meta/WhatsApp y automatizaciones de seguimiento.

## 4. Bloque A — Codex, sin intervención de David

### A1. Auditoría de caducidad

Revisar todos los consumidores de ofertas:

- `apps-script/Code.gs` / payload público;
- home (`assets/js/site.js`);
- `/oferta/:id`;
- `/hotel-v2/:slug`;
- hubs de destino V2;
- listados de ofertas V2;
- PDFs si incluyen promoción vigente;
- cualquier endpoint que exponga ofertas.

Confirmar que una oferta vencida no aparece como activa en ningún canal público.

No cambiar visuales.

### A2. Pruebas automatizadas

Agregar pruebas que cubran al menos:

- vigente hasta hoy → visible;
- venció ayer → no visible;
- viaje inició ayer → no visible;
- futura y válida → visible;
- no publicable → no visible;
- estado no vigente → no visible;
- sin confirmación de precio → no visible;
- oferta histórica permanece disponible para auditoría interna pero no en payload público.

Extender `npm run test:blockers` o agregar un script de pruebas adicional, manteniendo Node 20.

### A3. No tocar Apps Script de producción si no hace falta

El código actual ya contiene filtrado por `Fecha_Expiracion_Web`. Antes de cambiar o redeplegar Apps Script:

1. demostrar una falla real con prueba reproducible;
2. documentar el motivo;
3. detenerse si el cambio requiere redeploy manual y agrupar todas las acciones que David deba hacer en un solo bloque.

### A4. Preparar salida técnica para Meta Catalog

Crear sólo la capa técnica, sin conectar todavía activos de Meta.

Preferencia: endpoint/feed estable generado desde las ofertas activas del Maestro, por ejemplo:

- `/api/meta-catalog.csv`

El feed debe tomar `Oferta_ID` como ID del artículo y usar únicamente datos vigentes del Maestro.

Campos mínimos previstos (verificar contra documentación oficial vigente de Meta antes de cerrar implementación):

- id;
- title;
- description;
- availability;
- condition;
- price;
- link;
- image_link.

El enlace del artículo debe llevar a Trhoncal Travel, no al proveedor.

No crear catálogo, no tocar Commerce Manager y no conectar WhatsApp en este bloque.

### A5. Dashboard: sólo especificación técnica para el Maestro

Preparar especificación para una pestaña nueva del Sheet:

`25_Dashboard_Promociones`

Debe ser extremadamente simple:

- total de promociones activas;
- total que vencen pronto;
- conteo por destino: Puerto Vallarta 3, Cancún 2, etc.;
- opcionalmente fecha más próxima de vencimiento por destino.

No hacer gráficas ni dashboard visual complejo.

El dashboard debe usar la misma definición de ACTIVA del punto 3.

## 5. Bloque B — Panchito/ChatGPT, mínima intervención de David

Una vez que Codex deje verde el Bloque A:

1. revisar diff y pruebas;
2. confirmar que no hubo cambios visuales/estructurales;
3. validar feed de Meta con muestras reales;
4. crear/ajustar `25_Dashboard_Promociones` directamente en el Archivo Maestro;
5. probar una promoción nueva real desde `24_Publicador_Ofertas`;
6. comprobar home, oferta, micrositio, formulario, correo y lead;
7. comprobar una promoción artificialmente vencida en entorno de prueba o fixture, sin alterar una venta real;
8. documentar resultado.

## 6. Bloque C — única sesión donde puede requerirse David

Agrupar en una sola sesión las acciones que necesiten acceso/decisión humana en plataformas:

### Meta / WhatsApp

- identificar Business Portfolio correcto de Trhoncal Travel;
- identificar o crear catálogo correcto;
- conectar el feed;
- identificar WABA/número de Trhoncal Travel correcto;
- conectar el catálogo a WhatsApp Business;
- verificar producto de prueba.

### Kommo

- confirmar pipeline Travel;
- confirmar integración del WhatsApp correcto;
- importar/sincronizar catálogo si Kommo lo exige;
- validar qué acciones de producto/catálogo puede disparar Salesbot;
- validar plantillas requeridas para mensajes fuera de 24 h.

No crear duplicados de catálogo si existe uno utilizable.

## 7. Bloque D — automatización de interés y recuperación

No activar mensajes hasta que el catálogo y Kommo estén funcionando.

Modelo:

- contacto identificable muestra interés en `Oferta_ID`;
- guardar destino, Hotel_ID, Oferta_ID y fecha de vigencia;
- excluir automáticamente a quien ya reservó o rechazó seguimiento;
- recordatorio sugerido: 7 días antes de vencimiento;
- segundo recordatorio opcional: 2 días antes;
- máximo dos recordatorios automáticos por oferta;
- nunca enviar recordatorio de una oferta ya vencida;
- nunca afirmar disponibilidad sin reconfirmación;
- usar plantilla aprobada por Meta cuando corresponda.

Texto/imagen deberán tomar datos del mismo catálogo vigente.

## 8. Pipeline Travel mínimo propuesto

Mantenerlo corto:

1. Nuevo / Eligió viaje
2. Datos completos
3. Validando disponibilidad
4. Listo para confirmar
5. Reservación confirmada
6. Previaje

No implementar cambios de pipeline sin revisar primero el estado real de Kommo.

## 9. QA de lanzamiento

El cierre funcional se considera listo cuando:

- una oferta nueva se publica desde Maestro sin editar HTML;
- una oferta vencida desaparece de salidas públicas;
- el hotel permanente no desaparece al vencer una oferta;
- varias ofertas del mismo hotel pueden coexistir;
- ocupación puede cambiar entre ofertas (pareja/familia/menores/edades);
- precio, fechas e imagen vienen del Maestro;
- `Quiero este viaje` genera lead con contexto de la oferta;
- `Arma tu viaje` sigue funcionando como flujo personalizado;
- correo/registro de lead funciona;
- Vercel queda SUCCESS;
- pruebas automatizadas pasan;
- no hubo cambios visuales no autorizados.

## 10. Lo que NO bloquea empezar a vender

Puede quedar para después:

- mejoras estéticas;
- más animaciones;
- nuevos layouts;
- SEO fino;
- PDF más bonito;
- más destinos;
- reporting avanzado;
- retargeting sofisticado;
- chatbot IA avanzado;
- automatización completa del catálogo dentro de Kommo si requiere un paso manual temporal.

## 11. Regla de trabajo con David

- No pedir confirmación por cada cambio menor dentro de este alcance.
- Agrupar toda decisión humana en un solo bloque numerado.
- Detenerse sólo por: gasto, acción irreversible, eliminación, cambio visual/estructural público, cambio sensible en producción o decisión comercial real.
- Después de que David complete ese bloque, continuar con el siguiente bloque autónomo sin volver a pedir datos ya disponibles.
