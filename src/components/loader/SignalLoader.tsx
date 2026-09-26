import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { SlidingNumber } from '@/components/ui/sliding-number'
import { TextShimmerWave } from '@/components/ui/text-shimmer-wave'
import { useReducedMotion, useSite } from '@/lib/store'
import { RadioWave } from './RadioWave'

const STEPS = ['Pointage de l’antenne', 'Acquisition du signal', 'Décodage des données', 'Signal reçu']
// 8 s, sauf paramètre de test (?timeout=…) pour les navigateurs sans GPU.
const TIMEOUT_MS = Number(new URLSearchParams(window.location.search).get('timeout')) || 8000
const MIN_DURATION_MS = 2400

/**
 * Loader « Acquisition du signal » : la progression suit le vrai chargement
 * (polices, textures de la scène, compilation des shaders, première image rendue).
 * Après 8 s sans WebGL prêt, on passe au rendu de repli : jamais de loader infini.
 */
export function SignalLoader() {
  const loading = useSite((s) => s.loading)
  const webgl = useSite((s) => s.webgl)
  const setWebgl = useSite((s) => s.setWebgl)
  const setRevealed = useSite((s) => s.setRevealed)
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(0)
  const [phase, setPhase] = useState<'loading' | 'decoded' | 'opening' | 'done'>('loading')
  const start = useRef(performance.now())

  const webglDone = webgl === 'unsupported' || webgl === 'failed'
  const real =
    loading.fonts * 0.2 +
    (webglDone ? 1 : loading.scene) * 0.45 +
    (webglDone ? 1 : loading.assets) * 0.1 +
    (webglDone ? 1 : loading.frame) * 0.25

  // Affichage : rattrape la vraie progression sans jamais la dépasser, en 2,4 s minimum.
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.1, Math.max(0, (now - last) / 1000))
      last = now
      const cap = Math.min(1, Math.max(0, (now - start.current) / MIN_DURATION_MS))
      setShown((value) => {
        const goal = Math.min(real, cap)
        const next = value + (goal - value) * (1 - Math.exp(-dt * 7))
        return goal - next < 0.004 ? goal : next
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [real])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (useSite.getState().webgl !== 'ready') setWebgl('failed')
    }, TIMEOUT_MS)
    return () => window.clearTimeout(timer)
  }, [setWebgl])

  const percent = Math.min(100, Math.floor(Math.min(shown, real) * 100 + 0.5))

  useEffect(() => {
    if (phase === 'loading' && percent >= 100) setPhase('decoded')
  }, [percent, phase])

  // « SIGNAL DÉCODÉ » reste affiché un instant, puis les volets s'ouvrent.
  useEffect(() => {
    if (phase !== 'decoded') return
    const t = window.setTimeout(() => {
      setPhase('opening')
      setRevealed(true)
    }, reduced ? 250 : 900)
    return () => window.clearTimeout(t)
  }, [phase, reduced, setRevealed])

  useEffect(() => {
    if (phase !== 'opening') return
    const t = window.setTimeout(() => setPhase('done'), reduced ? 300 : 1400)
    return () => window.clearTimeout(t)
  }, [phase, reduced])

  if (phase === 'done') return null
  const step = Math.min(STEPS.length - 1, Math.floor((percent / 100) * STEPS.length))
  const opening = phase === 'opening'
  const ease = [0.76, 0, 0.24, 1] as const

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={opening ? 'Signal décodé' : `Acquisition du signal : ${percent} %`}
      className="fixed inset-0 z-[80]"
      style={{ pointerEvents: opening ? 'none' : 'auto' }}
    >
      {/* Deux volets qui s'ouvrent (clip-path) sur le hero. */}
      {(['top', 'bottom'] as const).map((side) => (
        <motion.div
          key={side}
          aria-hidden="true"
          className="absolute inset-0 bg-void"
          initial={false}
          animate={{
            clipPath: opening
              ? side === 'top'
                ? 'inset(0 0 100% 0)'
                : 'inset(100% 0 0 0)'
              : side === 'top'
                ? 'inset(0 0 50% 0)'
                : 'inset(50% 0 0 0)',
          }}
          transition={{ duration: reduced ? 0.25 : 1.2, ease }}
        />
      ))}

      <AnimatePresence>
        {!opening && (
          <motion.div
            className="gutter absolute inset-0 flex flex-col items-center justify-center gap-8"
            exit={{ opacity: 0, filter: 'blur(8px)' }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-full max-w-xl">
              <RadioWave progress={shown} animate={!reduced} />
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              {reduced ? (
                <p className="label text-[11px] text-glow">Acquisition du signal — α Centauri C</p>
              ) : (
                <TextShimmerWave className="label text-[11px]" duration={1.1} spread={1.4} zDistance={6} scaleDistance={1.06}>
                  ACQUISITION DU SIGNAL — α CENTAURI C
                </TextShimmerWave>
              )}
              <div className="display flex items-baseline text-5xl font-semibold tabular-nums text-text sm:text-6xl">
                {/* Trois chiffres réservés (zéros de tête masqués) : rien ne bouge de 9 à 10 puis à 100. */}
                <SlidingNumber value={percent} minDigits={3} />
                <span className="ml-1 text-2xl text-muted">%</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={phase === 'decoded' ? 'decoded' : step}
                  className="label text-[10px] text-muted"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                >
                  {phase === 'decoded' ? (
                    <span className="text-glow">Signal décodé</span>
                  ) : (
                    `${String(step + 1).padStart(2, '0')} / 04 — ${STEPS[step]}`
                  )}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
