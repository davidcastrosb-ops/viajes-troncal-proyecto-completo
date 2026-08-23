# Trhoncal Travel V2 — Estado actual

Fecha de corte: 2026-08-23

## Ya operativo
- Archivo Maestro convertido a Google Sheet nativo.
- Spreadsheet ID: `1jVIIMyQuNseDidYkErYDd58Ha3yxJA9oFXleFPjmUJw`.
- Apps Script desplegado por David como web app.
- Endpoint Apps Script activo recibido:
  `https://script.google.com/macros/s/AKfycbxxpHTcKw5JI96QC9gXmEBpCOMEv1A5jYhOqNdsZXt-chMpnt3AnWTXohCTaEPaBwHu/exec`
- `api/master.js` apunta al endpoint Apps Script y mantiene `TRHONCAL_MASTER_ENDPOINT` como override opcional.
- Frontend usa `/api/master` como fuente primaria y JSON local sólo como fallback de desarrollo.
- Control editorial: `Mostrar_Web`, `Destacado_Home`, `Orden_Home`.
- Control de ofertas: publicación sólo con autorización, estado vigente, confirmación de precio y no expiración.
- Ofertas activas iniciales: 0.
- Capturas de PriceAgencies: sólo demostración de herramientas del proveedor; no son ofertas.
- Subdominio objetivo inicial: `viajes.trhoncalhomes.com.mx`.

## Siguiente prueba
1. Confirmar despliegue de Vercel de la rama.
2. Confirmar que `/api/master` responda JSON.
3. Con todos los controles en `No`, validar `destinations: []` y `offers: []`.
4. Activar temporalmente un destino desde el Maestro con `Mostrar_Web = Sí`.
5. Validar que aparece en la web y después regresar el control a `No`.

## Después
- Importar logo oficial como asset binario.
- Plantilla dinámica de destino.
- Fuentes por destino.
- SEO/AEO.
- Responsive/accesibilidad.
- Configurar `viajes.trhoncalhomes.com.mx` en Vercel/DNS.
