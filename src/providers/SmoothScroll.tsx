import Lenis from 'lenis'
import { useEffect, type ReactNode } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { getLenis, setLenis } from '@/lib/scroll'
import { useReducedMotion, useSite } from '@/lib/store'

/** Lenis synchronisé avec ScrollTrigger. Désactivé en mouvements réduits. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion()
  const revealed = useSite((s) => s.revealed)

  useEffect(() => {
    if (reduced) return
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.1 })
    setLenis(lenis)
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      setLenis(null)
    }
  }, [reduced])

  // Pas de défilement tant que le signal n'est pas décodé (loader).
  useEffect(() => {
    document.documentElement.style.overflow = revealed ? '' : 'hidden'
    const lenis = getLenis()
    if (revealed) {
      lenis?.start()
      ScrollTrigger.refresh()
    } else {
      lenis?.stop()
    }
  }, [revealed, reduced])

  return children
}
