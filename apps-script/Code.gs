const CONFIG = {
  spreadsheetId: '1jVIIMyQuNseDidYkErYDd58Ha3yxJA9oFXleFPjmUJw',
  sheets: {
    destinations: '01_Destinos',
    fichas: '02_Fichas_Destino',
    sources: '05_Fuentes',
    offers: '07_Ofertas_Vigentes'
  }
};

function doGet(e) {
  try {
    const payload = buildPublicPayload_();
    const type = String((e && e.parameter && e.parameter.type) || 'all').toLowerCase();

    let output = payload;
    if (type === 'destinations') output = { generatedAt: payload.generatedAt, destinations: payload.destinations };
    if (type === 'sources') output = { generatedAt: payload.generatedAt, sources: payload.sources };
    if (type === 'offers') output = { generatedAt: payload.generatedAt, offers: payload.offers };

    return ContentService
      .createTextOutput(JSON.stringify(output))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: true, message: String(error && error.message ? error.message : error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function buildPublicPayload_() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('public-payload-v3');
  if (cached) return JSON.parse(cached);

  const ss = SpreadsheetApp.openById(CONFIG.spreadsheetId);
  const destinationRows = sheetObjects_(ss, CONFIG.sheets.destinations);
  const fichaRows = sheetObjects_(ss, CONFIG.sheets.fichas);
  const sourceRows = sheetObjects_(ss, CONFIG.sheets.sources);
  const offerRows = sheetObjects_(ss, CONFIG.sheets.offers);

  const fichaByDestination = {};
  fichaRows.forEach(row => {
    const id = text_(row.Destino_ID);
    if (id) fichaByDestination[id] = row;
  });

  const visibleDestinations = destinationRows
    .filter(row => yes_(row.Mostrar_Web))
    .map(row => publicDestination_(row, fichaByDestination[text_(row.Destino_ID)] || {}))
    .sort((a, b) => (a.ordenHome || 9999) - (b.ordenHome || 9999));

  const sourceIds = {};
  visibleDestinations.forEach(destination => {
    (destination.sourceIds || []).forEach(id => sourceIds[id] = true);
  });

  const visibleSources = sourceRows
    .filter(row => sourceIds[text_(row.Fuente_ID)])
    .map(publicSource_);

  const visibleOffers = offerRows
    .filter(isOfferPublishable_)
    .map(publicOffer_)
    .sort((a, b) => (a.ordenWeb || 9999) - (b.ordenWeb || 9999));

  const payload = {
    generatedAt: new Date().toISOString(),
    destinations: visibleDestinations,
    sources: visibleSources,
    offers: visibleOffers
  };

  cache.put('public-payload-v3', JSON.stringify(payload), 60);
  return payload;
}

function sheetObjects_(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('No existe la hoja: ' + name);
  const values = sheet.getDataRange().getDisplayValues();
  if (!values.length) return [];
  const headers = values.shift().map(h => String(h).trim());
  return values
    .filter(row => row.some(cell => String(cell).trim() !== ''))
    .map(row => headers.reduce((obj, header, index) => {
      if (header) obj[header] = row[index];
      return obj;
    }, {}));
}

function publicDestination_(row, ficha) {
  const sourceIds = split_(ficha.Fuente_IDs || row.Fuente_principal_ID);
  const imageAllowed = yes_(row.Permiso_uso_web) && !!text_(row.Imagen_principal_URL);
  return {
    id: text_(row.Destino_ID),
    slug: slug_(row.Slug_Web || row.Nombre),
    name: text_(row.Nombre),
    state: text_(row['Estado/Región']),
    country: text_(row.País),
    macroregion: text_(row.Macroregión),
    puebloMagico: yes_(row.Pueblo_Mágico),
    type: text_(row.Tipo_principal),
    segments: split_(row.Segmentos),
    status: status_(row.Estado_investigación),
    featuredHome: yes_(row.Destacado_Home),
    ordenHome: number_(row.Orden_Home),
    summary: text_(ficha.Resumen_corto),
    history: text_(ficha.Historia_y_contexto),
    whyGo: text_(ficha.Por_qué_ir),
    attractions: split_(ficha.Atractivos_clave),
    experiences: split_(ficha.Experiencias),
    gastronomy: text_(ficha.Gastronomía),
    travelerProfile: text_(ficha.Perfil_viajero),
    recommendedStay: text_(ficha.Duración_sugerida),
    climateSeasons: text_(ficha.Clima_y_temporadas),
    connectivity: text_(ficha.Conectividad),
    combinations: split_(ficha.Combinaciones),
    sustainabilityHeritage: text_(ficha.Sostenibilidad_y_patrimonio),
    recognitions: split_(ficha.Reconocimientos_verificados),
    lastVerified: dateText_(ficha.Última_verificación || row.Última_verificación),
    sourceIds,
    mainImage: imageAllowed ? text_(row.Imagen_principal_URL) : '',
    imageAlt: imageAllowed ? (text_(row.Alt_imagen) || text_(row.Nombre)) : '',
    imageCredit: imageAllowed ? text_(row.Credito_imagen) : '',
    imageSource: imageAllowed ? text_(row.Fuente_imagen) : '',
    imageLicense: imageAllowed ? text_(row.Tipo_licencia) : '',
    imageRightsVerifiedAt: imageAllowed ? dateText_(row.Fecha_verificacion_derechos) : '',
    gallery: imageAllowed ? split_(row.Galeria_URLs) : []
  };
}

function publicSource_(row) {
  return {
    id: text_(row.Fuente_ID),
    organization: text_(row['Organismo/Fuente']),
    type: text_(row.Tipo),
    level: text_(row.Nivel),
    title: text_(row['Título/uso']),
    url: text_(row.URL),
    publicationDate: dateText_(row.Fecha_publicación),
    verifiedAt: dateText_(row.Fecha_verificación),
    status: text_(row.Estado)
  };
}

function isOfferPublishable_(row) {
  if (!yes_(row.Mostrar_Web) || !yes_(row.Publicable)) return false;
  if (text_(row.Estado).toLowerCase() !== 'vigente') return false;
  if (!text_(row.Ultima_Confirmacion_Precio)) return false;

  const expiry = parseDate_(row.Fecha_Expiracion_Web);
  if (expiry && expiry.getTime() < startToday_().getTime()) return false;
  return true;
}

function publicOffer_(row) {
  const directAuthorized = yes_(row.Enlace_Publico_Autorizado);
  const leadVerified = !!text_(row.Destino_Lead_Verificado);
  const publicPromoUrl = directAuthorized ? httpUrl_(row.URL_Promo_Publica || row.URL_Promo_Compartir) : '';
  const sharePromoUrl = directAuthorized ? httpUrl_(row.URL_Promo_Compartir) : '';
  const leadFormUrl = directAuthorized && leadVerified ? httpUrl_(row.URL_Formulario_Lead) : '';
  const promoImage = directAuthorized ? httpUrl_(row.Imagen_Promo_URL) : '';

  return {
    id: text_(row.Oferta_ID),
    providerId: text_(row.Proveedor_ID),
    destinationId: text_(row.Destino_ID),
    title: text_(row.Título),
    hotel: text_(row.Hotel),
    days: number_(row.Días),
    nights: number_(row.Noches),
    plan: text_(row.Plan),
    price: text_(row.Precio_MXN),
    currency: 'MXN',
    priceUnit: text_(row.Unidad_precio),
    occupancy: text_(row.Ocupación),
    featuredHome: yes_(row.Destacada_Home),
    ordenWeb: number_(row.Orden_Web),
    verifiedAt: dateText_(row.Ultima_Confirmacion_Precio || row.Última_verificación),
    expiresAt: dateText_(row.Fecha_Expiracion_Web),
    includes: split_(row.Incluye),
    excludes: split_(row.No_Incluye),
    note: text_(row.Notas_Publicacion),
    publicPromoUrl,
    sharePromoUrl,
    leadFormUrl,
    leadDestinationVerified: directAuthorized ? text_(row.Destino_Lead_Verificado) : '',
    image: promoImage,
    directLinkAuthorized: directAuthorized
  };
}

function yes_(value) {
  const v = text_(value).toLowerCase();
  return v === 'sí' || v === 'si' || v === 'true' || v === '1';
}

function split_(value) {
  return text_(value)
    .split(/;|\n/)
    .map(v => v.trim())
    .filter(Boolean);
}

function text_(value) {
  return value == null ? '' : String(value).trim();
}

function number_(value) {
  const n = Number(String(value || '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function status_(value) {
  const v = text_(value).toLowerCase();
  if (v === 'verificado') return 'verified';
  if (v === 'aprobado') return 'approved';
  if (v === 'publicado') return 'published';
  return v || 'draft';
}

function slug_(value) {
  return text_(value)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function httpUrl_(value) {
  const v = text_(value);
  if (!/^https?:\/\//i.test(v)) return '';
  return v;
}

function dateText_(value) {
  const v = text_(value);
  if (!v) return '';
  const d = parseDate_(v);
  if (!d) return v;
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function parseDate_(value) {
  if (value instanceof Date && !isNaN(value)) return value;
  const v = text_(value);
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  if (iso.test(v)) {
    const parts = v.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  const d = new Date(v);
  return isNaN(d) ? null : d;
}

function startToday_() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function clearPublicCache_() {
  const cache = CacheService.getScriptCache();
  cache.remove('public-payload-v1');
  cache.remove('public-payload-v2');
  cache.remove('public-payload-v3');
}