# Trhoncal Travel — Sistema documental por operación

## Principio
Las condiciones comerciales variables no se definen como una política universal de Trhoncal Travel. Precio, disponibilidad, forma/fecha límite de pago, cambios, cancelación y penalizaciones dependen de cada tarifa, proveedor, servicio, fechas y momento de la reservación.

Cada operación debe conservar la evidencia de las condiciones que aplicaban cuando se cotizó o reservó.

## Estado 1 — Cotización
Se utiliza cuando todavía no existe una reservación confirmada por proveedor.

Debe contener, según aplique:
- Cotización_ID y Lead_ID.
- Fecha/hora de emisión y vigencia.
- Proveedor y referencia de producto/oferta.
- Cliente y viajeros.
- Destino, fechas y servicios solicitados.
- Hotel, habitación, plan, transporte, traslados, tours o extras.
- Precio confirmado en ese momento y moneda.
- Incluye / no incluye.
- Forma de pago disponible en ese momento.
- Condiciones de cambio/cancelación informadas por el proveedor.
- Advertencia de reconfirmación de precio y disponibilidad antes del pago/reserva.

Documento base: `PLANTILLA_COTIZACION.md`.

## Estado 2 — Reservación pendiente de pago
Se utiliza cuando el proveedor ya generó localizador/reserva, pero el pago aún no está liquidado o procesado conforme a las condiciones de esa operación.

Debe conservar, según aplique:
- Reserva_ID_Trhoncal.
- Localizador o número de reservación del proveedor.
- Estado visible: `Reservación pendiente de pago`.
- Titular y pasajeros.
- Hotel/servicio, fechas, horarios, habitación y plan.
- Precio de la reservación y saldo pendiente, cuando corresponda.
- Fecha/hora límite de pago, si el proveedor la establece.
- Política de cancelación específica de esa tarifa/reserva.
- Penalidades específicas.
- Instrucciones de check-in u operación.
- Condiciones adicionales del hotel/proveedor.
- Documento/PDF original del proveedor conservado como evidencia.

No debe transformarse una condición del proveedor en una política general de Trhoncal Travel.

## Estado 3 — Reservación confirmada / voucher
Se utiliza cuando la reservación y el pago requerido quedaron confirmados.

Debe conservar, según aplique:
- Reserva_ID_Trhoncal.
- Localizador/confirmación del proveedor.
- Estado visible: `Reservación confirmada`.
- Titular y pasajeros.
- Servicios confirmados, fechas y horarios.
- Importe pagado y saldo, si existiera.
- Voucher, confirmación y comprobantes asociados.
- Políticas particulares que siguen vigentes para cambios/cancelaciones/no-show.
- Datos de atención y soporte.
- Documentación de viaje relevante.

## Separación de responsabilidades
En cada documento deben distinguirse claramente:
1. **Condiciones del proveedor/hotel/tarifa:** cancelaciones, no-show, cambios, horarios, requisitos y penalidades propias del servicio.
2. **Condiciones administrativas de Trhoncal Travel:** únicamente aquellas que realmente sean propias de Trhoncal y hayan sido informadas para esa operación.

## Regla de archivo
Por cada operación se debe conservar, como mínimo:
- Cotización enviada.
- Evidencia de aceptación del cliente.
- Reconfirmación de precio/condiciones.
- Reservación pendiente de pago, si existió.
- Comprobante(s) de pago.
- Voucher/confirmación final.
- PDF o documento original del proveedor con las condiciones aplicables.
- Registro de modificaciones, cancelaciones o incidencias si las hubiera.

## Fuente operativa
La pestaña `20_Reservaciones` del Archivo Maestro funciona como índice y control. Los documentos originales del proveedor siguen siendo la evidencia primaria de sus condiciones; no se deben reescribir manualmente de forma incompleta en el Maestro.
