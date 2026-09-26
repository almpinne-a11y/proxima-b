import { useSyncExternalStore } from 'react'

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** Appareil tactile sans survol : pas de curseur custom, de Magnetic ni de Tilt. */
export const useIsTouch = () => useMediaQuery('(hover: none), (pointer: coarse)')
