import { ArrowDown, ArrowRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Sheet } from '@/components/layout/Sheet'
import { MagneticArea } from '@/components/site/MagneticArea'
import { RevealText } from '@/components/text/RevealText'
import { GlowEffect } from '@/components/ui/glow-effect'
import { SpinningText } from '@/components/ui/spinning-text'
import { TextScramble } from '@/components/ui/text-scramble'
import { ScrollTrigger } from '@/lib/gsap'
import { scrollToTarget } from '@/lib/scroll'
import { useReducedMotion, useSite } from '@/lib/store'
import { cn } from '@/lib/utils'

/** Ordre de dissolution au scroll (identique pour les deux calques du titre). */
const STAGGER: Record<string, number> = { eyebrow: 0, title: 1, subtitle: 2, actions: 3, coords: 4, cue: 4 }

const TITLE_CLASS = 'display text-[clamp(3.6rem,13.4vw,14.5rem)] leading-[0.86]'

/** Colonne commune aux deux calques : même mise en page, donc titre superposé au pixel près. */
function HeroColumn({ mode }: { mode: 'base' | 'blend' }) {
  const revealed = useSite((s) => s.revealed)
  const reduced = useReducedMotion()
  const base = mode === 'base'

  return (
    <div
      className="gutter absolute inset-x-0 top-[17vh] flex flex-col items-start gap-6 min-[900px]:top-[21vh]"
      data-hero-part={base ? 'column' : undefined}
    >
      <p className={cn('label text-[10px] text-glow sm:text-[11px]', !base && 'invisible')} data-hero-part="eyebrow">
        {base && revealed && !reduced ? (
          <TextScramble as="span" duration={1.1} speed={0.035} characterSet="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·">
            EXOPLANÈTE · SYSTÈME ALPHA CENTAURI
          </TextScramble>
        ) : (
          'EXOPLANÈTE · SYSTÈME ALPHA CENTAURI'
        )}
      </p>

      {base ? (
        <h1 id="hero-title" className={TITLE_CLASS} data-hero-part="title">
          {/* « Proxima » est dessiné par le calque en mix-blend-mode ; ici, il reste lisible par les lecteurs d'écran. */}
          <span className="opacity-0">Proxima</span>{' '}
          <RevealText
            as="span"
            per="word"
            preset="scale"
            trigger={revealed}
            delay={0.55}
            className="editorial inline-block text-[1.12em] leading-none"
            effectClassName="text-gradient-dwarf pr-[0.06em]"
            reducedClassName="text-gradient-dwarf"
          >
            b.
          </RevealText>
        </h1>
      ) : (
        <p aria-hidden="true" className={TITLE_CLASS} data-hero-part="title">
          <RevealText as="span" per="char" preset="fade-in-blur" trigger={revealed} className="inline-block text-text" speedReveal={0.9}>
            Proxima
          </RevealText>{' '}
          <span className="editorial invisible inline-block text-[1.12em] leading-none">b.</span>
        </p>
      )}

      <div className={cn('flex max-w-[34rem] flex-col gap-1.5', !base && 'invisible')} data-hero-part="subtitle">
        {base ? (
          <>
            <RevealText per="word" preset="blur" trigger={revealed} delay={0.9} className="text-[clamp(1rem,1.5vw,1.35rem)] leading-snug text-text/90">
              La planète la plus proche du Système solaire.
            </RevealText>
            <p className="text-[clamp(1rem,1.5vw,1.35rem)] leading-snug text-muted">
              Un monde <em className="editorial text-[1.2em] not-italic text-glow">inconnu</em>.
            </p>
          </>
        ) : (
          <p className="text-[clamp(1rem,1.5vw,1.35rem)] leading-snug">
            La planète la plus proche du Système solaire.
            <br />
            Un monde inconnu.
          </p>
        )}
      </div>

      <div className={cn('flex flex-wrap items-center gap-4 pt-2', !base && 'invisible')} data-hero-part="actions">
        <HeroActions interactive={base} />
      </div>
    </div>
  )
}

function HeroActions({ interactive }: { interactive: boolean }) {
  const reduced = useReducedMotion()
  const tab = interactive ? undefined : -1
  return (
    <>
      <MagneticArea>
        <div className="relative">
          <GlowEffect
            mode={reduced ? 'static' : 'rotate'}
            blur="medium"
            duration={6}
            scale={1.02}
            className="rounded-full opacity-70"
          />
          <button
            type="button"
            tabIndex={tab}
            data-cursor="Explorer"
            onClick={() => scrollToTarget('#distance')}
            className="group relative inline-flex h-12 items-center gap-3 rounded-full border border-dwarf/40 bg-void/90 pl-6 pr-2 text-[13px] font-medium tracking-[-0.01em] text-text"
          >
            Commencer le voyage
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-dwarf text-void transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5">
              <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </span>
          </button>
        </div>
      </MagneticArea>
      <MagneticArea>
        <button
          type="button"
          tabIndex={tab}
          data-cursor="Ouvrir"
          onClick={() => scrollToTarget('#a-venir')}
          className="inline-flex h-12 items-center rounded-full border border-line bg-white/[0.03] px-6 text-[13px] font-medium tracking-[-0.01em] text-text/85 backdrop-blur-sm transition-colors duration-300 hover:border-glow/40 hover:text-text"
        >
          Les données
        </button>
      </MagneticArea>
    </>
  )
}

function ScrollCue() {
  const reduced = useReducedMotion()
  return (
    <button
      type="button"
      onClick={() => scrollToTarget('#distance')}
      data-cursor="Défiler"
      aria-label="Défiler vers la section suivante"
      className="relative flex h-24 w-24 items-center justify-center rounded-full"
    >
      <SpinningText
        radius={5.4}
        fontSize={0.62}
        duration={16}
        className="label absolute inset-0 text-text/60"
        variants={reduced ? { container: { visible: { rotate: 0 } } } : undefined}
      >
        {'DÉFILER · EXPLORER · DÉFILER · EXPLORER · '}
      </SpinningText>
      <ArrowDown className="h-4 w-4 text-glow" strokeWidth={1.5} aria-hidden="true" />
    </button>
  )
}

export function Hero() {
  const root = useRef<HTMLDivElement>(null)

  // Au scroll : le texte se dissout pendant que la caméra s'approche de la planète.
  useEffect(() => {
    const section = document.getElementById('hero')
    if (!section) return
    const parts = () => Array.from(section.querySelectorAll<HTMLElement>('[data-hero-part]:not([data-hero-part="column"])'))
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${window.innerHeight * 0.8}`,
      onUpdate: (self) => {
        const p = self.progress
        parts().forEach((el) => {
          const order = STAGGER[el.dataset.heroPart ?? ''] ?? 0
          const local = Math.min(1, Math.max(0, (p - order * 0.07) / 0.6))
          if (local <= 0) {
            el.style.removeProperty('opacity')
            el.style.removeProperty('transform')
            el.style.removeProperty('filter')
            return
          }
          const e = local * local
          el.style.opacity = String(1 - e)
          el.style.transform = `translate3d(0, ${-6 * e}vh, 0)`
          el.style.filter = `blur(${10 * e}px)`
        })
      },
    })
    return () => trigger.kill()
  }, [])

  return (
    <Sheet
      id="hero"
      index={0}
      labelledBy="hero-title"
      scrollLength={80}
      covered
      overlay={
        <div
          aria-hidden="true"
          data-sheet-overlay
          className="pointer-events-none sticky top-0 -mt-[100vh] h-screen-safe overflow-hidden mix-blend-difference"
        >
          <HeroColumn mode="blend" />
        </div>
      }
    >
      <div ref={root} className="h-full">
        {/* Calque 10 (fonds Aceternity) et 20 (images en parallaxe) : à venir. */}
        <div aria-hidden="true" className="absolute inset-0 z-10" />
        <div aria-hidden="true" className="absolute inset-0 z-20" />
        <div className="relative z-30 h-full">
          <HeroColumn mode="base" />
          <div className="gutter absolute inset-x-0 bottom-[calc(150px+env(safe-area-inset-bottom,0px))] flex items-end justify-between gap-6 min-[900px]:bottom-[120px]">
            <p className="label max-w-[16rem] text-[10px] text-muted" data-hero-part="coords">
              RA 14h 29m 43s · DEC −62° 40′ 46″
            </p>
            <div data-hero-part="cue" className="hidden min-[900px]:block">
              <ScrollCue />
            </div>
          </div>
        </div>
      </div>
    </Sheet>
  )
}
