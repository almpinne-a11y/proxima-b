import { ArrowDown, ArrowRight } from 'lucide-react'
import { useEffect } from 'react'
import { Sheet } from '@/components/layout/Sheet'
import { HeroImages } from '@/components/media/HeroImages'
import { MagneticArea } from '@/components/site/MagneticArea'
import { RevealText } from '@/components/text/RevealText'
import { GlowEffect } from '@/components/ui/glow-effect'
import { SpinningText } from '@/components/ui/spinning-text'
import { TextScramble } from '@/components/ui/text-scramble'
import { ScrollTrigger } from '@/lib/gsap'
import { goToSection, scrollToTarget } from '@/lib/scroll'
import { useReducedMotion, useSite } from '@/lib/store'
import { cn } from '@/lib/utils'

/** Ordre de dissolution au scroll (identique pour les deux calques du titre). */
const STAGGER: Record<string, number> = { eyebrow: 0, title: 1, subtitle: 2, actions: 3, coords: 4, cue: 4 }

// Tailles liées à la largeur ET à la hauteur : rien ne déborde sur les écrans bas.
const TITLE_CLASS = 'display text-[clamp(2.7rem,min(13.4vw,17vh),14.5rem)] leading-[0.86]'
const BODY_CLASS = 'text-[clamp(0.95rem,min(1.5vw,2.6vh),1.35rem)] leading-snug'

/**
 * Colonne du hero. Elle est rendue deux fois avec exactement la même mise en page :
 * « base » (contenu réel) et « blend » (seul « Proxima » est visible, en mix-blend-mode: difference,
 * pour se fondre avec la planète du calque WebGL). Tout est dans le flux : aucun chevauchement possible.
 */
function HeroColumn({ mode }: { mode: 'base' | 'blend' }) {
  const revealed = useSite((s) => s.revealed)
  const reduced = useReducedMotion()
  const base = mode === 'base'
  const hide = !base && 'invisible'

  return (
    <div className="gutter absolute inset-0 flex flex-col pb-[calc(92px+env(safe-area-inset-bottom,0px))] pt-[calc(64px+env(safe-area-inset-top,0px)+clamp(12px,5vh,64px))] min-[900px]:pb-[104px]">
      <div className="flex min-h-0 flex-1 flex-col items-start justify-start gap-[clamp(10px,2.4vh,26px)] min-[900px]:justify-center">
        <p className={cn('label text-[10px] text-glow sm:text-[11px]', hide)} data-hero-part="eyebrow">
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

        <div className={cn('flex max-w-[34rem] flex-col gap-1.5', hide)} data-hero-part="subtitle">
          {base ? (
            <RevealText per="word" preset="blur" trigger={revealed} delay={0.9} className={cn(BODY_CLASS, 'text-text/90')}>
              La planète la plus proche du Système solaire.
            </RevealText>
          ) : (
            <p className={BODY_CLASS}>La planète la plus proche du Système solaire.</p>
          )}
          <p className={cn(BODY_CLASS, 'text-muted')}>
            Un monde <em className="editorial text-[1.2em] not-italic text-glow">inconnu</em>.
          </p>
        </div>

        <div className={cn('flex flex-wrap items-center gap-3 pt-1 sm:gap-4', hide)} data-hero-part="actions">
          <HeroActions interactive={base} />
        </div>
      </div>

      <div className={cn('flex shrink-0 items-end justify-between gap-6 pt-4', hide)}>
        <p className="label max-w-[16rem] text-[10px] text-muted" data-hero-part="coords">
          RA 14h 29m 43s · DEC −62° 40′ 46″
        </p>
        <div data-hero-part="cue" className="hidden min-[900px]:block">
          {base ? <ScrollCue /> : <div className="h-24 w-24" />}
        </div>
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
          onClick={() => goToSection('donnees')}
          className="inline-flex h-12 items-center rounded-full border border-line bg-void/60 px-6 text-[13px] font-medium tracking-[-0.01em] text-text/85 backdrop-blur-sm transition-colors duration-300 hover:border-glow/40 hover:text-text"
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
  // Au scroll : le texte se dissout pendant que la caméra s'approche de la planète.
  useEffect(() => {
    const section = document.getElementById('hero')
    if (!section) return
    const parts = () => Array.from(section.querySelectorAll<HTMLElement>('[data-hero-part]'))
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
      {/* Calque 10 : fonds animés. Calque 20 : images en parallaxe. Calque 30 : contenu. */}
      <div aria-hidden="true" className="absolute inset-0 z-10" />
      <div className="absolute inset-0 z-20" data-layer="media">
        <HeroImages />
      </div>
      <div className="relative z-30 h-full">
        <HeroColumn mode="base" />
      </div>
    </Sheet>
  )
}
