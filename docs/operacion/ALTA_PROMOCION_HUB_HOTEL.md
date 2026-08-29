# Alta de promoción — Hub de Destino + Mini sitio de hotel

## Objetivo
Que una promoción nueva pueda entrar al ecosistema Trhoncal Travel sin duplicar información ni tocar código cuando el hotel ya existe.

## 1. Capturar la oferta en `07_Ofertas_Vigentes`
Campos mínimos antes de mostrarla en web:
- `Oferta_ID` único.
- `Proveedor_ID`.
- `Destino_ID` existente en `01_Destinos`.
- `Título` público.
- `Hotel` con nombre comercial oficial, sin traducir.
- `Días`, `Noches`, `Plan`.
- `Precio_MXN` y `Unidad_precio` (`precio total`, `por persona`, `desde`, etc.).
- `Ocupación` real de la cotización.
- `Estado = Vigente`.
- `Publicable = Sí`.
- `Mostrar_Web = Sí` sólo después de validar todos los datos.
- `Última_verificación` y `Ultima_Confirmacion_Precio`.
- `Fecha_Expiracion_Web`.
- `Imagen_Promo_URL` real de la promoción/hotel.
- `Fecha_Viaje_Inicio` / `Fecha_Viaje_Fin`.
- `URL_Promo_Publica` y/o enlace del proveedor como evidencia operativa.
- `Hotel_ID`.

## 2. Resolver el hotel
### Si el hotel ya existe
Reutilizar exactamente su `Hotel_ID`. No crear otra ficha ni otra carpeta de imágenes.

### Si el hotel es nuevo
Crear una fila en `21_Hoteles_Maestro` con:
- nombre comercial oficial;
- slug estable;
- destino;
- dirección;
- descripción pública verificable;
- sitio/fuente oficial;
- amenidades verificadas;
- referencia de habitación sólo si está documentada;
- ruta de assets permanente.

## 3. Clasificar la configuración comercial en `23_Oferta_Segmentos`
La clasificación describe **cómo fue cotizada esa oferta**, no a quién creemos que podría gustarle.

Categorías actuales:
- `Pareja`: normalmente 2 adultos y 0 menores.
- `Familia con menores con beneficio`: requiere edades exactas y condición real del proveedor.
- `Familias con juniors`: requiere edades exactas y tarifa/condición junior o infantil documentada.

Nunca publicar `niños gratis`, beneficio infantil o tarifa junior sin edad, ocupación y fuente.

## 4. Fotografías
Registrar cada imagen permanente en `22_Hotel_Imagenes`.
No reutilizar una imagen de otro hotel.
No usar imágenes generadas por IA para representar instalaciones reales.
`Permiso_Uso_Web` debe estar aprobado antes de integrar una imagen a la galería/PDF definitivo.

## 5. Controles antes de `Mostrar_Web = Sí`
Revisar `17_Control_Calidad`, especialmente:
- Q-003 vigencia;
- Q-004 confirmación de precio;
- Q-012 nombre de hotel;
- Q-014 imagen de promoción;
- Q-015 Hotel_ID;
- Q-016 segmento;
- Q-017 edades familiares;
- Q-019 fuente de condición familiar;
- Q-020 Hotel_ID existente;
- Q-021 segmento no huérfano;
- Q-022 fechas coherentes;
- Q-023 unidad de precio;
- Q-029 nombre maestro del hotel;
- Q-030 recorrido completo.

## 6. Resultado esperado
Cuando la oferta pasa los controles:
`Destino → Hub → Hotel → Promoción → Formulario contextual → Lead`.

La promoción puede vencer y desaparecer sin borrar la ficha permanente del hotel ni su biblioteca de imágenes.
