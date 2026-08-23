export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const endpoint = process.env.TRHONCAL_MASTER_ENDPOINT ||
    'https://script.google.com/macros/s/AKfycbxq6OxUnMWH004OKyspo7eAbI0GvJvwwDgSnfffSzn9amtKzOWqaDmtWUnrk52rz7U8/exec';

  // During validation we deliberately bypass every cache layer so changes
  // in Mostrar_Web can be observed immediately from the Master Sheet.
  const separator = endpoint.includes('?') ? '&' : '?';
  const upstreamUrl = `${endpoint}${separator}_ts=${Date.now()}`;

  try {
    const response = await fetch(upstreamUrl, {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store',
      headers: {
        'User-Agent': 'TrhoncalTravel/1.0',
        'Cache-Control': 'no-cache'
      }
    });

    const contentType = response.headers.get('content-type') || '';
    const raw = await response.text();

    if (!response.ok) {
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.status(502).json({
        error: 'Master endpoint unavailable',
        upstreamStatus: response.status,
        upstreamContentType: contentType
      });
    }

    let payload;
    try {
      payload = JSON.parse(raw);
    } catch (error) {
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.status(502).json({
        error: 'Master endpoint did not return JSON',
        upstreamStatus: response.status,
        upstreamContentType: contentType,
        upstreamPreview: raw.slice(0, 180)
      });
    }

    if (!payload || typeof payload !== 'object') {
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.status(502).json({ error: 'Invalid Master payload' });
    }

    res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
    return res.status(200).json(payload);
  } catch (error) {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(500).json({
      error: 'Could not load Trhoncal Travel Master Sheet',
      detail: String(error)
    });
  }
}
