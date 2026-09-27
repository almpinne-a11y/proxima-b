import type Lenis from 'lenis'
import { anchorFor, SECTIONS } from './sections'
import type { SectionId } from './store'

let lenis: Lenis | null = null

export const setLenis = (instance: Lenis | null) => {
  lenis = instance
}

export const getLenis = () => lenis

type ScrollOptions = {
  /** « start » : la cible en haut de l'écran. « center » : la cible centrée, sous la barre de navigation. */
  align?: 'start' | 'center'
  /** Appelé à l'arrivée, une fois le défilement terminé. */
  onArrive?: (element: HTMLElement) => void
}

/** Défile vers une ancre (#id) ou une position, avec Lenis si le smooth scroll est actif. */
export function scrollToTarget(target: string | number, { align = 'start', onArrive }: ScrollOptions = {}) {
  const element = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : null
  if (typeof target === 'string' && !element) return
  let top = typeof target === 'number' ? target : 0
  if (element) {
    const rect = element.getBoundingClientRect()
    let offset = 0
    if (align === 'center') {
      const header = document.getElementById('site-header')?.getBoundingClientRect().bottom ?? 64
      offset = Math.max(header + 16, (window.innerHeight - rect.height) / 2)
    }
    top = rect.top + window.scrollY - offset
  }
  const arrive = () => {
    if (element) onArrive?.(element)
  }
  if (lenis) {
    lenis.scrollTo(top, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4), onComplete: arrive })
  } else {
    window.scrollTo({ top, behavior: 'auto' })
    arrive()
  }
  if (element) {
    // Le focus suit la navigation (clavier, lecteurs d'écran), sans nouveau défilement.
    const focusable = element.querySelector<HTMLElement>('h1, h2') ?? element
    if (!focusable.hasAttribute('tabindex')) focusable.setAttribute('tabindex', '-1')
    focusable.focus({ preventScroll: true })
  }
}

/** Brève surbrillance à l'arrivée (animation [data-highlight] de globals.css), relancée à chaque visite. */
function highlight(element: HTMLElement) {
  element.removeAttribute('data-highlight')
  void element.offsetWidth
  element.setAttribute('data-highlight', '')
}

/**
 * Mène à une section : la section elle-même si elle est construite, sinon sa carte
 * dans « La suite du signal », centrée à l'écran puis mise en évidence.
 */
export function goToSection(id: SectionId) {
  const section = SECTIONS.find((s) => s.id === id)
  if (!section || section.built) {
    scrollToTarget(`#${id}`)
    return
  }
  scrollToTarget(anchorFor(section), { align: 'center', onArrive: highlight })
}
