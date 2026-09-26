import { useSyncExternalStore } from 'react'

/** Onglet visible ? Le rendu 3D est mis en pause quand il est caché. */
export function usePageVisible() {
  return useSyncExternalStore(
    (onChange) => {
      document.addEventListener('visibilitychange', onChange)
      return () => document.removeEventListener('visibilitychange', onChange)
    },
    () => document.visibilityState !== 'hidden',
    () => true,
  )
}
