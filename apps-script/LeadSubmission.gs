/* Trhoncal Travel — recepción de solicitudes web.
 * v11: correo con micrositio Trhoncal real + promo proveedor + origen de solicitud.
 * Este archivo complementa Code.gs y usa el mismo CONFIG.spreadsheetId.
 */

function doPost(e) {
  try {
    const body = parseLeadBody_(e);

    if (String(body.action || '') !== 'submitLead') {
      return jsonLead_({ ok: false, error: 'Acción no válida.' });
    }

    if (cleanLead_(body.website, 120)) {
      return jsonLead_({ ok: true, leadId: 'IGNORED' });
    }

    const lead = normalizeLead_(body);

    // Reconstrucción robusta desde Oferta_ID.
    const offerContext = resolveOfferContextForLead_(lead.ofertaId);
    lead.hotel = cleanLead_(body.hotel, 140) || offerContext.hotel || '';
    lead.promoUrl = safeProviderPromoLead_(lead.promoUrl) || offerContext.promoUrl || '';

    const validationError = validateLead_(lead);
    if (validationError) {
      return jsonLead_({ ok: false, error: validationError });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(8000);

    let leadId;
    let rowNumber = 0;

    try {
      const ss = SpreadsheetApp.openById(CONFIG.spreadsheetId);
      const sheet = ss.getSheetByName('13_Solicitudes_Web');
      if (!sheet) throw new Error('No existe la hoja 13_Solicitudes_Web.');

      leadId = makeLeadId_();
      const now = new Date();

      sheet.appendRow([
        Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'),
        leadId,
        lead.nombre,
        lead.apellido,
        lead.whatsapp,
        lead.destino,
        lead.ciudadSalida,
        lead.fechaSalida,
        lead.fechaRegreso,
        lead.personas,
        lead.hospedaje,
        lead.origen,
        lead.urlOrigen,
        lead.slugDestino,
        lead.utmSource,
        lead.utmMedium,
        lead.utmCampaign,
        lead.consentimiento ? 'Sí' : 'No',
        'Nuevo',
        '',
        '',
        '',
        '',
        '',
        '',
        lead.ocasionId,
        lead.ofertaId,
        lead.promoUrl,
        lead.ctaOrigen,
        lead.adultos,
        lead.menores,
        lead.edadesMenores
      ]);

      rowNumber = sheet.getLastRow();

    } finally {
      lock.releaseLock();
    }

    const notification = notifyLead_(lead, leadId);
    recordLeadNotification_(rowNumber, notification);

    return jsonLead_({
      ok: true,
      leadId: leadId,
      emailSent: notification.ok === true
    });

  } catch (error) {
    console.error('submitLead', error);

    return jsonLead_({
      ok: false,
      error: 'No pudimos registrar la solicitud en este momento.'
    });
  }
}

function parseLeadBody_(e) {
  const raw =
    e && e.postData && e.postData.contents
      ? e.postData.contents
      : '';

  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch (_) {
    return {};
  }
}

function normalizeLead_(body) {
  return {
    nombre: cleanLead_(body.nombre, 80),
    apellido: cleanLead_(body.apellido, 80),
    whatsapp: cleanLead_(body.whatsapp, 30),
    destino: cleanLead_(body.destino, 140),
    ciudadSalida: cleanLead_(body.ciudadSalida, 120),
    fechaSalida: cleanLead_(body.fechaSalida, 20),
    fechaRegreso: cleanLead_(body.fechaRegreso, 20),
    personas: cleanLead_(body.personas, 8),
    adultos: cleanLead_(body.adultos, 4),
    menores: cleanLead_(body.menores, 4),
    edadesMenores: cleanLead_(body.edadesMenores, 120),
    hospedaje: cleanLead_(body.hospedaje, 40),
    origen: cleanLead_(body.origen, 50),
    urlOrigen: cleanLead_(body.urlOrigen, 500),
    slugDestino: cleanLead_(body.slugDestino, 160),
    utmSource: cleanLead_(body.utmSource, 120),
    utmMedium: cleanLead_(body.utmMedium, 120),
    utmCampaign: cleanLead_(body.utmCampaign, 160),
    ocasionId: cleanLead_(body.ocasionId, 120),
    ofertaId: cleanLead_(body.ofertaId, 120),
    promoUrl: cleanLead_(body.promoUrl, 500),
    ctaOrigen: cleanLead_(body.ctaOrigen, 120),
    hotel: cleanLead_(body.hotel, 140),
    consentimiento:
      body.consentimiento === true ||
      String(body.consentimiento).toLowerCase() === 'true'
  };
}

/* Obtiene Hotel y URL pública correcta directamente del Maestro.
 * Nunca usa URL_proveedor_interna ni formulario de contacto como promo.
 */
function resolveOfferContextForLead_(offerId) {
  const id = cleanLead_(offerId, 120);

  const result = {
    hotel: '',
    promoUrl: ''
  };

  if (!id) return result;

  try {
    const ss = SpreadsheetApp.openById(CONFIG.spreadsheetId);

    const offersSheetName =
      CONFIG && CONFIG.sheets && CONFIG.sheets.offers
        ? CONFIG.sheets.offers
        : '07_Ofertas_Vigentes';

    const sheet = ss.getSheetByName(offersSheetName);
    if (!sheet) return result;

    const values = sheet.getDataRange().getDisplayValues();
    if (values.length < 2) return result;

    const headers = values[0].map(function(value) {
      return String(value || '').trim();
    });

    const offerIndex = headers.indexOf('Oferta_ID');
    const hotelIndex = headers.indexOf('Hotel');
    const publicPromoIndex = headers.indexOf('URL_Promo_Publica');
    const sharePromoIndex = headers.indexOf('URL_Promo_Compartir');

    if (offerIndex < 0) return result;

    for (let i = 1; i < values.length; i++) {
      if (cleanLead_(values[i][offerIndex], 120) !== id) continue;

      if (hotelIndex >= 0) {
        result.hotel = cleanLead_(values[i][hotelIndex], 140);
      }

      const publicCandidate =
        publicPromoIndex >= 0
          ? safeProviderPromoLead_(values[i][publicPromoIndex])
          : '';

      const shareCandidate =
        sharePromoIndex >= 0
          ? safeProviderPromoLead_(values[i][sharePromoIndex])
          : '';

      result.promoUrl = publicCandidate || shareCandidate || '';
      break;
    }

  } catch (error) {
    console.warn('No se pudo resolver contexto por Oferta_ID', error);
  }

  return result;
}

/* Sólo acepta exactamente:
 * https://mx.travelpromomaker.com/sharepromotions/12345
 * Opcionalmente con / final.
 * No usa URL(), para máxima compatibilidad con Apps Script.
 */
function safeProviderPromoLead_(value) {
  const url = cleanLead_(value, 500);

  if (!url) return '';

  const canonicalMatch = url.match(
    /^https:\/\/mx\.travelpromomaker\.com\/promotion\/(\d+)\/?$/i
  );

  if (canonicalMatch) {
    return 'https://mx.travelpromomaker.com/promotion/' + canonicalMatch[1];
  }

  const legacyMatch = url.match(
    /^https:\/\/mx\.travelpromomaker\.com\/sharepromotions\/(\d+)\/?$/i
  );

  if (legacyMatch) {
    return 'https://mx.travelpromomaker.com/sharepromotions/' + legacyMatch[1];
  }

  return '';
}

function parseAgesLead_(value) {
  return cleanLead_(value, 120)
    .split(/[,;|\s]+/)
    .map(function(v) {
      return v.trim();
    })
    .filter(Boolean)
    .map(Number);
}

function validateLead_(lead) {
  if (!lead.nombre) {
    return 'Escribe tu nombre.';
  }

  if (!lead.whatsapp) {
    return 'Escribe tu WhatsApp.';
  }

  const digits = lead.whatsapp.replace(/\D/g, '');

  if (digits.length < 8 || digits.length > 15) {
    return 'Revisa el número de WhatsApp.';
  }

  if (!lead.destino) {
    return 'Indica el destino o escribe “Ayúdame a elegir”.';
  }

  if (!lead.ciudadSalida) {
    return 'Indica tu ciudad de salida.';
  }

  if (!lead.fechaSalida) {
    return 'Indica una fecha aproximada de salida.';
  }

  const people = Number(lead.personas);

  if (!Number.isFinite(people) || people < 1 || people > 99) {
    return 'Revisa el número de viajeros.';
  }

  const hasFamilyBreakdown =
    lead.adultos !== '' ||
    lead.menores !== '' ||
    lead.edadesMenores !== '';

  if (hasFamilyBreakdown) {
    const adults = Number(lead.adultos);
    const children = Number(lead.menores || 0);

    if (
      !Number.isInteger(adults) ||
      adults < 1 ||
      adults > 20
    ) {
      return 'Revisa el número de adultos.';
    }

    if (
      !Number.isInteger(children) ||
      children < 0 ||
      children > 20
    ) {
      return 'Revisa el número de menores.';
    }

    if (adults + children !== people) {
      return 'El total de viajeros no coincide con adultos y menores.';
    }

    const ages = parseAgesLead_(lead.edadesMenores);

    if (
      children > 0 &&
      ages.length !== children
    ) {
      return 'Indica la edad de cada menor.';
    }

    if (
      ages.some(function(age) {
        return (
          !Number.isInteger(age) ||
          age < 0 ||
          age > 17
        );
      })
    ) {
      return 'Revisa las edades de los menores.';
    }
  }

  if (
    ![
      'Todo incluido',
      'Sin todo incluido',
      'Recomiéndame'
    ].includes(lead.hospedaje)
  ) {
    return 'Elige una preferencia de hospedaje.';
  }

  if (!lead.consentimiento) {
    return 'Necesitamos tu autorización para contactarte.';
  }

  return '';
}

function cleanLead_(value, maxLength) {
  return String(value == null ? '' : value)
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength || 200);
}

function makeLeadId_() {
  const stamp = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyyMMdd-HHmmss'
  );

  const suffix = Utilities.getUuid()
    .replace(/-/g, '')
    .slice(0, 6)
    .toUpperCase();

  return 'TT-' + stamp + '-' + suffix;
}

function trhoncalPromoUrlForLead_(offerId) {
  const id = cleanLead_(offerId, 120);
  if (!id) return '';

  try {
    const ss = SpreadsheetApp.openById(CONFIG.spreadsheetId);
    const offersSheetName =
      CONFIG && CONFIG.sheets && CONFIG.sheets.offers
        ? CONFIG.sheets.offers
        : '07_Ofertas_Vigentes';
    const hotelsSheetName =
      CONFIG && CONFIG.sheets && CONFIG.sheets.hotels
        ? CONFIG.sheets.hotels
        : '21_Hoteles_Maestro';

    const offersSheet = ss.getSheetByName(offersSheetName);
    const hotelsSheet = ss.getSheetByName(hotelsSheetName);
    if (!offersSheet || !hotelsSheet) return '';

    const offerValues = offersSheet.getDataRange().getDisplayValues();
    if (offerValues.length < 2) return '';

    const offerHeaders = offerValues[0].map(function(value) {
      return String(value || '').trim();
    });
    const offerIdIndex = offerHeaders.indexOf('Oferta_ID');
    const hotelIdIndex = offerHeaders.indexOf('Hotel_ID');
    if (offerIdIndex < 0 || hotelIdIndex < 0) return '';

    let hotelId = '';
    for (let i = 1; i < offerValues.length; i++) {
      if (cleanLead_(offerValues[i][offerIdIndex], 120) !== id) continue;
      hotelId = cleanLead_(offerValues[i][hotelIdIndex], 120);
      break;
    }
    if (!hotelId) return '';

    const hotelValues = hotelsSheet.getDataRange().getDisplayValues();
    if (hotelValues.length < 2) return '';

    const hotelHeaders = hotelValues[0].map(function(value) {
      return String(value || '').trim();
    });
    const hotelKeyIndex = hotelHeaders.indexOf('Hotel_ID');
    const slugIndex = hotelHeaders.indexOf('Slug_Hotel');
    if (hotelKeyIndex < 0 || slugIndex < 0) return '';

    let slug = '';
    for (let i = 1; i < hotelValues.length; i++) {
      if (cleanLead_(hotelValues[i][hotelKeyIndex], 120) !== hotelId) continue;
      slug = cleanLead_(hotelValues[i][slugIndex], 160);
      break;
    }
    if (!slug) return '';

    return 'https://viajes.trhoncalhomes.com.mx/hotel-v2/' +
      encodeURIComponent(slug) +
      '?oferta=' + encodeURIComponent(id);
  } catch (error) {
    console.warn('No se pudo construir URL Trhoncal para la oferta', error);
    return '';
  }
}

function notifyLead_(lead, leadId) {
  try {
    const hotelLabel = cleanLead_(lead.hotel, 140);
    const promoPublic = safeProviderPromoLead_(lead.promoUrl);
    const trhoncalPromo = trhoncalPromoUrlForLead_(lead.ofertaId);

    const subjectParts = ['Nueva solicitud web'];

    if (hotelLabel) {
      subjectParts.push(hotelLabel);
    }

    subjectParts.push(lead.destino);
    subjectParts.push(leadId);

    const subject = subjectParts.join(' | ');

    const body = [
      'Nueva solicitud recibida en Trhoncal Travel',
      '',
      'Folio: ' + leadId,
      'Nombre: ' +
        lead.nombre +
        (lead.apellido ? ' ' + lead.apellido : ''),
      'WhatsApp: ' + lead.whatsapp,
      'Destino: ' + lead.destino,
      'Hotel: ' + (hotelLabel || 'Por definir'),
      'Ciudad de salida: ' + lead.ciudadSalida,
      'Salida: ' + lead.fechaSalida,
      'Regreso: ' +
        (lead.fechaRegreso || 'No definida'),
      'Viajeros: ' + lead.personas,
      'Adultos: ' +
        (lead.adultos || 'No desglosado'),
      'Menores: ' +
        (lead.menores || '0 / no desglosado'),
      'Edades de menores: ' +
        (lead.edadesMenores || 'No aplica'),
      'Hospedaje: ' + lead.hospedaje,
      'Origen: ' + (lead.origen || 'web'),
      'Ocasión: ' +
        (lead.ocasionId || 'No aplica'),
      'Oferta: ' +
        (lead.ofertaId || 'No aplica'),
      trhoncalPromo
        ? 'Ver promoción en Trhoncal Travel: ' + trhoncalPromo
        : 'Ver promoción en Trhoncal Travel: No disponible',
      promoPublic
        ? 'Referencia promoción proveedor: ' + promoPublic
        : 'Referencia promoción proveedor: No disponible / pendiente de validar',
      'CTA: ' + (lead.ctaOrigen || ''),
      'Origen de la solicitud: ' +
        (lead.urlOrigen || ''),
      '',
      'La solicitud quedó registrada en 13_Solicitudes_Web.'
    ].join('\n');

    const quotaBefore =
      MailApp.getRemainingDailyQuota();

    MailApp.sendEmail({
    to: 'viajestroncal@gmail.com',
    cc: 'davidcastrosb@gmail.com',
    subject: subject,
    body: body,
    name: 'Trhoncal Travel'
  });

    return {
      ok: true,
      quotaBefore: quotaBefore,
      quotaAfter:
        MailApp.getRemainingDailyQuota()
    };

  } catch (error) {
    const message = cleanLead_(
      error && error.message
        ? error.message
        : String(error || 'Error desconocido'),
      180
    );

    console.warn(
      'No se pudo enviar aviso por correo',
      message
    );

    return {
      ok: false,
      error: message
    };
  }
}

function recordLeadNotification_(
  rowNumber,
  notification
) {
  if (!rowNumber) return;

  try {
    const ss =
      SpreadsheetApp.openById(
        CONFIG.spreadsheetId
      );

    const sheet =
      ss.getSheetByName(
        '13_Solicitudes_Web'
      );

    if (!sheet) return;

    const note =
      notification && notification.ok
        ? 'Aviso correo: ENVIADO'
        : 'Aviso correo: FALLÓ | ' +
          cleanLead_(
            notification &&
            notification.error
              ? notification.error
              : 'Sin detalle',
            180
          );

    sheet
      .getRange(rowNumber, 20)
      .setValue(note);

  } catch (error) {
    console.warn(
      'No se pudo registrar estado del aviso',
      error
    );
  }
}

function jsonLead_(obj) {
  return ContentService
    .createTextOutput(
      JSON.stringify(obj)
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );
}

/* Función manual visible para revisar MailApp.
 * No crea leads ni modifica 13_Solicitudes_Web.
 */
function testLeadEmailAuthorization() {
  const to =
    'viajestroncal@gmail.com';

  const stamp =
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyy-MM-dd HH:mm:ss'
    );

  const quotaBefore =
    MailApp.getRemainingDailyQuota();

  const subject =
    'TEST Trhoncal Travel | correo Apps Script | ' +
    stamp;

  const body = [
    'Prueba técnica de correo de Trhoncal Travel.',
    '',
    'Si recibes este mensaje, MailApp está autorizado.',
    'Fecha/hora del script: ' + stamp,
    'Cuota restante antes del envío: ' + quotaBefore,
    '',
    'Esta prueba no crea un lead ni modifica 13_Solicitudes_Web.'
  ].join('\n');

  MailApp.sendEmail(
    to,
    subject,
    body
  );

  const result = {
    ok: true,
    quotaBefore: quotaBefore,
    quotaAfter:
      MailApp.getRemainingDailyQuota()
  };

  console.log(
    JSON.stringify(result)
  );

  return result;
}
