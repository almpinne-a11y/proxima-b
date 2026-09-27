import { createContext, useContext, useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { ScrollTrigger } from '@/lib/gsap'
import { cn } from '@/lib/utils'
import { scrollState, useSite, type SectionId } from '@/lib/store'

type SheetContextValue = { id: SectionId; wrapper: RefObject<HTMLElement | null>; scrollLength: number }
const SheetContext = createContext<SheetContextValue | null>(null)

export function useSheet() {
  const context = useContext(SheetContext)
  if (!context) throw new Error('useSheet doit être utilisé dans <Sheet>')
  return context
}

const ORDER: SectionId[] = []

const docBottom = (el: HTMLElement) => el.getBoundingClientRect().bottom + window.scrollY

function updateActiveSection() {
  let active: SectionId = ORDER[0] ?? 'hero'
  for (const id of ORDER) {
    if (id === ORDER[0] || (scrollState.enter[id] ?? 0) >= 0.5) active = id
  }
  if (useSite.getState().activeSection !== active) useSite.getState().setActiveSection(active)
}

type SheetProps = {
  id: SectionId
  /** Ordre d'empilement : 0 pour la première feuille (pas de contexte d'empilement). */
  index: number
  labelledBy: string
  /** Scroll supplémentaire pendant lequel la feuille reste épinglée (en vh). */
  scrollLength?: number
  /** Une feuille suivante viendra la recouvrir (ajoute 100vh épinglés). */
  covered?: boolean
  /** Opacité du voile --void (laisse voir le calque WebGL en dessous). */
  veil?: number
  /** Feuille finale à hauteur libre (pas d'épinglage). */
  free?: boolean
  className?: string
  /** Calques ajoutés hors du conteneur épinglé (ex. un calque en mix-blend-mode). */
  overlay?: ReactNode
  children: ReactNode
}

/**
 * Feuille de récit. Chaque feuille glisse PAR-DESSUS la précédente (sticky + z-index croissant),
 * reste épinglée pendant `scrollLength`, puis se dissout quand la suivante la recouvre.
 */
export function Sheet({
  id,
  index,
  labelledBy,
  scrollLength = 0,
  covered = false,
  veil = 0,
  free = false,
  className,
  overlay,
  children,
}: SheetProps) {
  const wrapper = useRef<HTMLElement>(null)
  const content = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = wrapper.current
    if (!el) return
    if (!ORDER.includes(id)) ORDER.splice(index, 0, id)
    const triggers: ScrollTrigger[] = []

    if (index > 0) {
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: 'top bottom',
          end: 'top top',
          onUpdate: (self) => {
            scrollState.enter[id] = self.progress
            updateActiveSection()
          },
          onRefresh: (self) => {
            scrollState.enter[id] = self.progress
          },
        }),
      )
    }
    if (scrollLength > 0) {
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: 'top top',
          end: () => `+=${(window.innerHeight * scrollLength) / 100}`,
          onUpdate: (self) => {
            scrollState.progress[id] = self.progress
          },
          onRefresh: (self) => {
            scrollState.progress[id] = self.progress
          },
        }),
      )
    }
    if (covered) {
      // Dissolution pendant que la feuille suivante glisse par-dessus.
      // Les styles ne sont posés qu'au-delà de 0 : au repos, aucun contexte d'empilement n'est créé.
      const layers = () => [content.current, ...Array.from(el.querySelectorAll<HTMLElement>('[data-sheet-overlay]'))]
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: () => docBottom(el) - 2 * window.innerHeight,
          end: () => docBottom(el) - window.innerHeight,
          onUpdate: (self) => {
            const p = self.progress
            for (const layer of layers()) {
              if (!layer) continue
              if (p <= 0.001) {
                layer.style.removeProperty('opacity')
                layer.style.removeProperty('transform')
                layer.style.removeProperty('filter')
                continue
              }
              const e = p * p
              layer.style.opacity = String(1 - e)
              layer.style.transform = `translate3d(0, ${-4 * e}vh, 0) scale(${1 - 0.05 * e})`
              layer.style.filter = `blur(${6 * e}px)`
            }
          },
        }),
      )
    }
    return () => triggers.forEach((t) => t.kill())
  }, [id, index, scrollLength, covered])

  const height = free ? undefined : `calc(100vh + ${scrollLength}vh + ${covered ? 100 : 0}vh)`
  const style: CSSProperties = {
    height,
    zIndex: index > 0 ? index : undefined,
    marginTop: index > 0 ? '-100vh' : undefined,
  }

  return (
    <SheetContext.Provider value={{ id, wrapper, scrollLength }}>
      <section id={id} ref={wrapper} aria-labelledby={labelledBy} className="relative" style={style}>
        {index > 0 && veil > 0 && (
          // Ombre portée sur la feuille précédente : elle finit exactement à l'opacité du haut du voile,
          // pour que le bord de la feuille ne forme ni ligne ni marche.
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-[30vh] h-[30vh]"
            style={{ background: `linear-gradient(to bottom, transparent, rgba(5, 3, 10, ${veil * 0.55}))` }}
          />
        )}
        <div
          className={cn(free ? 'relative min-h-screen-safe' : 'sticky top-0 h-screen-safe overflow-hidden')}
        >
          {veil > 0 && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, rgba(5, 3, 10, ${veil * 0.55}) 0, rgba(5, 3, 10, ${veil}) 24vh)`,
              }}
            />
          )}
          <div ref={content} className={cn('relative h-full', className)}>
            {children}
          </div>
        </div>
        {overlay}
      </section>
    </SheetContext.Provider>
  )
}
