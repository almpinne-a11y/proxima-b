import { useMemo } from 'react'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'
import { useReducedMotion } from '@/lib/store'

function useNoiseTile(size = 180) {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''
    const image = ctx.createImageData(size, size)
    for (let i = 0; i < image.data.length; i += 4) {
      // Grain surtout sombre avec des points clairs : pas de voile gris sur le noir.
      const v = Math.pow(Math.random(), 2.6) * 255
      image.data[i] = v
      image.data[i + 1] = v
      image.data[i + 2] = v
      image.data[i + 3] = 255
    }
    ctx.putImageData(image, 0, 0)
    return canvas.toDataURL('image/png')
  }, [size])
}

/** Calque 40 : grain animé, vignette radiale, flous progressifs haut et bas. */
export function AmbientOverlays() {
  const noise = useNoiseTile()
  const reduced = useReducedMotion()

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(5, 3, 10, 0.72) 100%)' }}
      />
      <ProgressiveBlur direction="top" blurLayers={6} blurIntensity={0.55} className="absolute inset-x-0 top-0 h-24" />
      <ProgressiveBlur direction="bottom" blurLayers={6} blurIntensity={0.55} className="absolute inset-x-0 bottom-0 h-28" />
      <div
        className="absolute -inset-[50%] opacity-[0.06]"
        style={{
          backgroundImage: noise ? `url(${noise})` : undefined,
          animation: reduced ? undefined : 'grain-shift 0.9s steps(8) infinite',
        }}
      />
    </div>
  )
}
