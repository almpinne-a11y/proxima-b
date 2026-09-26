import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Cursor } from '@/components/ui/cursor'
import { useIsTouch } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/lib/store'

/**
 * Curseur (Motion Primitives) : point --dwarf + anneau qui affiche un label contextuel
 * lu dans l'attribut data-cursor de l'élément survolé (« Explorer », « Ouvrir », « Glisser »…).
 * Absent sur tactile.
 */
export function CustomCursor() {
  const touch = useIsTouch()
  const reduced = useReducedMotion()
  const [label, setLabel] = useState<string | null>(null)
  const [pressed, setPressed] = useState(false)
  // Le curseur n'apparaît qu'au premier mouvement de la souris (pas d'anneau figé au centre).
  const [moved, setMoved] = useState(false)

  useEffect(() => {
    if (touch) return
    const root = document.documentElement
    root.classList.add('has-custom-cursor')
    const onOver = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null
      const labelled = target?.closest<HTMLElement>('[data-cursor]')
      if (labelled) return setLabel(labelled.dataset.cursor || null)
      setLabel(target?.closest('a, button, [role="button"]') ? 'Ouvrir' : null)
    }
    const onFirstMove = () => setMoved(true)
    window.addEventListener('pointermove', onFirstMove, { once: true })
    const onDown = () => setPressed(true)
    const onUp = () => setPressed(false)
    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('pointerup', onUp)
    return () => {
      root.classList.remove('has-custom-cursor')
      document.body.style.cursor = ''
      window.removeEventListener('pointermove', onFirstMove)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointerup', onUp)
    }
  }, [touch])

  if (touch || !moved) return null

  return (
    <>
      <Cursor className="z-60 mix-blend-normal" springConfig={reduced ? undefined : { stiffness: 260, damping: 28, mass: 0.6 }}>
        <motion.div
          layout
          className="flex items-center justify-center rounded-full border"
          initial={false}
          animate={{
            minWidth: label ? 0 : 34,
            height: label ? 30 : 34,
            paddingLeft: label ? 14 : 0,
            paddingRight: label ? 14 : 0,
            borderColor: label ? 'rgba(255, 77, 46, 0.9)' : 'rgba(255, 179, 138, 0.45)',
            backgroundColor: label ? 'rgba(13, 8, 20, 0.78)' : 'rgba(13, 8, 20, 0)',
            scale: pressed ? 0.88 : 1,
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {label && (
              <motion.span
                key={label}
                className="label whitespace-nowrap text-[10px] text-text"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </Cursor>
      <Cursor className="z-60">
        <motion.div
          className="rounded-full bg-dwarf"
          animate={{ width: label ? 4 : 6, height: label ? 4 : 6, opacity: label ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        />
      </Cursor>
    </>
  )
}
