# Trhoncal Travel V2 — estado de construcción

Fecha: 2026-08-22

## Carril web

- Rama: `feat/trhoncal-travel-knowledge-site-v2`
- Home editorial-comercial ya reemplazado en rama de desarrollo.
- La navegación separa destinos, inspiración, ofertas, fuentes y cotización.
- El flujo Jotform → Make → Kommo se conserva.
- El home consume `assets/data/destinations.json` y solo renderiza destinos verificados.
- Las promociones legacy no se muestran como oferta pública mientras no tengan `publicable: true`.
- La marca pública ya está cambiada a **Trhoncal Travel** en configuración.
- Colores base alineados con identidad azul petróleo + dorado.

## Carril de conocimiento

- 15 destinos iniciales de México ya cuentan con verificación base.
- El Archivo Maestro v0.5 registra 51 fuentes y controles de publicación.
- Cada destino web lleva `sourceIds` y `lastVerified`.

## Pendiente inmediato de desarrollo

1. Importar el logotipo oficial aprobado del 22-08-2026 como asset binario y sustituir el wordmark temporal.
2. Crear ruta/ficha individual de Huatulco.
3. Crear componente de fuentes por destino.
4. Migrar promociones a esquema estructurado (`publicable`, precio, unidad, vigencia, verificación, proveedor).
5. Preparar capa compatible con Sanity sin activarlo todavía.
6. Agregar metadata SEO/AEO por destino.

## Restricciones

- No modificar `main` hasta revisión de David.
- No publicar precio/cupo sin verificación vigente.
- No presentar rankings editoriales como “calificación mundial oficial”.
- No romper Jotform/Make/Kommo.
