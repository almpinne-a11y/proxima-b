import { useEffect, useRef } from 'react'

/** Onde radio (canvas 2D) dont l'amplitude suit la progression du chargement. */
export function RadioWave({ progress, animate }: { progress: number; animate: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const target = useRef(progress)
  target.current = progress

  useEffect(() => {
    const el = canvas.current
    const ctx = el?.getContext('2d')
    if (!el || !ctx) return
    let raf = 0
    let amp = 0
    let t = 0
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      el.width = el.clientWidth * dpr
      el.height = el.clientHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const draw = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      amp += (target.current - amp) * 0.06
      if (animate) t += 0.016
      ctx.clearRect(0, 0, w, h)
      const layers = [
        { color: 'rgba(255, 77, 46, 0.95)', width: 1.4, freq: 1, phase: 0, gain: 1 },
        { color: 'rgba(255, 138, 61, 0.45)', width: 1, freq: 1.7, phase: 1.3, gain: 0.6 },
        { color: 'rgba(255, 179, 138, 0.25)', width: 1, freq: 2.6, phase: 2.1, gain: 0.35 },
      ]
      for (const layer of layers) {
        ctx.beginPath()
        for (let x = 0; x <= w; x += 2) {
          const u = x / w
          const envelope = Math.sin(Math.PI * u) ** 2
          const carrier = Math.sin(u * Math.PI * 2 * 7 * layer.freq + t * 4 + layer.phase)
          const noise = Math.sin(u * 91 + t * 11 + layer.phase) * 0.25 * (1 - amp)
          const y = h / 2 + (carrier + noise) * envelope * (0.06 + amp * 0.38) * h * layer.gain
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.strokeStyle = layer.color
        ctx.lineWidth = layer.width
        ctx.stroke()
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [animate])

  return <canvas ref={canvas} aria-hidden="true" className="h-24 w-full" />
}
