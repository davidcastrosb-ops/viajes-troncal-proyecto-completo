# Trhoncal Travel — subdominio inicial

Objetivo de fase 1: publicar la agencia en `viajes.trhoncalhomes.com.mx` sin comprar todavía un dominio nuevo.

## Regla de seguridad

No modificar los registros raíz de `trhoncalhomes.com.mx`, `www`, correo (MX), SPF/DKIM/DMARC, ni otros subdominios existentes. Sólo crear/configurar el host `viajes`.

## Secuencia cuando el preview sea aprobado

1. En Vercel abrir el proyecto `viajes-troncal-proyecto-completo` → **Settings → Domains**.
2. Agregar `viajes.trhoncalhomes.com.mx` y asignarlo al entorno/branch aprobado.
3. Copiar **exactamente** el destino CNAME que Vercel muestre para ese dominio. No adivinar ni reutilizar un valor de otro proyecto.
4. En el proveedor DNS de `trhoncalhomes.com.mx`, crear un registro **CNAME** con host `viajes` y destino igual al mostrado por Vercel.
5. Regresar a Vercel y esperar a que dominio y certificado SSL aparezcan como válidos.
6. Probar Home, `/api/master`, Jotform, WhatsApp, fichas de destino y ofertas antes de considerarlo público.

## Migración futura al dominio propio

Cuando Trhoncal Travel compre su dominio definitivo:

- conservar las rutas relativas del sitio;
- mapear cada URL vieja a su equivalente nueva con redirección 301 uno a uno;
- actualizar canonical, sitemap, Search Console y referencias de marca;
- mantener temporalmente el subdominio para recibir tráfico antiguo y redirigirlo.

## Estado actual

- Dominio final: pendiente hasta que la agencia genere ingresos.
- Subdominio objetivo: `viajes.trhoncalhomes.com.mx`.
- No ejecutar cambios DNS hasta que David apruebe visualmente la versión de staging.
