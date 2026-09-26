import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { shaders } from '../shaders'

type StarfieldProps = {
  count: number
  animate: boolean
}

// Températures d'étoiles, de la plus froide à la plus chaude (teintes sRGB).
const PALETTE = ['#ffb38a', '#ffd2b0', '#fff1e4', '#fff8f0', '#f4f1ff', '#d8e8ff', '#ff8f70']
const WEIGHTS = [0.08, 0.16, 0.3, 0.22, 0.12, 0.07, 0.05]

function pick(random: () => number) {
  let r = random()
  for (let i = 0; i < WEIGHTS.length; i++) {
    r -= WEIGHTS[i]
    if (r <= 0) return PALETTE[i]
  }
  return PALETTE[2]
}

/** Générateur pseudo-aléatoire déterministe : le ciel est identique à chaque visite. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function Starfield({ count, animate }: StarfieldProps) {
  const dpr = useThree((s) => s.viewport.dpr)

  const geometry = useMemo(() => {
    const random = mulberry32(42)
    const total = count + 2
    const positions = new Float32Array(total * 3)
    const colors = new Float32Array(total * 3)
    const sizes = new Float32Array(total)
    const phases = new Float32Array(total)
    const color = new THREE.Color()
    for (let i = 0; i < count; i++) {
      const u = random() * 2 - 1
      const theta = random() * Math.PI * 2
      const r = 70 + random() * 45
      const s = Math.sqrt(1 - u * u)
      positions.set([r * s * Math.cos(theta), r * u, r * s * Math.sin(theta)], i * 3)
      color.set(pick(random))
      const bright = random()
      const intensity = 0.35 + Math.pow(bright, 3) * 1.4
      colors.set([color.r * intensity, color.g * intensity, color.b * intensity], i * 3)
      sizes[i] = bright > 0.985 ? 3.2 + random() * 1.6 : 1.1 + Math.pow(random(), 2.5) * 1.9
      phases[i] = random()
    }
    // Alpha Centauri A et B : la paire la plus brillante du ciel de Proxima b.
    const dir = new THREE.Vector3(0.62, 0.42, -0.66).normalize()
    const a = dir.clone().multiplyScalar(90)
    const b = a.clone().add(new THREE.Vector3(0.9, -0.35, 0.2))
    positions.set([a.x, a.y, a.z, b.x, b.y, b.z], count * 3)
    color.set('#fff4dc')
    colors.set([color.r * 2.2, color.g * 2.2, color.b * 2.2], count * 3)
    color.set('#ffd9a8')
    colors.set([color.r * 1.7, color.g * 1.7, color.b * 1.7], (count + 1) * 3)
    sizes[count] = 6.5
    sizes[count + 1] = 5
    phases[count] = 0.2
    phases[count + 1] = 0.7

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    g.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
    return g
  }, [count])

  useEffect(() => () => geometry.dispose(), [geometry])

  const [uniforms] = useState(() => ({
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
    uTwinkle: { value: 1 },
  }))

  useFrame((_, delta) => {
    uniforms.uPixelRatio.value = dpr
    uniforms.uTwinkle.value = animate ? 1 : 0
    if (animate) uniforms.uTime.value += Math.min(delta, 0.05)
  })

  return (
    <points geometry={geometry} renderOrder={-1} frustumCulled={false}>
      <shaderMaterial
        vertexShader={shaders.stars.vertex}
        fragmentShader={shaders.stars.fragment}
        uniforms={uniforms}
        blending={THREE.AdditiveBlending}
        transparent
        depthWrite={false}
      />
    </points>
  )
}
