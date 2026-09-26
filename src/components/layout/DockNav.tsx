import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock'
import { anchorFor, SECTIONS } from '@/lib/sections'
import { scrollToTarget } from '@/lib/scroll'
import { useSite } from '@/lib/store'
import { cn } from '@/lib/utils'

/** Dock (Motion Primitives) : une icône par section, défilement vers l'ancre. */
export function DockNav() {
  const active = useSite((s) => s.activeSection)

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)' }}
    >
      <div className="pointer-events-auto max-w-[calc(100vw-32px)] min-[900px]:max-w-none">
        <Dock className="items-end gap-3 pb-2.5" magnification={62} distance={120} panelHeight={54}>
          {SECTIONS.map((section) => {
            const Icon = section.icon
            const isActive = active === section.id
            return (
              <DockItem
                key={section.id}
                className={cn(
                  'aspect-square rounded-full border transition-colors duration-300',
                  isActive ? 'border-dwarf/60 bg-dwarf/15' : 'border-line bg-white/[0.04]',
                )}
                onClick={() => scrollToTarget(anchorFor(section))}
              >
                <DockLabel>{section.built ? section.label : `${section.label} · bientôt`}</DockLabel>
                <DockIcon>
                  <Icon
                    aria-hidden="true"
                    strokeWidth={1.5}
                    className={cn('h-full w-full', isActive ? 'text-glow' : section.built ? 'text-text/80' : 'text-text/35')}
                  />
                  <span className="sr-only">{section.label}</span>
                </DockIcon>
              </DockItem>
            )
          })}
        </Dock>
      </div>
    </div>
  )
}
