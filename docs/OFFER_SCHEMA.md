# Esquema de ofertas Trhoncal Travel

Las ofertas son datos dinámicos y no deben mezclarse con conocimiento estable del destino.

Campos mínimos:
- id
- provider
- destinationId / destination
- title
- days / nights
- plan
- price + currency
- priceUnit (total / por persona / por habitación)
- occupancy
- sourceUrl
- capturedAt
- verifiedAt
- expiresAt
- publicable
- status
- terms
- notes

Regla de publicación: `publicable=true` solo después de reconfirmar precio, vigencia, ocupación, cupo y condiciones con el proveedor.
