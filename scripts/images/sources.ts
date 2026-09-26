/**
 * Catégories Wikimedia Commons explorées pour chaque dossier d'images.
 * Les catégories absentes sont simplement ignorées par le script de découverte.
 */
export const CATEGORIES: Record<string, string[]> = {
  'proxima-b': ['Proxima Centauri b', 'Artist\'s impressions of exoplanets'],
  star: ['Proxima Centauri', 'Red dwarfs', 'Stellar flares'],
  'alpha-centauri': ['Alpha Centauri', 'Alpha Centauri A', 'Alpha Centauri B'],
  space: ['Milky Way', 'Photographs of the Milky Way', 'Carina Nebula'],
  missions: ['Voyager 1', 'Voyager Golden Record', 'Breakthrough Starshot', 'Solar sails', 'Hubble Space Telescope in orbit', 'James Webb Space Telescope'],
  earth: ['Pale Blue Dot', 'The Blue Marble', 'Earthrise'],
  telescopes: ['La Silla Observatory', 'Paranal Observatory', 'Very Large Telescope', 'Extremely Large Telescope', 'ESPRESSO'],
}
