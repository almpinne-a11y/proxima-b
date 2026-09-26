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
  donnees: 'proxima-b-orbit',
  hubble: 'proxima-hubble',
  'jour-nuit': 'proxima-b-surface',
  etoile: 'proxima-flare',
  habitable: 'proxima-b-ocean',
  decouverte: 'la-silla',
  voyage: 'voyager',
  archives: 'alpha-centauri',
  message: 'pale-blue-dot',
}

export const WORDMARK_IMAGE = 'milky-way'
