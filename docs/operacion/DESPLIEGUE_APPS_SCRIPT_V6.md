# Trhoncal Travel — Despliegue único de Apps Script

Fecha de preparación: 2026-08-25

## Objetivo

Publicar en el Web App vigente los cambios ya preparados en GitHub para que el Archivo Maestro sea la fuente principal también de calendario, ocasiones y nuevos campos de atribución de leads.

El frontend ya opera en modo **Master-first con fallback local**. Si el Web App todavía no devuelve una sección, la web conserva el JSON local como respaldo y no se rompe.

## Archivos que deben quedar vigentes en Apps Script

1. `apps-script/Code.gs`
   - Expone `calendar` desde `14_Calendario_MX`.
   - Expone `occasions` desde `15_Ocasiones_Viaje`.
   - Mantiene destinos, fuentes y ofertas filtrados para publicación.

2. `apps-script/LeadSubmission.gs`
   - Conserva la recepción de solicitudes web.
   - Incluye los campos nuevos de atribución comercial preparados para el Sheet.

## Procedimiento de publicación

1. Abrir el proyecto de Apps Script asociado a **Trhoncal Travel | Archivo Maestro**.
2. Confirmar que `Code.gs` y `LeadSubmission.gs` coincidan con las versiones actuales del repositorio `davidcastrosb-ops/viajes-troncal-proyecto-completo`.
3. Guardar el proyecto.
4. Ir a **Implementar > Administrar implementaciones**.
5. Editar la implementación Web App existente y seleccionar **Nueva versión**. No crear una URL distinta.
6. Implementar y confirmar que se conserva la URL pública actual del Web App.

## Verificación obligatoria después del despliegue

### Master
Abrir el Web App y comprobar que el JSON contenga, como mínimo:

- `destinations`
- `sources`
- `offers`
- `calendar`
- `occasions`

`calendar.events` debe contener datos y `occasions` debe ser un arreglo.

### Web
1. Abrir `/cuando-viajar/` con recarga forzada.
2. Verificar que aparezcan fechas y la ocasión de Revolución.
3. Abrir el formulario nativo y desplegar el calendario.
4. Confirmar que el calendario siga mostrando fechas oficiales.
5. Enviar una solicitud de prueba sólo si se desea validar también los nuevos campos de atribución.

## Criterio de cierre

C-001 queda HECHO cuando `/api/master` devuelve `occasions` desde el Web App publicado.

C-047 queda HECHO cuando home, `/cuando-viajar/` y el calendario del formulario consumen Master como primera fuente y el JSON local funciona únicamente como fail-safe.

## Rollback

Si el nuevo Web App presenta un error, volver a la versión anterior desde **Administrar implementaciones**. El frontend mantiene fallback local para calendario/ocasiones, por lo que la experiencia pública no debe quedar vacía durante el rollback.
