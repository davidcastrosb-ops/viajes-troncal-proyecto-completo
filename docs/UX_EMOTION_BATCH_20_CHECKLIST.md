# Checklist operativo — Batch 20

- [x] Autorización de David recibida.
- [x] Reglas de imágenes: sólo activos permitidos por Maestro.
- [x] Reglas de promociones: sólo ofertas reales, vigentes y verificadas.
- [x] Implementación visual categorías v2: imagen, overlay, chips, CTA y copies emocionales.
- [x] Integración Promo Maker disponible desde hero-v4 mediante carga dinámica; con 0 ofertas permanece oculto.
- [x] Títulos comerciales: favicon global; home `Atrévete a viajar`; fichas mantienen título inspiracional por destino.
- [x] Hero: fotografías verificadas + promociones visuales cuando existan.
- [x] Desktop: 3 tarjetas, controles explícitos y contador.
- [x] Mobile: tarjeta ~84vw, siguiente visible, swipe y controles.
- [x] Accesibilidad: reduced-motion, focus visible, pausa por interacción.
- [x] Preview Vercel SUCCESS en rama `feat/ux-emotion-batch20`.
- [x] PR #9 creado y mergeable.
- [x] Merge a main: `3f530da80ff0c7ca2b5de77accc44af8b177be4c`.
- [x] Producción Vercel SUCCESS.
- [x] REV-047 registrado en Archivo Maestro.

## Resultado
Las seis categorías de intención ahora reutilizan fotografías ya autorizadas de destinos públicos, muestran copys más emocionales, chips de destinos y CTA claros. La experiencia conserva navegación explícita y funciona con swipe en móvil. El módulo visual de promociones queda preparado, pero permanece oculto mientras existan 0 ofertas reales.

## Única dependencia futura
Apps Script v5 ya está preparado en GitHub para exponer campos de Promo Maker. La publicación de una nueva versión del Web App será necesaria antes de encender la primera oferta real; no bloquea la web actual.
