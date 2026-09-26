import { useMemo } from 'react'

/**
 * Repli sans WebGL : planète en dégradés CSS, étoiles en box-shadow.
 * Jamais de loader infini : ce rendu s'affiche dès que WebGL est absent ou trop lent.
 */
export function CssFallback() {
  const stars = useMemo(() => {
    let seed = 7
    const random = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }
    return Array.from({ length: 160 }, () => {
      const x = (random() * 100).toFixed(2)
      const y = (random() * 100).toFixed(2)
      const a = (0.25 + random() * 0.7).toFixed(2)
      return `${x}vw ${y}vh 0 ${random() > 0.93 ? 1 : 0}px rgba(255, 236, 220, ${a})`
    }).join(',')
  }, [])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-void">
      <div className="absolute left-0 top-0 h-px w-px" style={{ boxShadow: stars }} />
      <div
        className="absolute rounded-full"
        style={{
          left: '6vw',
          top: '9vh',
          width: '1.6rem',
          height: '1.6rem',
          background: 'radial-gradient(circle, #fff1e4 0%, #ffb38a 30%, #ff4d2e 70%, transparent 100%)',
          boxShadow: '0 0 60px 20px rgba(255, 77, 46, 0.45), 0 0 160px 60px rgba(255, 77, 46, 0.18)',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          right: 'max(-8vw, -120px)',
          top: '50%',
          width: 'min(78vh, 90vw)',
          aspectRatio: '1',
          transform: 'translateY(-46%)',
          background:
            'radial-gradient(circle at 28% 32%, #b8663e 0%, #7a3320 28%, #2a1216 55%, #0b0610 75%), #05030a',
          boxShadow:
            'inset -40px -30px 90px rgba(5, 3, 10, 0.95), inset 18px 14px 40px rgba(255, 138, 61, 0.35), -10px -8px 60px rgba(255, 138, 61, 0.28), 14px 12px 50px rgba(95, 200, 255, 0.12)',
        }}
      />
    </div>
  )
}
