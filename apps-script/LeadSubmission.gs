/* Trhoncal Travel — recepción de solicitudes web.
 * Este archivo complementa Code.gs y usa el mismo CONFIG.spreadsheetId.
 */

function doPost(e) {
  try {
    const body = parseLeadBody_(e);
    if (String(body.action || '') !== 'submitLead') {
      return jsonLead_({ ok: false, error: 'Acción no válida.' });
    }

    // Honeypot: responder como éxito sin guardar bots obvios.
    if (cleanLead_(body.website, 120)) {
      return jsonLead_({ ok: true, leadId: 'IGNORED' });
    }

    const lead = normalizeLead_(body);
    const validationError = validateLead_(lead);
    if (validationError) {
      return jsonLead_({ ok: false, error: validationError });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(8000);
    let leadId;
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
        ''
      ]);
    } finally {
      lock.releaseLock();
    }

    notifyLead_(lead, leadId);
    return jsonLead_({ ok: true, leadId: leadId });
  } catch (error) {
    console.error('submitLead', error);
    return jsonLead_({
      ok: false,
      error: 'No pudimos registrar la solicitud en este momento.'
    });
  }
}

function parseLeadBody_(e) {
  const raw = e && e.postData && e.postData.contents ? e.postData.contents : '';
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
    hospedaje: cleanLead_(body.hospedaje, 40),
    origen: cleanLead_(body.origen, 50),
    urlOrigen: cleanLead_(body.urlOrigen, 500),
    slugDestino: cleanLead_(body.slugDestino, 160),
    utmSource: cleanLead_(body.utmSource, 120),
    utmMedium: cleanLead_(body.utmMedium, 120),
    utmCampaign: cleanLead_(body.utmCampaign, 160),
    consentimiento: body.consentimiento === true || String(body.consentimiento).toLowerCase() === 'true'
  };
}

function validateLead_(lead) {
  if (!lead.nombre) return 'Escribe tu nombre.';
  if (!lead.whatsapp) return 'Escribe tu WhatsApp.';
  const digits = lead.whatsapp.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return 'Revisa el número de WhatsApp.';
  if (!lead.destino) return 'Indica el destino o escribe “Ayúdame a elegir”.';
  if (!lead.ciudadSalida) return 'Indica tu ciudad de salida.';
  if (!lead.fechaSalida) return 'Indica una fecha aproximada de salida.';
  const people = Number(lead.personas);
  if (!Number.isFinite(people) || people < 1 || people > 99) return 'Revisa el número de viajeros.';
  if (!['Todo incluido', 'Sin todo incluido', 'Recomiéndame'].includes(lead.hospedaje)) {
    return 'Elige una preferencia de hospedaje.';
  }
  if (!lead.consentimiento) return 'Necesitamos tu autorización para contactarte.';
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
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
  const suffix = Utilities.getUuid().replace(/-/g, '').slice(0, 6).toUpperCase();
  return 'TT-' + stamp + '-' + suffix;
}

function notifyLead_(lead, leadId) {
  try {
    const subject = 'Nueva solicitud web | ' + lead.destino + ' | ' + leadId;
    const body = [
      'Nueva solicitud recibida en Trhoncal Travel',
      '',
      'Folio: ' + leadId,
      'Nombre: ' + lead.nombre + (lead.apellido ? ' ' + lead.apellido : ''),
      'WhatsApp: ' + lead.whatsapp,
      'Destino: ' + lead.destino,
      'Ciudad de salida: ' + lead.ciudadSalida,
      'Salida: ' + lead.fechaSalida,
      'Regreso: ' + (lead.fechaRegreso || 'No definida'),
      'Viajeros: ' + lead.personas,
      'Hospedaje: ' + lead.hospedaje,
      'Origen: ' + (lead.origen || 'web'),
      'URL: ' + (lead.urlOrigen || ''),
      '',
      'La solicitud quedó registrada en 13_Solicitudes_Web.'
    ].join('\n');
    MailApp.sendEmail('viajestroncal@gmail.com', subject, body);
  } catch (error) {
    console.warn('No se pudo enviar aviso por correo', error);
  }
}

function jsonLead_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
