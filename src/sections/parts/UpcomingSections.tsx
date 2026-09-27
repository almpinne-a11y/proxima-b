import { DuotoneImage } from '@/components/media/DuotoneImage'
import { Lightbox } from '@/components/media/Lightbox'
import { InView } from '@/components/ui/in-view'
import { imageById } from '@/data/images'
import { SECTION_IMAGES } from '@/data/placement'
import { cardIdFor, SECTIONS } from '@/lib/sections'
import { useReducedMotion } from '@/lib/store'

/** Sections en construction, chacune illustrée (entrée InView, Motion Primitives). */
export function UpcomingSections() {
  const reduced = useReducedMotion()
  const upcoming = SECTIONS.filter((s) => !s.built)

  return (
    <ol className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 xl:grid-cols-3">
      {upcoming.map((section, i) => {
        const Icon = section.icon
        const image = imageById(SECTION_IMAGES[section.id] ?? '')
        return (
          <li key={section.id} id={cardIdFor(section)} className="bg-void/80 focus-visible:-outline-offset-2">
            <InView
              viewOptions={{ once: true, margin: '-10% 0px' }}
              variants={
                reduced
                  ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
                  : { hidden: { opacity: 0, y: 24, filter: 'blur(8px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)' } }
              }
              transition={{ duration: 0.8, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex h-full flex-col gap-4 p-6">
                {image && (
                  <Lightbox image={image} sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 90vw" className="relative aspect-[16/9] w-full rounded-lg">
                    <DuotoneImage image={image} sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 90vw" className="absolute inset-0" />
                  </Lightbox>
                )}
                <div className="flex items-center justify-between">
                  <span className="label text-[10px] text-muted">{section.number}</span>
                  <span className="label rounded-full border border-dwarf/35 px-2.5 py-1 text-[9px] text-glow">En construction</span>
                </div>
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0 text-glow" strokeWidth={1.5} aria-hidden="true" />
                  <h3 className="text-[17px] font-semibold tracking-[-0.03em] text-text">{section.label}</h3>
                </div>
                <p className="text-[13px] leading-relaxed text-muted">{section.pending}</p>
              </div>
            </InView>
          </li>
        )
      })}
    </ol>
  )
}
