# Trhoncal Travel V2 — estado de construcción

Fecha: 2026-08-22

## Carril web
- Rama: `feat/trhoncal-travel-knowledge-site-v2`
- Home editorial-comercial en desarrollo.
- Navegación separa destinos, inspiración, ofertas, fuentes y cotización.
- Se conserva Jotform → Make → Kommo.
- La marca pública ya es **Trhoncal Travel** en configuración.
- Colores base: azul petróleo + dorado.
- Host inicial previsto: `viajes.trhoncalhomes.com.mx`.

## Corrección de arquitectura
- **No existe destino piloto fijo.**
- Huatulco, Dreams, Decameron u otros elementos vistos en capturas de PriceAgencies fueron muestras del funcionamiento de Travel Promo Maker, no promociones aprobadas.
- `assets/data/promos.json` queda vacío hasta que David cargue/autorice ofertas reales.
- La plantilla de destino debe ser dinámica para cualquier destino que el Archivo Maestro active con `Mostrar_Web=Sí`.

## Carril de conocimiento
- 15 destinos iniciales de México cuentan con verificación base.
- Archivo Maestro v0.7: 51 fuentes registradas y control de publicación.
- Las ofertas reales cargadas actualmente son: **0**.
- PriceAgencies queda registrado como proveedor capaz de generar link, PDF, compartir por WhatsApp y correo.

## Fuente de datos
Primera etapa:
`Google Sheets / Archivo Maestro → Apps Script JSON (solo lectura) → web`

Sanity queda pospuesto.

## Pendiente inmediato de desarrollo
1. Importar el logotipo oficial aprobado como asset binario.
2. Construir plantilla dinámica de destino sin hardcodear ninguno.
3. Conectar visibilidad de destinos a `Mostrar_Web`, `Destacado_Home` y orden del Maestro.
4. Crear componente de fuentes por destino.
5. Crear componente de ofertas que solo renderice registros válidos activados desde el Maestro.
6. Preparar endpoint Apps Script y lectura de JSON público.
7. Agregar metadata SEO/AEO dinámica.
8. Preparar despliegue de prueba sobre `viajes.trhoncalhomes.com.mx` sin tocar producción hasta aprobación.

## Restricciones
- No modificar `main` hasta revisión de David.
- No publicar precio/cupo sin verificación vigente.
- No convertir muestras de proveedor en ofertas.
- No presentar rankings editoriales como “calificación mundial oficial”.
- No romper Jotform/Make/Kommo.
