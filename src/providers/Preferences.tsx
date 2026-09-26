import { useEffect } from 'react'
import { useIsTouch } from '@/hooks/useMediaQuery'
import { pointerState, useReducedMotion, useSite } from '@/lib/store'

/** Préférences système (mouvements réduits) et suivi du pointeur pour la 3D. */
export function Preferences() {
  const setSystemReducedMotion = useSite((s) => s.setSystemReducedMotion)
  const reduced = useReducedMotion()
  const touch = useIsTouch()

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setSystemReducedMotion(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [setSystemReducedMotion])

  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? 'reduced' : 'full'
  }, [reduced])

  useEffect(() => {
    if (touch) return
    const onMove = (event: PointerEvent) => {
      pointerState.x = (event.clientX / window.innerWidth) * 2 - 1
      pointerState.y = -((event.clientY / window.innerHeight) * 2 - 1)
      pointerState.active = true
    }
    const onLeave = () => {
      pointerState.x = 0
      pointerState.y = 0
      pointerState.active = false
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [touch])

  return null
}
