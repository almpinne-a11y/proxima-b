import { useState } from 'react'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { TextRoll } from '@/components/ui/text-roll'
import { MagneticArea } from '@/components/site/MagneticArea'
import { anchorFor, SECTIONS } from '@/lib/sections'
import { scrollToTarget } from '@/lib/scroll'
import { useReducedMotion, useSite } from '@/lib/store'
import { cn } from '@/lib/utils'

const LINKS = SECTIONS.filter((s) => ['distance', 'donnees', 'jour-nuit', 'habitable', 'voyage', 'archives'].includes(s.id))

function RollingLabel({ text, rolling }: { text: string; rolling: number }) {
  const reduced = useReducedMotion()
  if (reduced || rolling === 0) return <span>{text}</span>
  return (
    <TextRoll
      key={rolling}
      duration={0.32}
      getEnterDelay={(i) => i * 0.018}
      getExitDelay={(i) => i * 0.018 + 0.1}
      transition={{ ease: [0.22, 1, 0.36, 1] }}
    >
      {text}
    </TextRoll>
  )
}

/**
 * Barre de navigation (aperçu). Liens : AnimatedBackground au survol + TextRoll.
 * La Resizable Navbar d'Aceternity l'enveloppera dès que ses sources seront accessibles.
 */
export function Navbar() {
  const active = useSite((s) => s.activeSection)
  const [rolls, setRolls] = useState<Record<string, number>>({})

  return (
    <header className="fixed inset-x-0 top-0 z-50" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <nav aria-label="Navigation principale" className="gutter flex h-16 items-center justify-between gap-6">
        <MagneticArea intensity={0.2}>
          <a
            href="#hero"
            onClick={(event) => {
              event.preventDefault()
              scrollToTarget(0)
            }}
            className="flex items-baseline gap-1 text-[15px] font-semibold tracking-[-0.04em] text-text"
          >
            Proxima<span className="editorial text-gradient-dwarf text-[19px]">b.</span>
          </a>
        </MagneticArea>

        <div className="hidden items-center rounded-full border border-line bg-deep/40 p-1 backdrop-blur-md min-[900px]:flex">
          <AnimatedBackground
            className="rounded-full bg-white/[0.07]"
            transition={{ type: 'spring', bounce: 0.15, duration: 0.45 }}
            enableHover
          >
            {LINKS.map((link) => (
              <a
                key={link.id}
                data-id={link.id}
                href={anchorFor(link)}
                onClick={(event) => {
                  event.preventDefault()
                  scrollToTarget(anchorFor(link))
                }}
                onMouseEnter={() => setRolls((r) => ({ ...r, [link.id]: (r[link.id] ?? 0) + 1 }))}
                className={cn(
                  'label px-3.5 py-2 text-[10px] transition-colors duration-300',
                  active === link.id ? 'text-glow' : 'text-text/70 hover:text-text',
                )}
                aria-current={active === link.id ? 'location' : undefined}
              >
                <RollingLabel text={link.short} rolling={rolls[link.id] ?? 0} />
              </a>
            ))}
          </AnimatedBackground>
        </div>

        <p className="label hidden text-[10px] text-muted sm:block">
          <span className="text-dwarf">●</span> Aperçu · v0.1
        </p>
      </nav>
    </header>
  )
}
