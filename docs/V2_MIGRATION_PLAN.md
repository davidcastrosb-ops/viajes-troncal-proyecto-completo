# Plan de migración V2 → Producción

## Objetivo
Migrar la nueva experiencia comercial sin apagar ni romper las rutas que hoy funcionan.

## Estado de seguridad
- Rama de trabajo: `feature/destination-hubs-v2-2026-08-29`.
- PR de revisión: #13 en Draft.
- Respaldo estable: `backup-ofertas-estable-2026-08-29`.
- `main` no se modifica durante QA.

## Criterios previos al primer cambio público
1. Vercel Preview en SUCCESS.
2. Hub Puerto Vallarta aprobado en desktop y móvil.
3. Mini sitio Friendly aprobado en desktop y móvil.
4. Formulario contextual abre y registra un lead TEST.
5. Regreso/navegación no depende de la flecha del navegador.
6. Oferta vencida/oculta no aparece como vigente.
7. Precio conserva su unidad real.
8. Hotel mantiene nombre comercial sin traducción.
9. PDF abre y comparte sin romper el flujo.
10. Q-015, Q-016, Q-017, Q-019, Q-020, Q-021, Q-022, Q-023, Q-029 y Q-030 = 0 hallazgos.

## Migración gradual
### Paso 1 — Un solo destino
Cambiar únicamente Puerto Vallarta desde la tarjeta de Destinos hacia el Hub nuevo.
No cambiar simultáneamente todos los destinos.

### Paso 2 — Una sola oferta
Dentro de Puerto Vallarta, enviar primero una promoción real al mini sitio nuevo (Friendly Fun).
Observar el recorrido completo.

### Paso 3 — Segundo hotel
Activar Barceló después de confirmar que Friendly no presenta regresiones.

### Paso 4 — Destinos adicionales
Replicar la ruta del Hub en destinos con promociones reales.
Un destino sin oferta puede conservar ficha informativa + CTA de cotización contextual.

### Paso 5 — PDF y compartir
Una vez estable el mini sitio, hacer que QR/compartir/PDF apunten a la nueva ruta pública.

## Rollback
Si aparece una regresión:
1. revertir el enlace público al `/mexico/:slug` o `/oferta/:id` actual;
2. no borrar datos de Maestro;
3. mantener mini sitio V2 fuera del tráfico;
4. usar `backup-ofertas-estable-2026-08-29` sólo si el problema requiere restauración completa;
5. corregir en la rama y volver a desplegar Preview.

## Qué no se debe hacer
- No migrar todos los destinos en un solo cambio.
- No borrar `/mexico/:slug` ni `/oferta/:id` al iniciar la migración.
- No publicar fotografías con permiso pendiente.
- No usar beneficios familiares sin fuente, edades y ocupación.
- No cambiar Apps Script repetidamente; coordinar una sola publicación de la API Master cuando el frontend ya esté aprobado.

## Definición de cierre
La V2 se considera lista cuando el cliente puede recorrer:
`Destinos → Hub → Hotel/Oferta → Formulario → Lead`
y también puede salir en cualquier momento a:
`Todos los destinos` o `Todas las ofertas`, sin usar el botón Atrás del navegador.
