import { create } from 'zustand'

export type SectionId =
  | 'hero'
  | 'distance'
  | 'donnees'
  | 'hubble'
  | 'jour-nuit'
  | 'etoile'
  | 'habitable'
  | 'decouverte'
  | 'voyage'
  | 'archives'
  | 'message'
  | 'a-venir'

export type Quality = 'high' | 'eco'
export type WebGLStatus = 'pending' | 'ready' | 'unsupported' | 'failed'

type SiteState = {
  activeSection: SectionId
  quality: Quality
  /** Choix explicite dans le panneau Mission (null = suivre le système). */
  reducedMotionOverride: boolean | null
  systemReducedMotion: boolean
  webgl: WebGLStatus
  /** Le loader est terminé, le site est révélé. */
  revealed: boolean
  loading: { fonts: number; scene: number; assets: number; frame: number }
  setActiveSection: (id: SectionId) => void
  setQuality: (quality: Quality) => void
  setReducedMotionOverride: (value: boolean | null) => void
  setSystemReducedMotion: (value: boolean) => void
  setWebgl: (status: WebGLStatus) => void
  setRevealed: (value: boolean) => void
  setLoading: (key: keyof SiteState['loading'], value: number) => void
}

export const useSite = create<SiteState>((set) => ({
  activeSection: 'hero',
  quality: 'high',
  reducedMotionOverride: null,
  systemReducedMotion: false,
  webgl: 'pending',
  revealed: false,
  loading: { fonts: 0, scene: 0, assets: 0, frame: 0 },
  setActiveSection: (activeSection) => set({ activeSection }),
  setQuality: (quality) => set({ quality }),
  setReducedMotionOverride: (reducedMotionOverride) => set({ reducedMotionOverride }),
  setSystemReducedMotion: (systemReducedMotion) => set({ systemReducedMotion }),
  setWebgl: (webgl) => set({ webgl }),
  setRevealed: (revealed) => set({ revealed }),
  setLoading: (key, value) =>
    set((state) => ({ loading: { ...state.loading, [key]: Math.max(state.loading[key], value) } })),
}))

export const useReducedMotion = () =>
  useSite((s) => (s.reducedMotionOverride ?? s.systemReducedMotion))

/**
 * État de scroll lu à chaque frame par la scène 3D : objet mutable,
 * mis à jour par ScrollTrigger, sans re-rendu React.
 * Pour chaque feuille : progression interne (0 → 1) et progression d'entrée
 * (la feuille glisse par-dessus la précédente, 0 → 1).
 */
export const scrollState = {
  progress: {} as Partial<Record<SectionId, number>>,
  enter: {} as Partial<Record<SectionId, number>>,
}

/** Pointeur normalisé (-1 → 1), lu par la scène 3D. */
export const pointerState = { x: 0, y: 0, active: false }

// Outils de diagnostic en développement uniquement (scripts/check.ts).
if (import.meta.env.DEV) {
  ;(window as unknown as { __site: typeof useSite }).__site = useSite
}
