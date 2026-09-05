# Trhoncal Travel — Estado actual y continuidad

Última actualización: 2026-09-05

Este archivo existe para retomar el proyecto en cualquier chat, con Codex u otro asistente, sin reconstruir semanas de conversación. El chat es la mesa de trabajo; este documento resume la lógica operativa vigente.

## 1. Objetivo operativo actual

Trhoncal Travel debe permitir publicar promociones reales de viaje desde el Archivo Maestro, sin editar HTML, CSS, Vercel ni Apps Script para cada oferta.

Flujo preferido por David:

**David envía promoción (captura, enlace, PDF o datos) → asistente verifica → publica en Maestro → valida en web → revisa imagen, precio, fechas, WhatsApp, formulario y correo.**

David no necesita capturar manualmente la promoción salvo que quiera hacerlo.

## 2. Producción vigente

Sitio público:
- https://viajes.trhoncalhomes.com.mx/

Estado confirmado:
- Home reordenada con **Ofertas destacadas inmediatamente después del hero**.
- Se conserva el contenido editorial/de valor; no se eliminó información.
- Botones de WhatsApp principales en verde.
- Footer con logo visible sobre fondo oscuro.
- Tarjetas de Friendly, Barceló y Grand Decameron muestran imagen, precio, fechas y CTA.
- Página `/oferta/:id` muestra imagen promocional y WhatsApp verde.
- Micrositios `/hotel-v2/:slug?oferta=...` funcionan con galerías locales estables.
- Social preview de Friendly y Barceló comprobado en WhatsApp; sistema de previews usa imágenes públicas del mismo origen.

## 3. Ofertas piloto activas conocidas

### Friendly Fun Vallarta
- Oferta_ID: `OF-PA-PVR-REV26-001`
- Hotel_ID: `HOT-PVR-FRIENDLY-001`
- Micrositio: `https://viajes.trhoncalhomes.com.mx/hotel-v2/friendly-fun-vallarta?oferta=OF-PA-PVR-REV26-001`
- Promo proveedor estable: `https://mx.travelpromomaker.com/promotion/160853`

### Barceló Puerto Vallarta
- Oferta_ID: `OF-PA-PVR-SEP26-002`
- Hotel_ID: `HOT-PVR-BARCELO-001`
- Micrositio: `https://viajes.trhoncalhomes.com.mx/hotel-v2/barcelo-puerto-vallarta?oferta=OF-PA-PVR-SEP26-002`
- Promo proveedor estable: `https://mx.travelpromomaker.com/promotion/161469`

### Grand Decameron Bucerías
- Oferta_ID: `OF-PA-NAY-REV26-003`
- Hotel_ID: `HOT-NAY-DECAMERON-001`
- Micrositio: `https://viajes.trhoncalhomes.com.mx/hotel-v2/grand-decameron-bucerias?oferta=OF-PA-NAY-REV26-003`
- Promo proveedor estable: `https://mx.travelpromomaker.com/promotion/161489`

Regla: usar URLs estables `/promotion/<id>` del proveedor. No usar como identificador permanente enlaces dinámicos `/promomaker/contact/.../copy`.

## 4. Archivo Maestro

Google Sheet:
- Nombre: `Trhoncal Travel | Archivo Maestro`
- ID: `1jVIIMyQuNseDidYkErYDd58Ha3yxJA9oFXleFPjmUJw`

Pestañas clave:
- `07_Ofertas_Vigentes`: fuente normalizada consumida por la web.
- `13_Solicitudes_Web`: leads recibidos.
- `21_Hoteles_Maestro`: ficha reutilizable de hoteles.
- `22_Hotel_Imagenes`: galería y trazabilidad de imágenes.
- `23_Oferta_Segmentos`: segmentos relacionados con ofertas.
- `24_Publicador_Ofertas`: interfaz simplificada para crear nuevas ofertas.

Existe respaldo de `07_Ofertas_Vigentes` creado el 2026-09-05.

## 5. Publicador de ofertas — Fase 1

`24_Publicador_Ofertas` está diseñado para capturar una oferta una sola vez.

Campos operativos principales:
- Publicar
- Hotel
- Salida
- Regreso
- Precio_MXN
- Unidad_precio
- Ocupación
- Plan
- URL_proveedor
- Precio_confirmado_el
- Vigente_hasta
- Destacada_home
- Orden_web
- Título_opcional
- Nota_publicación
- Incluye
- No_incluye

El sistema calcula datos técnicos como:
- `Oferta_ID`
- destino
- días/noches
- Hotel_ID
- imagen principal
- URL pública
- URL PDF
- título por defecto
- campos que consume `07_Ofertas_Vigentes`

Estados de validación:
- `BORRADOR`
- `FALTAN DATOS`
- `HOTEL NO REGISTRADO`
- `FECHAS INVÁLIDAS`
- `VENCIDA`
- `LISTA PARA WEB`

Sólo una fila validada como `LISTA PARA WEB` debe entrar al flujo de publicación.

Las tres ofertas históricas/piloto permanecen en las filas existentes de `07_Ofertas_Vigentes`; las ofertas futuras del publicador alimentan las filas posteriores.

## 6. Regla de hoteles

Si el hotel ya existe en `21_Hoteles_Maestro`, una nueva promoción puede reutilizar:
- Hotel_ID
- slug
- descripción
- portada
- galería
- micrositio

Si el hotel es nuevo, primero se da de alta una sola vez en `21_Hoteles_Maestro` y se cargan sus fotos a `22_Hotel_Imagenes` / assets. Después sus siguientes promociones no requieren repetir ese trabajo.

Estándar de imágenes:
- David puede entregar una carpeta de Drive con fotos sin renombrar.
- El sistema/asistente elige portada y orden.
- `01.jpg` = portada.
- Assets públicos deben quedar bajo `/assets/images/hoteles/<slug>/`.
- Evitar URLs protegidas o de previews privados.

## 7. Leads y correo

Apps Script de recepción de leads está operativo en versión funcional equivalente a v12.

Comportamiento confirmado:
- Formulario registra en `13_Solicitudes_Web`.
- Correo principal: `trhoncal.viajes@gmail.com`.
- Copia: `davidcastrosb@gmail.com`.
- El correo incluye:
  - promoción en Trhoncal Travel,
  - referencia del proveedor,
  - origen de la solicitud.

No modificar Apps Script, endpoint, destinatarios ni lógica de leads salvo fallo real o cambio solicitado.

## 8. Qué NO tocar sin necesidad

- No rehacer la home.
- No eliminar contenido editorial/de valor.
- No volver a cambiar Apps Script por ajustes cosméticos.
- No sustituir imágenes públicas por URLs de preview protegidas.
- No enviar al cliente directamente al proveedor cuando debe capturarse el lead en Trhoncal.
- No crear otra arquitectura paralela si el Maestro ya puede ser la fuente.

## 9. Regla comercial y de protección

Toda oferta debe tratar precio y disponibilidad como información reconfirmable.

Debe existir:
- fecha de última confirmación de precio,
- fecha de expiración/vigencia,
- proveedor/fuente,
- estado publicable.

Una oferta vencida no debe seguir promocionándose como vigente.

## 10. Fase 2 pendiente — Meta + WhatsApp Catalog

Objetivo futuro:

**Archivo Maestro → feed de catálogo → Meta / WhatsApp**

Llave recomendada: `Oferta_ID`.

Antes de implementar:
1. auditar el catálogo real disponible en el Business Portfolio de Trhoncal Travel;
2. verificar elegibilidad y conexión con WhatsApp Manager;
3. definir si el feed será compartido o habrá salidas separadas para Meta y WhatsApp;
4. preferir inicialmente un feed automático estable antes que una integración API compleja.

No iniciar Fase 2 hasta validar Fase 1 con una nueva promoción real.

## 11. Siguiente acción concreta

**David envía la próxima promoción real.**

El asistente debe:
1. revisar y verificar la promoción;
2. identificar si el hotel ya existe;
3. si existe, publicarla mediante `24_Publicador_Ofertas`;
4. si es nuevo, dar de alta hotel + imágenes primero;
5. confirmar que aparece en web;
6. revisar tarjeta, micrositio, precio, fechas, WhatsApp y formulario;
7. documentar cualquier cambio importante en este archivo.

## 12. Instrucción para un chat nuevo

David puede escribir simplemente:

**“Continuamos Trhoncal Travel desde el estado maestro.”**

El asistente debe leer este archivo y el Archivo Maestro antes de pedir a David que repita información del proyecto.
