import { useInView } from 'motion/react'
import { useEffect, useRef, useState, type ElementType, type FC, type HTMLAttributes, type Ref } from 'react'
import { TextEffect, type PerType, type PresetType } from '@/components/ui/text-effect'
import { useReducedMotion, useSite } from '@/lib/store'
import { cn } from '@/lib/utils'

type RevealTextProps = {
  children: string
  as?: ElementType
  id?: string
  per?: PerType
  preset?: PresetType
  className?: string
  /** Classe du calque animé (ex. dégradé), en plus de celle du conteneur. */
  effectClassName?: string
  /** Classe ajoutée au texte brut en mouvements réduits. */
  reducedClassName?: string
  delay?: number
  speedReveal?: number
  speedSegment?: number
  /** Déclencheur externe (sinon : entrée dans le viewport). */
  trigger?: boolean
}

/** Même découpage que TextEffect (mots inline-block avec leur espace) : lignes identiques. */
function StaticSegments({ text, per }: { text: string; per: PerType }) {
  if (per === 'line') {
    return text.split('\n').map((line, i) => (
      <span key={i} className="block">
        {line}
      </span>
    ))
  }
  return (text.match(/\S+\s*|\s+/g) ?? []).map((segment, i) =>
    per === 'char' ? (
      <span key={i} className="inline-block whitespace-pre">
        {segment.split('').map((char, j) => (
          <span key={j} className="inline-block whitespace-pre">
            {char}
          </span>
        ))}
      </span>
    ) : (
      <span key={i} className="inline-block whitespace-pre">
        {segment}
      </span>
    ),
  )
}

/**
 * Enveloppe de TextEffect (Motion Primitives) :
 * - ne déclenche l'effet qu'à l'entrée dans le viewport (once, marge -15 %) ;
 * - réserve la place du texte dès le départ (aucun layout shift) ;
 * - texte brut sous prefers-reduced-motion.
 */
export function RevealText({
  children,
  as = 'p',
  id,
  per = 'word',
  preset = 'blur',
  className,
  effectClassName,
  reducedClassName,
  delay = 0,
  speedReveal,
  speedSegment,
  trigger,
}: RevealTextProps) {
  const Tag = as as unknown as FC<HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> }>
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15%' })
  const reduced = useReducedMotion()
  const revealed = useSite((s) => s.revealed)
  const [started, setStarted] = useState(false)
  const active = revealed && (trigger ?? inView)

  useEffect(() => {
    if (active) setStarted(true)
  }, [active])

  if (reduced) {
    return (
      <Tag ref={ref} id={id} className={cn(className, reducedClassName)}>
        {children}
      </Tag>
    )
  }

  return (
    <Tag ref={ref} id={id} className={cn('relative', className)}>
      {/* Réserve la place avec le même découpage que l'animation. */}
      <span aria-hidden="true" className="block opacity-0">
        <StaticSegments text={children} per={per} />
      </span>
      {!started && <span className="sr-only">{children}</span>}
      <TextEffect
        as="span"
        per={per}
        preset={preset}
        trigger={started}
        delay={delay}
        speedReveal={speedReveal}
        speedSegment={speedSegment}
        className={cn('absolute inset-0 block', effectClassName)}
        segmentTransition={
          preset === 'scale'
            ? { type: 'spring', bounce: 0, duration: 1.1 }
            : { ease: [0.22, 1, 0.36, 1], duration: per === 'char' ? 0.7 : 0.9 }
        }
      >
        {children}
      </TextEffect>
    </Tag>
  )
}
