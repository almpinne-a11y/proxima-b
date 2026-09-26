import { BookOpen, Gauge, Waves } from 'lucide-react'
import ToolbarExpandable from '@/components/ui/toolbar-expandable'
import { useReducedMotion, useSite } from '@/lib/store'
import { cn } from '@/lib/utils'

function Choice({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        'label flex-1 rounded-lg border px-3 py-2 text-[10px] transition-colors duration-300',
        pressed ? 'border-dwarf/70 bg-dwarf/15 text-glow' : 'border-line text-text/70 hover:text-text',
      )}
    >
      {children}
    </button>
  )
}

const SOURCES = [
  { label: 'NASA Exoplanet Archive — Proxima Cen b', href: 'https://exoplanetarchive.ipac.caltech.edu/overview/Proxima%20Cen%20b' },
  { label: 'ESO — Pale Red Dot, annonce de Proxima b (2016)', href: 'https://www.eso.org/public/news/eso1629/' },
  { label: 'ESO — Proxima d, nouvelle planète candidate (2022)', href: 'https://www.eso.org/public/news/eso2202/' },
]

/** Panneau « Mission » (ToolbarExpandable, Motion Primitives) : qualité 3D, mouvements, sources. */
export function MissionPanel() {
  const quality = useSite((s) => s.quality)
  const setQuality = useSite((s) => s.setQuality)
  const reduced = useReducedMotion()
  const setOverride = useSite((s) => s.setReducedMotionOverride)

  const items = [
    {
      id: 1,
      label: 'Qualité 3D',
      title: <Gauge className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden="true" />,
      content: (
        <div className="flex flex-col gap-3">
          <p className="label text-[10px] text-muted">Qualité 3D</p>
          <div className="flex gap-2">
            <Choice pressed={quality === 'high'} onClick={() => setQuality('high')}>Haute</Choice>
            <Choice pressed={quality === 'eco'} onClick={() => setQuality('eco')}>Économie</Choice>
          </div>
          <p className="text-[12px] leading-relaxed text-muted">
            Économie : 1 500 étoiles au lieu de 4 000, résolution réduite, bloom seul.
          </p>
        </div>
      ),
    },
    {
      id: 2,
      label: 'Mouvements',
      title: <Waves className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden="true" />,
      content: (
        <div className="flex flex-col gap-3">
          <p className="label text-[10px] text-muted">Mouvements</p>
          <div className="flex gap-2">
            <Choice pressed={!reduced} onClick={() => setOverride(false)}>Normal</Choice>
            <Choice pressed={reduced} onClick={() => setOverride(true)}>Réduits</Choice>
          </div>
          <p className="text-[12px] leading-relaxed text-muted">
            Réduits : pas de défilement fluide ni d’animations en boucle, apparitions en simple fondu.
          </p>
        </div>
      ),
    },
    {
      id: 3,
      label: 'Sources',
      title: <BookOpen className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden="true" />,
      content: (
        <div className="flex flex-col gap-3">
          <p className="label text-[10px] text-muted">Sources</p>
          <ul className="flex flex-col gap-2 text-[12px] leading-snug">
            {SOURCES.map((source) => (
              <li key={source.href}>
                <a
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-text/85 underline decoration-line underline-offset-4 transition-colors hover:text-glow hover:decoration-glow"
                >
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
  ]

  return (
    <aside
      aria-label="Panneau Mission"
      className="fixed right-[max(16px,env(safe-area-inset-right,0px))] bottom-[calc(env(safe-area-inset-bottom,0px)+88px)] z-50 min-[900px]:bottom-[calc(env(safe-area-inset-bottom,0px)+18px)]"
    >
      <ToolbarExpandable items={items} minPanelWidth={280} />
    </aside>
  )
}
