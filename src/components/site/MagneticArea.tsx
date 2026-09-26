import type { ReactNode } from 'react'
import { Magnetic } from '@/components/ui/magnetic'
import { useIsTouch } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/lib/store'

/** Magnetic (Motion Primitives), désactivé sur tactile et en mouvements réduits. */
export function MagneticArea({ children, intensity = 0.35, range = 110 }: { children: ReactNode; intensity?: number; range?: number }) {
  const touch = useIsTouch()
  const reduced = useReducedMotion()
  if (touch || reduced) return <>{children}</>
  return (
    <Magnetic intensity={intensity} range={range} springOptions={{ stiffness: 180, damping: 18, mass: 0.3 }}>
      {children}
    </Magnetic>
  )
}
