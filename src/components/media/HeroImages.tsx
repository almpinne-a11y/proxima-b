import { useEffect, useRef } from 'react'
import { imageById } from '@/data/images'
import { HERO_IMAGES } from '@/data/placement'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { pointerState, scrollState, useReducedMotion } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Lightbox } from './Lightbox'

// Emplacements libres de texte, à droite de la planète (desktop uniquement).
const SLOTS = {
  // Tailles bornées par la hauteur : l'image proche s'arrête au-dessus de l'indicateur de scroll.
  far: { className: 'right-[4vw] top-[13vh] w-[clamp(96px,min(11vw,17vh),190px)] rotate-[4deg]', depth: 0.35, blur: 1.2 },
  near: { className: 'right-[2.5vw] top-[37vh] w-[clamp(110px,min(13vw,21vh),230px)] -rotate-[3deg]', depth: 1, blur: 0 },
} as const

/**
 * Calque 20 du hero : vues flottant à différentes profondeurs autour de la planète,
 * floues selon la distance, en parallaxe avec la souris ; elles s'écartent au scroll.
 */
export function HeroImages() {
  const small = useMediaQuery('(max-width: 899px)')
  const reduced = useReducedMotion()
  const refs = useRef<Array<HTMLDivElement | null>>([])
  const items = HERO_IMAGES.map((item) => ({ ...item, image: imageById(item.id) })).filter((item) => item.image)
  const key = items.map((item) => item.id).join('|')

  useEffect(() => {
    if (small || !items.length) return
    let raf = 0
    const current = items.map(() => ({ x: 0, y: 0 }))
    const tick = () => {
      const spread = scrollState.progress.hero ?? 0
      items.forEach((item, i) => {
        const el = refs.current[i]
        if (!el) return
        const depth = SLOTS[item.depth].depth
        const tx = (reduced ? 0 : pointerState.x * 24 * depth) + spread * 160 * depth
        const ty = (reduced ? 0 : -pointerState.y * 16 * depth) - spread * 70 * (1 - depth)
        current[i].x += (tx - current[i].x) * 0.08
        current[i].y += (ty - current[i].y) * 0.08
        el.style.transform = `translate3d(${current[i].x.toFixed(2)}px, ${current[i].y.toFixed(2)}px, 0)`
        el.style.opacity = String(1 - Math.min(1, spread * 1.3))
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // `items` est dérivé de `key` (données statiques).
  }, [small, reduced, key]) // oxlint-disable-line react-hooks/exhaustive-deps

  if (small || !items.length) return null

  return (
    <>
      {items.map((item, i) => {
        const slot = SLOTS[item.depth]
        return (
          <div
            key={item.id}
            ref={(el) => {
              refs.current[i] = el
            }}
            className={cn('absolute will-change-transform', slot.className)}
            style={{ filter: slot.blur ? `blur(${slot.blur}px)` : undefined }}
          >
            <Lightbox
              image={item.image!}
              sizes="230px"
              className="aspect-[4/5] w-full rounded-lg border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
            >
              <span className="label absolute inset-x-0 bottom-0 bg-gradient-to-t from-void/90 to-transparent px-3 pb-2 pt-6 text-left text-[9px] text-text/80">
                {item.image!.artistImpression ? 'Vue d’artiste' : 'Photographie'}
              </span>
            </Lightbox>
          </div>
        )
      })}
    </>
  )
}
