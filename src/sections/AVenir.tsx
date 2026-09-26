import { Sheet } from '@/components/layout/Sheet'
import { UpcomingSections } from './parts/UpcomingSections'

export function AVenir() {
  return (
    <Sheet id="a-venir" index={2} labelledBy="a-venir-title" veil={0.86} free>
      <div className="gutter relative z-30 flex min-h-screen-safe flex-col gap-14 pb-40 pt-[calc(120px+env(safe-area-inset-top,0px))]">
        <header className="flex max-w-3xl flex-col gap-5">
          <p className="label text-[10px] text-glow sm:text-[11px]">Aperçu · la suite du signal</p>
          <h2 id="a-venir-title" className="display text-[clamp(2.2rem,5.6vw,5.4rem)] leading-[0.95]">
            La suite <span className="editorial text-gradient-dwarf">du signal</span>
          </h2>
          <p className="max-w-2xl text-[clamp(0.98rem,1.25vw,1.12rem)] leading-relaxed text-text/80">
            Cet aperçu montre la direction artistique, la scène 3D et la mécanique de défilement. Les neuf sections
            suivantes attendent les composants Aceternity et les images de l’ESO, de l’ESA, de la NASA et
            d’Unsplash, dont les sites sont bloqués par le réseau de l’environnement de développement.
          </p>
        </header>
        <UpcomingSections />
      </div>
      <footer className="gutter relative z-30 flex flex-col gap-2 border-t border-line pb-[calc(120px+env(safe-area-inset-bottom,0px))] pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="label text-[10px] text-muted">Proxima b · aperçu v0.1 · septembre 2026</p>
        <p className="label text-[10px] text-muted">Planète et étoile procédurales · aucune image n’est encore utilisée</p>
      </footer>
    </Sheet>
  )
}
