# Trhoncal Travel — Respaldo y recuperación

## Activos críticos
1. GitHub: `davidcastrosb-ops/viajes-troncal-proyecto-completo`.
2. Vercel: proyecto vinculado a `main`.
3. Google Sheet: `Trhoncal Travel | Archivo Maestro`.
4. Google Apps Script: Web App que publica Maestro y recibe leads.
5. PriceAgencies/Travel Promo Maker: promociones y referencias de producto.

## Principio
Nunca corregir un problema de producción borrando la única copia de un dato. GitHub y el Archivo Maestro son las fuentes de recuperación de código y contenido respectivamente.

## Antes de un cambio relevante
- Confirmar que `main` está desplegando correctamente.
- Registrar qué archivo/pestaña se va a cambiar.
- No modificar a la vez código, Apps Script y estructura del Sheet si no es necesario.
- Para cambios de Apps Script, conservar la versión/despliegue anterior hasta validar el nuevo.

## Rollback web
1. Identificar último commit estable.
2. Comparar el cambio que introdujo el problema.
3. Revertir únicamente los archivos afectados o volver al commit estable.
4. Confirmar despliegue Vercel.
5. Probar home, ficha de destino, formulario y `/cuando-viajar/`.

## Rollback de contenido
- `Mostrar_Web = No` es la primera herramienta de contención para destinos/ofertas/ocasiones problemáticas.
- No borrar filas para retirar contenido de la web.
- Registrar la razón de retiro en notas/revisión.

## Apps Script
- Mantener documentado Deployment ID y URL activa.
- Antes de publicar nueva versión, comparar `Code.gs` y `LeadSubmission.gs` con GitHub.
- Si falla, volver al despliegue anterior y no tocar el Sheet hasta identificar la causa.

## Leads
`13_Solicitudes_Web` no debe eliminarse ni exponerse en el endpoint público. Los leads son datos operativos y deben mantenerse separados de la salida pública del Maestro.

## Prueba de recuperación trimestral
- Abrir una ficha de destino.
- Confirmar `/api/master`.
- Enviar un lead TEST.
- Confirmar registro en Sheet.
- Confirmar que una oferta se puede ocultar desde Maestro sin cambiar código.

## Evidencia
Registrar incidentes de recuperación y cambios mayores en `16_Cierre_Proyecto` o en el expediente técnico correspondiente.