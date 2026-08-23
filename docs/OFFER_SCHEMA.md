# Esquema de ofertas Trhoncal Travel

Las ofertas son datos dinámicos y no deben mezclarse con conocimiento estable del destino.

## Regla principal
Una captura, link, PDF o material compartido por un proveedor puede ser **solo una muestra de funcionamiento**. No se convierte en oferta de Trhoncal Travel hasta que David la cargue/autorice y el Archivo Maestro la marque como publicable.

## Campos mínimos de una oferta real
- id
- provider
- destinationId / destination
- title
- hotel / product
- days / nights
- plan
- price + currency
- priceUnit (total / por persona / por habitación)
- occupancy
- providerInternalUrl
- promoShareUrl
- pdfAvailable
- pdfUrlOrFile
- providerWhatsAppShareAvailable
- providerEmailShareAvailable
- capturedAt
- verifiedAt
- lastPriceConfirmation
- expiresAt
- publicable
- mostrarWeb
- destacadaHome
- ordenWeb
- status
- includes[]
- excludes[]
- terms
- notes

## PriceAgencies / Travel Promo Maker
Puede proporcionar al menos estas salidas operativas observadas:
- enlace compartible;
- PDF descargable;
- compartir por WhatsApp;
- compartir por correo.

Estos activos pueden guardarse en el Maestro para uso interno/comercial.

## Regla de publicación
Una oferta solo es visible si se cumplen **todas**:
- `Mostrar_Web = Sí`
- `Publicable = Sí`
- existe confirmación reciente de precio/condiciones
- no está expirada
- no está suspendida

`Destacada_Home = Sí` únicamente cambia la ubicación de una oferta ya publicable; nunca reemplaza las validaciones anteriores.
