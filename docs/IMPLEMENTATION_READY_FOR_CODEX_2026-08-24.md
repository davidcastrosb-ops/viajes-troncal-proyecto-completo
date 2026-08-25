# Trhoncal Travel — paquete listo para Codex/desarrollador

Este documento elimina interpretación sobre la siguiente evolución visual/comercial.

## Hero
- Kicker: `Viajar empieza con una emoción`
- H1: `Atrévete a viajar`
- Acento: `nosotros te ayudamos a hacerlo real`
- Subtexto: `Inspírate, descubre destinos y cuéntanos qué quieres vivir. Revisamos opciones reales, precio y condiciones antes de que reserves.`
- CTA primario: `Explorar destinos`
- CTA secundario: `Quiero cotizar`
- Visual: fotografías reales provenientes exclusivamente de destinos visibles con `Permiso_uso_web=Sí`.

## Categorías
1. Familia — `Viajes que se disfrutan juntos`
2. Pareja — `Escapadas para dos`
3. Playa — `El mar también es destino`
4. Cultura — `Historias que se viven`
5. Naturaleza — `Sal de la rutina`
6. Gastronomía — `Sabores que valen el viaje`

Cada tarjeta:
- imagen superior 16:10;
- overlay de gradiente;
- kicker corto;
- título aspiracional;
- descripción de máximo 2–3 líneas;
- 2–3 chips con destinos reales;
- contador de coincidencias;
- CTA `Descubrir destinos`;
- imagen elegida entre coincidencias publicadas, con preferencia editorial y fallback seguro.

## Móvil
- una tarjeta ~84vw;
- debe asomar la siguiente;
- swipe natural;
- botones Anterior/Siguiente visibles;
- contador;
- autoplay se detiene tras interacción;
- `prefers-reduced-motion` desactiva movimiento automático.

## Promociones
- sección oculta con 0 ofertas.
- con ofertas: carrusel responsive.
- CTA primario `Ver promoción` sólo si `Enlace_Publico_Autorizado=Sí`.
- CTA secundario `Quiero asesoría` a WhatsApp.
- CTA terciario `Dejar mis datos` sólo si existe `URL_Formulario_Lead` y `Destino_Lead_Verificado`.
- no exponer URL interna de proveedor.
- autoexpirar según Maestro.

## SEO/Marca
- favicon global de Trhoncal.
- home: `Atrévete a viajar | Trhoncal Travel`.
- ficha: `Descubre [Destino] | Trhoncal Travel`.
- canonical y SSR se conservan.

## Criterio de aceptación
- ningún cambio rompe 16 destinos actuales;
- ningún ejemplo de prueba aparece como oferta;
- Vercel SUCCESS antes de merge;
- desktop y mobile mantienen navegación evidente;
- sin foto autorizada se usa fallback de marca, nunca hotlink no autorizado.
