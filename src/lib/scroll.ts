import type Lenis from 'lenis'

let lenis: Lenis | null = null

export const setLenis = (instance: Lenis | null) => {
  lenis = instance
}

export const getLenis = () => lenis

/** Défile vers une ancre (#id) ou une position, avec Lenis si le smooth scroll est actif. */
export function scrollToTarget(target: string | number) {
  const element = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : null
  const top =
    typeof target === 'number' ? target : element ? element.getBoundingClientRect().top + window.scrollY : null
  if (top === null) return
  if (lenis) {
    lenis.scrollTo(top, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) })
  } else {
    window.scrollTo({ top, behavior: 'auto' })
  }
  if (element) {
    // Le focus suit la navigation (clavier, lecteurs d'écran), sans nouveau défilement.
    const focusable = element.querySelector<HTMLElement>('h1, h2') ?? element
    if (!focusable.hasAttribute('tabindex')) focusable.setAttribute('tabindex', '-1')
    focusable.focus({ preventScroll: true })
  }
}
