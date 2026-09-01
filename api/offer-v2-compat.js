import offerLegacy from './offer.js';

const HOTEL_OFFERS = {
  'OF-PA-PVR-REV26-001': 'friendly-fun-vallarta',
  'OF-PA-PVR-SEP26-002': 'barcelo-puerto-vallarta',
  'OF-PA-NAY-REV26-003': 'grand-decameron-bucerias'
};

export default async function handler(req, res) {
  const id = String(req.query?.id || '').trim();
  const slug = HOTEL_OFFERS[id];

  if (slug) {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.redirect(302, `/hotel-v2/${encodeURIComponent(slug)}?oferta=${encodeURIComponent(id)}`);
  }

  return offerLegacy(req, res);
}
