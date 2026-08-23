# Trhoncal Travel V2 — Estado actual

Fecha de corte: 2026-08-23

## Ya operativo
- Archivo Maestro convertido a Google Sheet nativo.
- Spreadsheet ID: `1jVIIMyQuNseDidYkErYDd58Ha3yxJA9oFXleFPjmUJw`.
- Zona horaria del Sheet corregida a `America/Mexico_City`.
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
- Despliegue de Vercel de la rama confirmado como Ready.

## Prueba temporal de control
- Cancún se activó temporalmente en el Maestro con `Mostrar_Web=Sí`, `Destacado_Home=Sí`, `Orden_Home=1`.
- Esta activación es exclusivamente para validar el interruptor Maestro → Apps Script → web; no significa prioridad comercial ni decisión de publicación definitiva.
- Después de confirmar visualmente el flujo se regresará a `No` si David así lo decide.

## Siguiente prueba
1. Abrir la Preview de Vercel.
2. Confirmar que `/api/master` responde y que Cancún aparece.
3. Cambiar `Mostrar_Web` de Cancún de `Sí` a `No` y comprobar que desaparece tras el ciclo de caché.

## Después
- Importar logo oficial como asset binario.
- Plantilla dinámica de destino.
- Fuentes por destino.
- SEO/AEO.
- Responsive/accesibilidad.
- Configurar `viajes.trhoncalhomes.com.mx` en Vercel/DNS.
