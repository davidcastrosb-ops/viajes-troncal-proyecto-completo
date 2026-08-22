# Trhoncal Travel — Implementación V2 para Codex

## Objetivo
Convertir el sitio actual de cotización en una web editorial/comercial de Trhoncal Travel que combine:
1. información verificable de destinos;
2. inspiración y guías;
3. ofertas vigentes provenientes de proveedores;
4. CTA a CRM/WhatsApp/Jotform;
5. trazabilidad de fuentes;
6. preparación para migrar contenido a Sanity sin rehacer componentes.

## Regla de arquitectura
La web debe separar siempre:
- **contenido estable**: historia, atractivos, patrimonio, experiencias, perfil del viajero, combinaciones;
- **contenido dinámico**: precios, cupos, salidas, hoteles, vuelos, promociones y requisitos sujetos a cambio.

Ningún precio o disponibilidad se considera permanente.

## Marca
Marca pública: **Trhoncal Travel**.
Usar el logotipo oficial entregado por David (globo azul petróleo, trayectorias doradas, avión y wordmark TRHONCAL TRAVEL).
Paleta base provisional:
- azul petróleo profundo: #124E5A
- dorado: #C8A96A
- blanco cálido: #F7F4ED
- texto oscuro: #173E48
No saturar la web de dorado. La fotografía de destino debe ser protagonista.

## Navegación objetivo
- Inicio
- Destinos
  - México
  - Pueblos Mágicos
  - Europa
  - América del Sur
- Inspírate / Guías
- Ofertas
- Nosotros
- Cotiza tu viaje

## Componentes mínimos
### Home
- Hero editorial con destino destacado.
- Buscador o selector de destinos (puede iniciar como filtro local).
- Bloque “Destinos para inspirarte”.
- Bloque “Ofertas destacadas” máximo 4.
- Bloque “Por qué viajar con Trhoncal Travel”.
- CTA de cotización.

### Ficha de destino
Campos previstos:
- slug
- nombre
- estado/region
- país
- puebloMagico
- tipos/segmentos
- resumen
- historia
- porQueIr
- atractivos[]
- experiencias[]
- gastronomia
- perfilViajero[]
- duracionSugerida
- climaTemporadas
- conectividad
- combinaciones[]
- sostenibilidadPatrimonio
- riesgosOperativos
- reconocimientos[]
- calificacionMundialNota
- fuentes[]
- ultimaVerificacion
- ofertaRelacionada opcional
- seoTitle / seoDescription / faq[]

### Fuente
Cada fuente debe aceptar:
- id
- organismo
- titulo
- url
- nivel
- fechaVerificacion
- nota

### Oferta
- id
- proveedor
- destinoId
- titulo
- hotel
- dias
- noches
- plan
- precio
- moneda
- unidadPrecio (total / por persona)
- ocupacion
- urlProveedorInterna
- fechaVerificacion
- fechaVencimiento
- estado
- publicable
- incluye[]
- noIncluye[]
- condiciones

Las ofertas con `publicable=false`, vencidas o sin verificación reciente no deben mostrarse públicamente.

## Datos iniciales ya investigados
Destinos con ficha inicial verificada:
- Bahías de Huatulco
- Cancún
- Riviera Maya / Playa del Carmen
- Tulum
- Cozumel
- Isla Mujeres
- Bacalar

La fuente de verdad editorial de trabajo es el Archivo Maestro de Trhoncal Travel; el código debe poder consumir JSON local primero y Sanity después.

## Integraciones existentes que NO deben romperse
El repositorio actual tiene flujo:
Landing -> Jotform -> Make -> Kommo.
Jotform actual: https://form.jotform.com/261127730314044

Preservar esta integración durante la V2. Los nuevos CTA pueden enlazar al mismo formulario o WhatsApp mientras CRM definitivo se valida.

## Reglas UX/comerciales
- No enviar al cliente directamente al mayorista desde el home.
- Una oferta debe abrir landing Trhoncal; desde ahí el CTA lleva a CRM/WhatsApp/Jotform.
- Mostrar claramente “precio desde”, “por persona” o “precio total”.
- Mostrar fecha de última verificación cuando sea útil.
- Las fuentes pueden mostrarse en sección desplegable discreta, no como bibliografía pesada.
- Mobile-first.
- WCAG 2.2 AA como objetivo.
- No inventar ratings, premios o reviews.

## SEO/AEO
Preparar:
- metadata dinámica por destino;
- canonical;
- Open Graph;
- BreadcrumbList;
- Organization;
- Article o TouristDestination cuando sea semánticamente correcto y compatible;
- FAQPage solo si cumple lineamientos vigentes de buscadores;
- sitemap y robots;
- contenido people-first, no páginas thin generadas automáticamente.

## Orden de construcción para Codex
1. Crear estructura de datos local (`assets/data/destinations.json`, `sources.json`, `promos.json`).
2. Refactorizar home actual sin romper Jotform/WhatsApp.
3. Crear tarjetas de destino.
4. Crear plantilla dinámica de ficha de destino.
5. Crear bloque de ofertas con control de publicable/vigencia.
6. Añadir fuentes y fecha de verificación.
7. Preparar capa de datos para reemplazo posterior por Sanity.
8. Revisar responsive, accesibilidad y performance.

## Restricciones
- Trabajar en rama, no directamente en `main`.
- No borrar el flujo actual de Jotform/Make/Kommo hasta nueva autorización.
- No publicar cambios en producción sin aprobación de David.
- No sustituir precios por inferencias.
- No crear un motor de reservación propio en esta fase.
