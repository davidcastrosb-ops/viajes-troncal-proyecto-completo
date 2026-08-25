# Auditoría QA de contenido público — 2026-08-25

## Alcance
Archivo Maestro `02_Fichas_Destino` y destinos actualmente activados con `Mostrar_Web = Sí`.

## Resultado
Los 16 destinos publicados no presentan en sus campos públicos los patrones internos que se habían prohibido como lenguaje editorial de cara al cliente.

## Hallazgos en cola NO publicada
Se detectó lenguaje interno todavía presente en fichas que hoy no están publicadas, por ejemplo:
- “Trhoncal: X noches”.
- “pendiente de curaduría”.
- “antes de campaña”.
- recomendaciones/proveedores “por validar”.

Aparece en fichas como Acapulco, CDMX, Oaxaca de Juárez, San Cristóbal, Palenque, Mérida, Valladolid, San Miguel de Allende, Guanajuato, Querétaro, Puebla y Barrancas del Cobre/Creel.

## Regla de publicación
Antes de cambiar cualquiera de esos destinos a `Mostrar_Web = Sí`, debe pasar por una revisión de copy público que:
1. elimine lenguaje de trabajo interno;
2. convierta duración a lenguaje de viajero sin marca interna;
3. elimine “pendiente”, “antes de campaña” y equivalentes;
4. mantenga riesgos operativos únicamente en campos internos;
5. confirme imagen/licencia y fuentes.

## Riesgo
Bajo para la web actual, porque los registros detectados permanecen ocultos. Alto si se activan sin revisión previa.

## Criterio de cierre
Todo destino nuevo debe tener QA de contenido público antes de `Mostrar_Web = Sí`.