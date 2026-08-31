export const HOTEL_ASSET_GALLERIES = {
  'friendly-fun-vallarta': [
    { url: '/assets/images/hoteles/friendly-fun-vallarta/01.jpg', alt: 'Vista general de Friendly Fun Vallarta' },
    { url: '/assets/images/hoteles/friendly-fun-vallarta/02.jpg', alt: 'Alberca de Friendly Fun Vallarta' },
    { url: '/assets/images/hoteles/friendly-fun-vallarta/03.jpg', alt: 'Habitación de Friendly Fun Vallarta' },
    { url: '/assets/images/hoteles/friendly-fun-vallarta/04.jpg', alt: 'Área común de Friendly Fun Vallarta' }
  ],
  'barcelo-puerto-vallarta': [
    { url: '/assets/images/hoteles/barcelo-puerto-vallarta/01.jpg', alt: 'Vista general de Barceló Puerto Vallarta' },
    { url: '/assets/images/hoteles/barcelo-puerto-vallarta/02.jpg', alt: 'Exterior y playa de Barceló Puerto Vallarta' },
    { url: '/assets/images/hoteles/barcelo-puerto-vallarta/03.jpg', alt: 'Albercas de Barceló Puerto Vallarta' },
    { url: '/assets/images/hoteles/barcelo-puerto-vallarta/04.jpg', alt: 'Habitación de Barceló Puerto Vallarta' },
    { url: '/assets/images/hoteles/barcelo-puerto-vallarta/05.jpg', alt: 'Vista a la bahía desde Barceló Puerto Vallarta' },
    { url: '/assets/images/hoteles/barcelo-puerto-vallarta/06.jpg', alt: 'Exterior de Barceló Puerto Vallarta junto a la playa' }
  ],
  'grand-decameron-bucerias': [
    { url: '/assets/images/hoteles/grand-decameron-bucerias/01.jpg', alt: 'Vista del Grand Decameron Complex en Bucerías' },
    { url: '/assets/images/hoteles/grand-decameron-bucerias/02.jpg', alt: 'Alberca del Grand Decameron Complex' },
    { url: '/assets/images/hoteles/grand-decameron-bucerias/03.jpg', alt: 'Habitación del Grand Decameron Complex' },
    { url: '/assets/images/hoteles/grand-decameron-bucerias/04.jpg', alt: 'Entretenimiento del Grand Decameron Complex' },
    { url: '/assets/images/hoteles/grand-decameron-bucerias/05.jpg', alt: 'Exterior nocturno del Grand Decameron Complex' }
  ]
};

export function hotelAssetGallery(slug) {
  return Array.isArray(HOTEL_ASSET_GALLERIES[slug]) ? HOTEL_ASSET_GALLERIES[slug] : [];
}
