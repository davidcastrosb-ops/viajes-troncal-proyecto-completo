
VERSIÓN V3 - FICHAS DE PROMOS

Esta versión ya hace esto:
- cada link del archivo promos.json se convierte en una ficha/tarjeta
- no usa la promo como bloque ancho abajo
- usa la promo de ejemplo:
  https://mx.travelpromomaker.com/promomaker/contact/45981/copy

Para agregar más promos:
abre assets/data/promos.json con Bloc de notas
y agrega más links así:

[
  "https://mx.travelpromomaker.com/promomaker/contact/45981/copy",
  "https://mx.travelpromomaker.com/promomaker/contact/OTRO_LINK/copy"
]

Subir:
1. borra lo viejo del repo
2. copia todo este ZIP
3. commit
4. push
5. Vercel redeploya
