# Trhoncal Travel — Implementación V2 para Codex

## Objetivo
Convertir el sitio actual de cotización en una web editorial/comercial de Trhoncal Travel que combine:
1. información verificable de destinos;
2. inspiración y guías;
3. ofertas vigentes provenientes de proveedores;
4. CTA a CRM/WhatsApp/Jotform;
5. trazabilidad de fuentes;
6. control de publicación desde el Archivo Maestro.

## Regla de arquitectura
La web debe separar siempre:
- **contenido estable**: historia, atractivos, patrimonio, experiencias, perfil del viajero, combinaciones;
- **contenido dinámico**: precios, cupos, salidas, hoteles, vuelos, promociones y requisitos sujetos a cambio.

Ningún precio o disponibilidad se considera permanente.

## Fuente de verdad y control
En la primera etapa, el **Archivo Maestro de Trhoncal Travel en Google Sheets** funciona como panel de control/CMS ligero.

David controla publicación mediante columnas como:
- `Mostrar_Web`
- `Destacado_Home`
- `Orden_Home` / `Orden_Web`

La web debe consumir un endpoint JSON de solo lectura generado con Google Apps Script. Sanity queda pospuesto hasta que la operación justifique agregar otra capa.

### Regla crítica
**No existe un destino piloto fijo.**

Ningún destino debe quedar hardcodeado como portada, ficha inicial o ejemplo obligatorio. La web debe renderizar los destinos que el Archivo Maestro tenga activados.

Las capturas o ejemplos de PriceAgencies mostrados por David sirven únicamente para entender el funcionamiento del proveedor. No implican que Huatulco, Dreams, Decameron ni ningún otro hotel/destino sea una promoción aprobada.

## Marca
Marca pública: **Trhoncal Travel**.
Usar el logotipo oficial entregado por David (globo azul petróleo, trayectorias doradas, avión y wordmark TRHONCAL TRAVEL).

Paleta base:
- azul petróleo profundo: #124E5A
- dorado: #C8A96A
- blanco cálido: #F7F4ED
- texto oscuro: #173E48

No saturar la web de dorado. La fotografía de destino debe ser protagonista.

## Host inicial
Preparar el sitio para:
`viajes.trhoncalhomes.com.mx`

Usar rutas relativas/configurables para que posteriormente pueda migrarse a dominio propio de Trhoncal Travel sin rehacer la estructura de URLs.

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
- Hero editorial configurado desde datos, no hardcodeado a un destino específico.
- Buscador o selector de destinos.
- Bloque “Destinos para inspirarte”.
- Bloque “Ofertas destacadas” máximo 4, solo si el Maestro activa ofertas válidas.
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
- seoTitle / seoDescription / faq[]

No existe `ofertaRelacionada` obligatoria. La relación con ofertas debe ser dinámica por `destinationId` cuando exista una oferta real activada.

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
Campos previstos:
- id
- proveedor
- destinationId / destination
- titulo
- hotel/producto
- dias
- noches
- plan
- precio
- moneda
- unidadPrecio (total / por persona / por habitación)
- ocupacion
- urlProveedorInterna
- urlPromoCompartir
- pdfDisponible
- urlOArchivoPdf
- compartirWhatsAppProveedor
- compartirEmailProveedor
- fechaCaptura
- fechaVerificacion
- ultimaConfirmacionPrecio
- fechaVencimiento
- estado
- publicable
- mostrarWeb
- destacadaHome
- ordenWeb
- incluye[]
- noIncluye[]
- condiciones
- notas

Las ofertas se muestran públicamente solo cuando cumplan todos los controles del Maestro.

## PriceAgencies / Travel Promo Maker
El proveedor puede generar distintos activos de difusión:
- enlace compartible;
- PDF descargable;
- compartir por WhatsApp;
- compartir por correo.

Estos activos deben poder registrarse internamente. **Un material de muestra nunca se convierte por sí solo en oferta pública.**

## Integraciones existentes que NO deben romperse
Flujo actual:
Landing -> Jotform -> Make -> Kommo.
Jotform actual: https://form.jotform.com/261127730314044

Preservar esta integración durante la V2. Los CTA pueden enlazar al mismo formulario o WhatsApp mientras CRM definitivo se valida.

## Reglas UX/comerciales
- No enviar al cliente directamente al mayorista desde el home.
- Una oferta pública abre contenido de Trhoncal Travel; desde ahí el CTA lleva a CRM/WhatsApp/Jotform.
- Mostrar claramente “precio desde”, “por persona” o “precio total”.
- Mostrar fecha de última verificación cuando sea útil.
- Las fuentes pueden mostrarse en sección desplegable discreta.
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
- Article o esquema compatible cuando corresponda;
- sitemap y robots;
- contenido people-first, no páginas thin generadas automáticamente.

## Orden de construcción para Codex
1. Conectar una capa de datos que pueda leer JSON local ahora y endpoint del Maestro después.
2. Refactorizar home actual sin romper Jotform/WhatsApp.
3. Crear tarjetas de destino controladas por `Mostrar_Web`.
4. Crear plantilla dinámica de ficha de destino, sin destino piloto fijo.
5. Crear bloque de ofertas controlado por `Mostrar_Web`, `Publicable`, confirmación de precio y vigencia.
6. Añadir fuentes y fecha de verificación.
7. Integrar endpoint JSON del Archivo Maestro vía Apps Script.
8. Revisar responsive, accesibilidad, SEO/AEO y performance.

## Restricciones
- Trabajar en rama, no directamente en `main`.
- No borrar Jotform/Make/Kommo hasta nueva autorización.
- No publicar cambios en producción sin aprobación de David.
- No sustituir precios por inferencias.
- No crear un motor de reservación propio en esta fase.
- No convertir capturas, links o PDFs de demostración de proveedor en ofertas o prioridades de destino.
