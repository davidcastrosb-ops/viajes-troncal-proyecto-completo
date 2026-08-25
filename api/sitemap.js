const PUBLIC_HOST = 'viajes.trhoncalhomes.com.mx';

function xmlEscape(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default async function handler(req, res) {
  const host = String(req.headers.host || '').split(':')[0].toLowerCase();
  if (host !== PUBLIC_HOST) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    return res.status(404).send('Sitemap available on production host only.');
  }

  const base = `https://${PUBLIC_HOST}`;
  let destinations = [];
  try {
    const response = await fetch(`${base}/api/master`, {
      headers: { accept: 'application/json' },
      cache: 'no-store'
    });
    if (response.ok) {
      const payload = await response.json();
      destinations = Array.isArray(payload.destinations) ? payload.destinations : [];
    }
  } catch (error) {
    console.warn('No se pudo cargar /api/master para sitemap.', error);
  }

  const validStatus = new Set(['verified', 'verified-initial', 'approved', 'published']);
  const rows = destinations.filter(d => d && d.slug && validStatus.has(d.status));

  const staticUrls = [
    { loc: `${base}/`, changefreq: 'weekly', priority: '1.0' },
    { loc: `${base}/cuando-viajar/`, changefreq: 'weekly', priority: '0.9' }
  ];

  const urls = [
    ...staticUrls.map(item => `<url><loc>${xmlEscape(item.loc)}</loc><changefreq>${item.changefreq}</changefreq><priority>${item.priority}</priority></url>`),
    ...rows.map(d => {
      const loc = `${base}/mexico/${encodeURIComponent(d.slug)}`;
      const lastmod = d.lastVerified ? `<lastmod>${xmlEscape(d.lastVerified)}</lastmod>` : '';
      return `<url><loc>${xmlEscape(loc)}</loc>${lastmod}<changefreq>monthly</changefreq><priority>0.8</priority></url>`;
    })
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  res.status(200).send(xml);
}
