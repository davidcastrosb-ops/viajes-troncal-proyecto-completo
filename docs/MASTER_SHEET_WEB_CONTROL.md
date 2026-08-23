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

There is **no fixed pilot destination**. The site must render whichever destinations David activates in the Master Sheet.

## Offer publication rule
Public only when all are true:
- `Mostrar_Web = Sí`
- `Publicable = Sí`
- `Ultima_Confirmacion_Precio` has a valid recent date
- `Fecha_Expiracion_Web` is empty or has not passed
- status is not expired/suspended

`Destacada_Home = Sí` controls whether an already-public item appears on the home page.

## Provider assets
PriceAgencies / Travel Promo Maker may provide several dissemination assets:
- shareable promo link;
- downloadable PDF;
- WhatsApp sharing;
- email sharing.

The Master Sheet may store those capabilities/assets internally for an approved offer.

### Critical distinction
A screenshot, sample link, PDF or shared material shown by David to explain how a provider works is **not an offer** unless David explicitly decides to load/activate it.

Therefore:
- sample hotels/prices/destinations are not copied into the public offer table;
- sample material does not create a destination priority;
- a real offer starts only when it is intentionally added to the Master Sheet.

## Public JSON security
Provider/internal links, supplier notes and sensitive operational fields are not exposed by the public JSON endpoint. The public CTA goes to Trhoncal Travel / CRM / WhatsApp/Jotform.
