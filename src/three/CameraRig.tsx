import { useFrame, useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
import { pointerState, scrollState } from '@/lib/store'
import { smooth, type SceneLayout } from './config'

/**
 * Position « narrative » s : somme des progressions de scroll, dans l'ordre des feuilles.
 * Chaque unité de s correspond à une étape (voir les keyframes de config.ts).
 */
export function storyPosition() {
  const { progress, enter } = scrollState
  return (
    (progress.hero ?? 0) +
    (enter.distance ?? 0) +
    (progress.distance ?? 0) +
    (enter['a-venir'] ?? 0)
  )
}

export function CameraRig({ layout, parallax }: { layout: SceneLayout; parallax: boolean }) {
  const camera = useThree((s) => s.camera)
  const temp = useMemo(
    () => ({ pos: new THREE.Vector3(), target: new THREE.Vector3(), look: new THREE.Vector3(), initialized: false }),
    [],
  )

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const frames = layout.keyframes
    const s = THREE.MathUtils.clamp(storyPosition(), 0, frames.length - 1)
    const i = Math.min(Math.floor(s), frames.length - 2)
    const t = smooth(s - i)
    temp.pos.lerpVectors(frames[i][0], frames[i + 1][0], t)
    temp.target.lerpVectors(frames[i][1], frames[i + 1][1], t)

    if (parallax) {
      temp.pos.x += pointerState.x * 0.28
      temp.pos.y += pointerState.y * 0.16
    }

    if (!temp.initialized) {
      camera.position.copy(temp.pos)
      temp.look.copy(temp.target)
      temp.initialized = true
    }
    const k = 1 - Math.exp(-dt * 3.2)
    camera.position.lerp(temp.pos, k)
    temp.look.lerp(temp.target, k)
    camera.lookAt(temp.look)
  })

  return null
}
