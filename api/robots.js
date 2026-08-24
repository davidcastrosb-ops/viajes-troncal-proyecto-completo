const PUBLIC_HOST = 'viajes.trhoncalhomes.com.mx';

export default function handler(req, res) {
  const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = String(req.headers.host || '').split(':')[0].toLowerCase();
  const isPublicHost = host === PUBLIC_HOST;

  const body = isPublicHost
    ? `User-agent: *\nAllow: /\n\nSitemap: https://${PUBLIC_HOST}/sitemap.xml\n`
    : 'User-agent: *\nDisallow: /\n';

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  if (!isPublicHost) res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.status(200).send(body);
}
