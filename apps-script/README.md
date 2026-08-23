# Trhoncal Travel — Master Sheet bridge

## Google Sheet oficial de trabajo
- Título: `Trhoncal Travel | Archivo Maestro`
- Spreadsheet ID: `1jVIIMyQuNseDidYkErYDd58Ha3yxJA9oFXleFPjmUJw`

## Objetivo
Publicar únicamente los datos autorizados desde el Archivo Maestro sin hacer público el Google Sheet completo.

El script `Code.gs`:
- lee `01_Destinos`, `02_Fichas_Destino`, `05_Fuentes` y `07_Ofertas_Vigentes`;
- publica destinos sólo cuando `Mostrar_Web = Sí`;
- publica ofertas sólo cuando `Mostrar_Web = Sí`, `Publicable = Sí`, `Estado = Vigente`, existe confirmación de precio y no ha vencido;
- excluye del JSON público URLs internas de proveedor, PDF internos y controles operativos;
- devuelve fuentes únicamente de los destinos visibles;
- mantiene caché de 60 segundos para no golpear Sheets en cada visita.

## Despliegue manual único en Google Apps Script
1. Abrir el Google Sheet y elegir `Extensiones > Apps Script`.
2. Reemplazar el contenido de `Code.gs` por el archivo `apps-script/Code.gs` de este repositorio.
3. En Configuración del proyecto, fijar zona horaria `America/Mexico_City` si no quedó heredada del Sheet.
4. `Implementar > Nueva implementación > Aplicación web`.
5. Ejecutar como: `Yo`.
6. Quién tiene acceso: `Cualquier persona`.
7. Copiar la URL `/exec` y guardarla en Vercel como variable de entorno `TRHONCAL_MASTER_ENDPOINT`.
8. Volver a implementar la rama de desarrollo.

La web no consume directamente el Apps Script. Consume `/api/master`, que funciona como proxy en Vercel y mantiene el endpoint fuera del frontend.

## Prueba de aceptación
- En `01_Destinos`, poner un destino en `Mostrar_Web = Sí`.
- Esperar hasta 60 segundos.
- Recargar la web: debe aparecer.
- Cambiarlo a `No`.
- Esperar hasta 60 segundos y recargar: debe desaparecer.

No activar ofertas reales hasta que David haya validado precio, vigencia, ocupación y condiciones.
