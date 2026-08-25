# Trhoncal Travel — Preparación para Kommo

## Objetivo
Conectar Kommo después del pago sin rehacer la web ni perder trazabilidad.

## Fuente inicial
`13_Solicitudes_Web` conserva el lead y deberá seguir funcionando aunque Kommo tenga una falla temporal.

## Campos mínimos a sincronizar
- Lead_ID Trhoncal.
- Nombre / apellido.
- WhatsApp.
- Destino.
- Ciudad de salida.
- Fecha de salida/regreso.
- Viajeros.
- Hospedaje.
- Origen / URL origen / UTMs.
- Ocasion_ID.
- Oferta_ID.
- Estado.

## Campos de retorno a Sheet
- Kommo_Contact_ID.
- Kommo_Lead_ID.
- Fecha_sync_Kommo.
- Estado_sync_Kommo.
- WhatsApp_Message_ID cuando se envíe mensaje automático.

## Pipeline propuesto
Nuevo → Contactado → Calificado → Cotizando → Cotización enviada → Decisión pendiente → Pago en proceso → Reservado → En viaje → Ganado/Perdido.

## WhatsApp automático futuro
Después de registrar correctamente el lead y crear/actualizarlo en Kommo, enviar un resumen por el canal autorizado de WhatsApp. Si el mensaje es iniciado por la empresa fuera de la ventana permitida, utilizar una plantilla aprobada por Meta.

## Reglas de resiliencia
- Si Kommo falla, el lead NO se pierde: queda en Sheet con `Estado_sync_Kommo = Pendiente/Error`.
- Reintentar sincronización de forma idempotente usando Lead_ID.
- No crear contactos duplicados sólo porque cambió la fuente del lead.
- No almacenar tokens/secretos en código público; usar variables seguras/configuración del servicio.

## Dependencia
Requiere cuenta Kommo activa, credenciales y canal de WhatsApp cuando David decida contratarlo.