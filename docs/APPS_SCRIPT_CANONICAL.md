# Apps Script canónico — Trhoncal Travel

El único archivo que debe copiarse al proyecto de Google Apps Script vinculado al Archivo Maestro es:

`apps-script/Code.gs`

El archivo `scripts/apps-script-master-api.gs` queda como referencia histórica/legacy y no debe usarse para nuevos despliegues.

## Regla de despliegue

Cuando `apps-script/Code.gs` cambie en GitHub:

1. copiar la versión completa al `Código.gs` vinculado al Archivo Maestro;
2. guardar;
3. Administrar implementaciones → editar la aplicación web;
4. crear nueva versión;
5. ejecutar como propietario y acceso `Cualquiera`;
6. conservar/actualizar la URL `/exec` en el proxy sólo si Google cambia el deployment URL.

No es necesario redeployar por cada cambio de datos del Sheet. Sólo cuando cambia el código de Apps Script.

## Candados actuales

- destinos: sólo `Mostrar_Web=Sí`;
- ofertas: sólo si pasan todos los candados de publicación/precio/vigencia;
- imágenes: sólo si existe URL y `Permiso_uso_web=Sí`; fuente, licencia/autorización y crédito permanecen auditables en el Maestro.
