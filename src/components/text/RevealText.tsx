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
      {/* Réserve la place ; lisible par les lecteurs d'écran jusqu'au déclenchement. */}
      <span aria-hidden={started || undefined} className={cn('block opacity-0', per === 'line' && 'whitespace-pre-line')}>
        {children}
      </span>
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
