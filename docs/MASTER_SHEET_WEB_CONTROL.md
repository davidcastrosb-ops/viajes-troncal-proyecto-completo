# Trhoncal Travel — Master Sheet as initial web control

## Decision
For the first stage, the Trhoncal Travel Master Sheet acts as a lightweight CMS/control panel.

- Research and sources live in the Master Sheet.
- David controls visibility with `Mostrar_Web`, `Destacado_Home` and order columns.
- Offers require explicit activation plus price confirmation and expiration control.
- Google Apps Script exposes only public fields as JSON.
- The website consumes that JSON.
- Sanity is postponed until the content operation justifies the extra layer.

## Initial host
`viajes.trhoncalhomes.com.mx`

This allows launch without purchasing a new domain. The web application must use relative paths and environment/config variables so it can later migrate to a Trhoncal Travel domain.

## Domain migration later
When a dedicated domain is purchased:
1. connect the new domain to the same deployment;
2. keep identical route paths where possible;
3. set canonical URLs to the new domain;
4. create one-to-one 301 redirects from the old subdomain;
5. submit the new sitemap and Search Console property;
6. keep redirects active long enough to preserve traffic and indexing.

## Destination publication rule
Public only when:
- `Mostrar_Web = Sí`
- research state is `Verificado`, `Aprobado` or `Publicado`

## Offer publication rule
Public only when all are true:
- `Mostrar_Web = Sí`
- `Publicable = Sí`
- `Ultima_Confirmacion_Precio` has a date
- `Fecha_Expiracion_Web` is empty or has not passed

`Destacada_Home = Sí` controls whether an already-public item appears on the home page.

## Important
Provider links such as PriceAgencies / Travel Promo Maker are stored internally in the Master Sheet, but the public JSON endpoint does not expose them. The public CTA goes to Trhoncal Travel / CRM / WhatsApp.
