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

export const SELECTION: Selected[] = []
