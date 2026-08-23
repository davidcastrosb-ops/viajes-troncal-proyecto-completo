export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const endpoint = process.env.TRHONCAL_MASTER_ENDPOINT ||
    'https://script.google.com/macros/s/AKfycbxxpHTcKw5JI96QC9gXmEBpCOMEv1A5jYhOqNdsZXt-chMpnt3AnWTXohCTaEPaBwHu/exec';

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'TrhoncalTravel/1.0'
      }
    });

    if (!response.ok) {
      return res.status(502).json({
        error: 'Master endpoint unavailable',
        status: response.status
      });
    }

    const payload = await response.json();
    if (!payload || typeof payload !== 'object') {
      return res.status(502).json({ error: 'Invalid Master payload' });
    }

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({
      error: 'Could not load Trhoncal Travel Master Sheet',
      detail: String(error)
    });
  }
}
