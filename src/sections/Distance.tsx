import { useEffect, useState } from 'react'
import { Sheet, useSheet } from '@/components/layout/Sheet'
import { RevealText } from '@/components/text/RevealText'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { TextMorph } from '@/components/ui/text-morph'
import { TextScramble } from '@/components/ui/text-scramble'
import { ScrollTrigger } from '@/lib/gsap'
import { useReducedMotion } from '@/lib/store'

/** 4,2465 années-lumière ≈ 4,02 × 10¹³ km ; arrondi éditorial : 40 000 milliards de km. */
const DISTANCE_KM = 40_000_000_000_000
const COUNT_END = 0.62
const MORPH_AT = 0.7
const FINAL_AT = 0.8

/** Le ressort converge lentement : à 0,2 % de l'arrivée, on affiche la valeur exacte. */
const formatKm = (value: number) =>
  (Math.abs(value - DISTANCE_KM) < DISTANCE_KM * 0.002 ? DISTANCE_KM : Math.round(value)).toLocaleString('fr-FR')

function useSheetProgress() {
  const { wrapper, scrollLength } = useSheet()
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const el = wrapper.current
    if (!el) return
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: () => `+=${(window.innerHeight * scrollLength) / 100}`,
      onUpdate: (self) => setProgress(Math.round(self.progress * 500) / 500),
      onRefresh: (self) => setProgress(Math.round(self.progress * 500) / 500),
    })
    return () => trigger.kill()
  }, [wrapper, scrollLength])
  return progress
}

function DistanceContent() {
  const progress = useSheetProgress()
  const reduced = useReducedMotion()
  const [labelSeen, setLabelSeen] = useState(false)
  const t = Math.min(1, progress / COUNT_END)
  const eased = 1 - Math.pow(1 - t, 3)
  const km = progress >= COUNT_END ? DISTANCE_KM : Math.round((DISTANCE_KM * eased) / 1e9) * 1e9

  useEffect(() => {
    if (progress > 0 || labelSeen) setLabelSeen(true)
  }, [progress, labelSeen])

  return (
    <div className="gutter relative z-30 flex h-full flex-col justify-between gap-[clamp(14px,3vh,40px)] pb-[calc(96px+env(safe-area-inset-bottom,0px))] pt-[calc(64px+env(safe-area-inset-top,0px)+clamp(12px,4vh,48px))] min-[900px]:pb-[108px]">
      <header className="flex max-w-3xl flex-col gap-[clamp(10px,2vh,20px)]">
        <p className="label text-[10px] text-glow sm:text-[11px]">
          {labelSeen && !reduced ? <TextScramble as="span">02 · LA DISTANCE</TextScramble> : '02 · LA DISTANCE'}
        </p>
        <RevealText
          as="h2"
          id="distance-title"
          per="char"
          preset="fade-in-blur"
          className="display max-w-[12ch] text-[clamp(2.1rem,min(6.2vw,9.5vh),6rem)] leading-[0.95]"
        >
          Le voisin le plus proche
        </RevealText>
        <RevealText per="word" preset="blur" delay={0.3} className="max-w-xl text-[clamp(0.95rem,min(1.35vw,2.3vh),1.2rem)] leading-relaxed text-text/80">
          Même en filant à la vitesse de la lumière, il faudrait plus de quatre ans pour l’atteindre.
        </RevealText>
      </header>

      <div className="flex flex-col gap-[clamp(6px,1.4vh,12px)]">
        <p className="label text-[10px] text-muted">Distance Terre – Proxima Centauri</p>
        <p className="display flex flex-wrap items-baseline gap-x-4 text-[clamp(1.7rem,min(5.6vw,9vh),6.4rem)] font-semibold leading-none text-text">
          <span className="relative inline-block tabular-nums">
            {/* Largeur de la valeur finale réservée : l'unité « km » ne bouge jamais. */}
            <span aria-hidden="true" className="invisible">{formatKm(DISTANCE_KM)}</span>
            <AnimatedNumber
              value={km}
              springOptions={{ stiffness: 90, damping: 22, mass: 0.6 }}
              format={formatKm}
              className="absolute inset-0 whitespace-nowrap text-left"
            />
          </span>
          <span className="text-[0.45em] font-normal text-muted">km</span>
        </p>
        <TextMorph as="p" className="editorial text-[clamp(1.3rem,min(3.4vw,5.2vh),3.4rem)] leading-tight text-glow">
          {progress >= MORPH_AT ? 'soit 4,24 années-lumière' : 'soit 40 000 milliards de km'}
        </TextMorph>
      </div>

      <div className="max-w-2xl">
        <RevealText
          per="word"
          preset="blur"
          trigger={progress >= FINAL_AT}
          className="text-[clamp(1rem,min(1.6vw,2.6vh),1.45rem)] leading-snug text-text"
        >
          La lumière qui en part aujourd’hui arrivera chez nous dans plus de quatre ans.
        </RevealText>
      </div>
    </div>
  )
}

export function Distance() {
  return (
    <Sheet id="distance" index={1} labelledBy="distance-title" scrollLength={150} covered veil={0.5}>
      {/* Calque 10 : Background Lines (Aceternity) — à venir. */}
      <div aria-hidden="true" className="absolute inset-0 z-10" />
      <DistanceContent />
    </Sheet>
  )
}
