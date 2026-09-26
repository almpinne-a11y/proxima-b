import {
  Atom,
  Binary,
  Globe2,
  Images,
  MoonStar,
  Orbit,
  Radio,
  Rocket,
  Ruler,
  Satellite,
  Sun,
  Telescope,
  type LucideIcon,
} from 'lucide-react'
import type { SectionId } from './store'

export type SectionMeta = {
  id: SectionId
  number: string
  label: string
  short: string
  icon: LucideIcon
  /** Section construite dans cet aperçu. */
  built: boolean
  pending?: string
}

export const SECTIONS: SectionMeta[] = [
  { id: 'hero', number: '01', label: 'Proxima b', short: 'Accueil', icon: Orbit, built: true },
  { id: 'distance', number: '02', label: 'La distance', short: 'Distance', icon: Ruler, built: true },
  { id: 'donnees', number: '03', label: 'Les données', short: 'Données', icon: Binary, built: false, pending: 'Bento Grid, Comet Card, Terminal, ASCII Art' },
  { id: 'hubble', number: '03 bis', label: 'Ce que voit Hubble', short: 'Hubble', icon: Telescope, built: false, pending: 'Container Scroll Animation, Lens, photo Hubble' },
  { id: 'jour-nuit', number: '04', label: 'Jour éternel, nuit éternelle', short: 'Jour / Nuit', icon: MoonStar, built: false, pending: 'Compare, SVG Mask Effect, Images Slider' },
  { id: 'etoile', number: '05', label: 'L’étoile', short: 'L’étoile', icon: Sun, built: false, pending: 'Vortex, éruptions, Chromatic Image, Dither Shader' },
  { id: 'habitable', number: '06', label: 'Habitable ?', short: 'Habitable', icon: Atom, built: false, pending: 'Canvas Text, Focus Cards, Parallax Scroll, Wobble Card' },
  { id: 'decouverte', number: '07', label: 'La découverte', short: 'Découverte', icon: Globe2, built: false, pending: 'Timeline, 3D Globe, Pixelated Canvas' },
  { id: 'voyage', number: '08', label: 'Le voyage', short: 'Voyage', icon: Rocket, built: false, pending: 'Text Flipping Board, scroll horizontal, 3D Card' },
  { id: 'archives', number: '09', label: 'Archives du signal', short: 'Archives', icon: Images, built: false, pending: 'Hero Parallax, 3D Marquee, galerie filtrable' },
  { id: 'message', number: '10', label: 'Envoyer un message', short: 'Message', icon: Radio, built: false, pending: 'Placeholders and Vanish Input, Stateful Button' },
]

export const PREVIEW_END: SectionMeta = {
  id: 'a-venir',
  number: '—',
  label: 'La suite du signal',
  short: 'À venir',
  icon: Satellite,
  built: true,
}

/** Ancre réelle vers laquelle mène une entrée de navigation dans l'aperçu. */
export const anchorFor = (section: SectionMeta) => (section.built ? `#${section.id}` : '#a-venir')
