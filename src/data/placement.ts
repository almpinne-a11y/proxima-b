import type { SectionId } from '@/lib/store'

/**
 * Où chaque image est incrustée (identifiants de scripts/images/selection.ts).
 * Une image absente de src/data/images.ts n'est simplement pas affichée.
 */
export const HERO_IMAGES = [
  { id: 'proxima-b-surface', depth: 'far' },
  { id: 'proxima-hubble', depth: 'near' },
] as const

export const SECTION_IMAGES: Partial<Record<SectionId, string>> = {
  donnees: 'angular-size',
  hubble: 'proxima-hubble',
  'jour-nuit': 'proxima-b-sunset',
  etoile: 'proxima-dust-belts',
  habitable: 'proxima-b-render',
  decouverte: 'la-silla-night',
  voyage: 'voyager-1',
  archives: 'alpha-centauri-vlt',
  message: 'pale-blue-dot',
}

export const WORDMARK_IMAGE = 'la-silla-panorama'
