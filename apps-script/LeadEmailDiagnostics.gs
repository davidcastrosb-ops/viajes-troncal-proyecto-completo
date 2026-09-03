/* Trhoncal Travel — diagnóstico de correo para Apps Script.
 * Ejecutar manualmente testLeadEmailAuthorization_() una vez desde el editor.
 * Su objetivo es forzar/autoriz ar MailApp y confirmar que el proyecto puede enviar alertas.
 */

function testLeadEmailAuthorization_() {
  const to = 'viajestroncal@gmail.com';
  const now = new Date();
  const stamp = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  const quotaBefore = MailApp.getRemainingDailyQuota();
  const subject = 'TEST Trhoncal Travel | correo Apps Script | ' + stamp;
  const body = [
    'Prueba técnica de correo de Trhoncal Travel.',
    '',
    'Si recibes este mensaje, MailApp quedó autorizado para este proyecto de Apps Script.',
    'Fecha/hora del script: ' + stamp,
    'Cuota restante antes del envío: ' + quotaBefore,
    '',
    'Esta prueba no crea un lead ni modifica 13_Solicitudes_Web.'
  ].join('\n');

  MailApp.sendEmail(to, subject, body);

  const result = {
    ok: true,
    to: to,
    subject: subject,
    quotaBefore: quotaBefore,
    quotaAfter: MailApp.getRemainingDailyQuota(),
    timestamp: stamp
  };
  console.log(JSON.stringify(result));
  return result;
}
