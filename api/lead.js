export default async function handler(req, res) {
  // Permite probar que el endpoint existe en Vercel
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, message: 'Endpoint Viajes Troncal activo' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método no permitido' });
  }

  try {
    const data = req.body || {};
    const makeWebhookUrl = data.makeWebhookUrl;

    if (!makeWebhookUrl || !String(makeWebhookUrl).startsWith('https://hook.')) {
      return res.status(400).json({ ok: false, error: 'Falta makeWebhookUrl válido' });
    }

    const pretty = [
      `Nombre completo:${data.nombre || ''}`,
      `WhatsApp:${data.whatsapp || ''}`,
      `Correo electrónico:${data.email || 'No proporcionado'}`,
      `Destino deseado:${data.destino || ''}`,
      `Ciudad de salida:${data.salida || ''}`,
      `Fecha tentativa de salida:${data.fechaSalida || 'Sin fecha'}`,
      `Fecha tentativa de regreso:${data.fechaRegreso || 'Sin fecha'}`,
      `Número aproximado de personas:${data.personas || ''}`,
      `Tipo de viaje:${data.tipoViaje || 'No especificado'}`,
      `¿Qué necesitas incluir?:${Array.isArray(data.servicios) ? data.servicios.join(' ') : (data.servicios || 'No especificado')}`,
      `Presupuesto aproximado por persona:${data.presupuesto || 'No especificado'}`,
      `Comentarios adicionales:${data.comentarios || 'Sin comentarios'}`
    ].join(', ');

    // Mandamos a Make en formato parecido al webhook original de Jotform
    const payload = new URLSearchParams();
    payload.set('action', '');
    payload.set('webhookURL', makeWebhookUrl);
    payload.set('username', 'landing-viajes-troncal');
    payload.set('formID', 'landing-viajes-troncal');
    payload.set('type', 'WEB');
    payload.set('formTitle', 'Cotiza tu viaje con Viajes Troncal');
    payload.set('submissionID', String(Date.now()));
    payload.set('event', 'submission');
    payload.set('pretty', pretty);
    payload.set('rawRequest', JSON.stringify(data));

    const makeResponse = await fetch(makeWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: payload.toString()
    });

    const text = await makeResponse.text().catch(() => '');

    if (!makeResponse.ok) {
      return res.status(502).json({
        ok: false,
        error: 'Make respondió con error',
        status: makeResponse.status,
        response: text
      });
    }

    return res.status(200).json({ ok: true, makeStatus: makeResponse.status });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'Error inesperado' });
  }
}
