/**
 * Images retenues pour le site, choisies sur les planches contact de discover.ts.
 * `commons` est le titre exact du fichier sur Wikimedia Commons : licence, crédit et
 * dimensions sont relus par l'API au moment du build (aucune donnée recopiée à la main).
 * Les vues d'artiste sont signalées : aucune vraie photo de la surface de Proxima b n'existe.
 */
import type { ImageCategory } from '../../src/data/image-types'

export type Selected = {
  id: string
  commons: string
  category: ImageCategory
  /** Texte alternatif en français. */
  alt: string
  /** Légende en français (affichée dans la lightbox). */
  caption: string
  artistImpression?: boolean
  /** Cadrage CSS (object-position) pour les recadrages serrés. */
  focus?: string
}

export const SELECTION: Selected[] = [
  {
    id: 'proxima-b-surface',
    commons: "File:Artist's impression of the planet orbiting Proxima Centauri.jpg",
    category: 'proxima-b',
    alt: 'Paysage rocheux de Proxima b sous une étoile rouge, deux étoiles brillantes dans le ciel',
    caption: 'La surface de Proxima b imaginée par l’ESO : Proxima Centauri à l’horizon, Alpha Centauri A et B dans le ciel.',
    artistImpression: true,
  },
  {
    id: 'proxima-b-arid',
    commons: 'File:Artist’s impression of Proxima Centauri b shown hypothetically as an arid rocky super-earth.jpg',
    category: 'proxima-b',
    alt: 'Proxima b vue de l’espace, planète rocheuse et aride éclairée d’un seul côté',
    caption: 'Proxima b imaginée en super-Terre aride. Sa masse minimale est d’environ 1,07 fois celle de la Terre.',
    artistImpression: true,
  },
  {
    id: 'proxima-b-orbit',
    commons: 'File:Proxima Centauri and its planet compared to the Solar System fr.jpg',
    category: 'proxima-b',
    alt: 'Schéma comparant l’orbite de Proxima b à celles de Mercure et de la Terre',
    caption: 'L’orbite de Proxima b comparée au Système solaire : la planète tourne environ vingt fois plus près de son étoile que la Terre du Soleil.',
  },
  {
    id: 'proxima-b-render',
    commons: 'File:Proxima Centauri b (29196109016).png',
    category: 'proxima-b',
    alt: 'Rendu de Proxima b, planète aux continents clairs et aux nuages fins',
    caption: 'Une interprétation de Proxima b par l’illustrateur Kevin M. Gill.',
    artistImpression: true,
  },
  {
    id: 'proxima-b-sunset',
    commons: 'File:Sunset on Proxima Centauri b (51264023147).png',
    category: 'proxima-b',
    alt: 'Canyon rocheux sous un ciel crépusculaire rouge, étoile basse sur l’horizon',
    caption: 'Un crépuscule sur Proxima b, composé à partir d’un canyon terrestre. En rotation synchrone, ce crépuscule serait permanent le long du terminateur.',
    artistImpression: true,
    focus: '50% 60%',
  },
  {
    id: 'proxima-hubble',
    commons: 'File:New shot of Proxima Centauri, our nearest neighbour.jpg',
    category: 'star',
    alt: 'Proxima Centauri, étoile brillante entourée d’étoiles plus faibles',
    caption: 'Proxima Centauri photographiée par le télescope spatial Hubble. La planète, elle, est invisible sur l’image.',
  },
  {
    id: 'proxima-dust-belts',
    commons: "File:Artist's impression of the dust belts around Proxima Centauri.jpg",
    category: 'star',
    alt: 'Proxima Centauri rougeoyante entourée d’anneaux de poussière',
    caption: 'Proxima Centauri et les ceintures de poussière froide repérées autour d’elle par le radiotélescope ALMA en 2017.',
    artistImpression: true,
  },
  {
    id: 'alpha-centauri-paranal',
    commons: 'File:Alpha Centauri from Paranal.jpg',
    category: 'alpha-centauri',
    alt: 'Ciel étoilé au-dessus de l’observatoire de Paranal, Alpha Centauri très brillante',
    caption: 'Alpha Centauri, le système stellaire de Proxima, photographié depuis l’observatoire de Paranal au Chili.',
  },
  {
    id: 'alpha-centauri-vlt',
    commons: 'File:Alpha Centauri through the VLT (2016-04-04-paranal-vlt-alfacentauri-cc).jpg',
    category: 'alpha-centauri',
    alt: 'Télescopes du VLT sous un ciel étoilé où brille Alpha Centauri',
    caption: 'Alpha Centauri au-dessus des télescopes du VLT, à Paranal.',
  },
  {
    id: 'la-silla-night',
    commons: 'File:A good night to work (img 0428-cc).jpg',
    category: 'telescopes',
    alt: 'Coupoles de l’observatoire de La Silla ouvertes sous la Voie lactée',
    caption: 'La nuit tombe sur La Silla, où le spectrographe HARPS a traqué Proxima b pendant la campagne Pale Red Dot en 2016.',
  },
  {
    id: 'la-silla-panorama',
    commons: 'File:A glorious display at La Silla (2016-04-11-la-silla-cc).jpg',
    category: 'telescopes',
    alt: 'Panorama de la Voie lactée au-dessus des télescopes de La Silla',
    caption: 'La Voie lactée au-dessus de l’observatoire de La Silla, au Chili.',
  },
  {
    id: 'espresso',
    commons: 'File:A Taste of ESPRESSO.jpg',
    category: 'telescopes',
    alt: 'Le spectrographe ESPRESSO dans son laboratoire',
    caption: 'ESPRESSO, le spectrographe du VLT qui a confirmé l’existence de Proxima b en 2020.',
  },
  {
    id: 'voyager-1',
    commons: "File:Voyager 1's view of Solar System (artist's impression).jpg",
    category: 'missions',
    alt: 'La sonde Voyager 1 regardant le Système solaire depuis ses confins',
    caption: 'Voyager 1 aux confins du Système solaire. À 17 km/s, elle mettrait environ 75 000 ans à atteindre Proxima Centauri.',
    artistImpression: true,
  },
  {
    id: 'pale-blue-dot',
    commons: 'File:Pale Blue Dot from Voyager 1 - PIA23645.png',
    category: 'earth',
    alt: 'La Terre, minuscule point bleu pâle dans un rayon de lumière',
    caption: 'La Terre photographiée par Voyager 1 à six milliards de kilomètres : le « point bleu pâle ».',
  },
  {
    id: 'carina-nebula',
    commons: 'File:Carina Nebula by ESO.jpg',
    category: 'space',
    alt: 'Nébuleuse de la Carène, nuages de gaz rouges et bleus parsemés d’étoiles',
    caption: 'La nébuleuse de la Carène, dans le ciel austral, photographiée par l’ESO.',
  },
]
