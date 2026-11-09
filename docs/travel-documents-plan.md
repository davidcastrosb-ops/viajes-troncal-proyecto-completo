# Trhoncal Travel — Generador de expedientes de viaje (plan v1)

## Objetivo
Integrar a la web existente un módulo privado para crear PDF homogéneos de cotizaciones y confirmaciones. Evitar una segunda plataforma operativa y proteger la página pública.

## Restricciones
- Trabajar exclusivamente en la rama `feature/travel-documents` hasta revisión y autorización de despliegue.
- No publicar, reemplazar ni modificar la rama `main`, la web pública ni datos reales de pasajeros durante el prototipo.
- Reutilizar las dependencias existentes `pdf-lib` y `qrcode` cuando convenga.
- No almacenar PII, itinerarios personales, comprobantes ni credenciales en archivos públicos del repositorio.
- Separar información del pasajero, identidad visual y motor PDF. Preferir plantillas programáticas frente a imágenes generadas con texto incrustado.
- Requerir acceso autenticado, validación de entradas y controles de acceso a documentos privados antes de producción.

## Experiencia administrativa propuesta
Ruta tentativa `/admin/documentos` (sujeta a auditoría de rutas existentes): elegir expediente, subir PDF o introducir datos, revisar inconsistencias, seleccionar tema, previsualizar y descargar paquete PDF.

## Módulos
- Hospedaje: titular, localizador principal aprobado, hotel, categoría de habitación, ocupación, plan, fechas, dirección, contacto, pago verificado.
- Transporte terrestre: empresa, localizador, pasajeros, origen/destino, terminal concreta, fechas/horas, asientos y total verificado.
- Vuelos y actividades: opcionales en fase posterior.
- Mapa: QR que codifique `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lon>` para abrir navegación desde ubicación del usuario; enlace accesible en PDF. Confirmar coordenadas contra documentación antes de emitir.
- Documentos: PDF con metadatos coherentes, nombre de archivo por reserva, espacio para condiciones relevantes.

## Temas visuales
Playa, ciudad, pueblos mágicos, montaña/nieve, naturaleza/aventura, cultural. Deben ser imágenes licenciadas y pertinentes al destino; fotos ilustrativas deben distinguirse de fotografías de habitación real confirmada. Tipografía, logotipo Trhoncal Travel y jerarquía visual compartidos.

## Control de calidad
- Validar localizador, nombre, ocupación, fechas, horas, servicios incluidos, asiento y monto antes de generar.
- No mostrar «PAGADO» sin comprobante o confirmación del operador.
- No inventar número de confirmación secundaria ni condiciones de cancelación.
- Distinguir cotización (precio sujeto a condiciones) de reservación confirmada.
- Guardar historia de cambios del expediente de manera privada.
- Previsualizar y aprobar antes de enviar por WhatsApp.

## Comunicación y AIDA
Cotizaciones: Atención mediante portada temática; Interés con itinerario y beneficios verificados; Deseo con fotografías pertinentes; Acción mediante contacto y enlace de pago autorizado. Confirmaciones: claridad, seguridad de información y acciones útiles para el viaje (mapa, check-in, asistencia), evitando presión comercial.

## Etapas de desarrollo
1. Auditar rutas, generación PDF actual y seguridad de la web sin modificar su comportamiento.
2. Construir el modelo de datos y dos plantillas iniciales (hospedaje y autobús) con expedientes de prueba ficticios.
3. Añadir editor y vista previa privada, QR y descarga de PDF.
4. Añadir temas y biblioteca aprobada de imágenes.
5. Validar con casos de prueba, revisar accesibilidad y seguridad.
6. Preparar PR y vista previa aislada; despliegue de producción solo con autorización explícita.

## Indicadores de aceptación
- Mismo expediente produce PDF determinista y consistente, sin introducir datos de otra reserva.
- No hay enlaces privados o datos personales expuestos públicamente.
- QR lleva a la coordenada de destino y Google Maps solicita origen/ubicación al abrir.
- PDF se lee en celular, se imprime correctamente y contiene los datos obligatorios.
- La web pública permanece operativa sin cambios durante las pruebas.
