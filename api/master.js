export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const endpoint = process.env.TRHONCAL_MASTER_ENDPOINT ||
    'https://script.google.com/macros/s/AKfycbxq6OxUnMWH004OKyspo7eAbI0GvJvwwDgSnfffSzn9amtKzOWqaDmtWUnrk52rz7U8/exec';

  // Bypass cache so editorial visibility changes can be observed quickly.
  const separator = endpoint.includes('?') ? '&' : '?';
  const upstreamUrl = `${endpoint}${separator}_ts=${Date.now()}`;

  res.setHeader('X-Content-Type-Options', 'nosniff');

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

    const raw = await response.text();

    if (!response.ok) {
      console.error('Master upstream unavailable', { status: response.status });
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.status(502).json({ error: 'Master endpoint unavailable' });
    }

    let payload;
    try {
      payload = JSON.parse(raw);
    } catch (error) {
      console.error('Master upstream returned invalid JSON');
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.status(502).json({ error: 'Master endpoint returned invalid data' });
    }

    if (!payload || typeof payload !== 'object') {
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.status(502).json({ error: 'Invalid Master payload' });
    }

    res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
    return res.status(200).json(payload);
  } catch (error) {
    console.error('Could not load Trhoncal Travel Master Sheet', error);
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(500).json({ error: 'Could not load Trhoncal Travel Master Sheet' });
  }
}
