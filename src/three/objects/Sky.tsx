import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { useProgressiveBake } from '../bake'
import { shaders } from '../shaders'

type SkyProps = { bakeSize: number; onProgress?: (progress: number) => void }

/** Voûte céleste très sombre : bande galactique et poussières (texture cuite). */
export function Sky({ bakeSize, onProgress }: SkyProps) {
  const sky = useProgressiveBake(shaders.bake.sky, { width: bakeSize, height: bakeSize / 2, seed: 7.1, strips: bakeSize / 128 })
  const [uniforms] = useState(() => ({ uSky: { value: sky.texture }, uIntensity: { value: 1 } }))

  useEffect(() => {
    uniforms.uSky.value = sky.texture
  }, [sky.texture, uniforms])

  useEffect(() => {
    onProgress?.(sky.progress)
  }, [sky.progress, onProgress])

  return (
    <mesh renderOrder={-2} frustumCulled={false}>
      <sphereGeometry args={[200, 64, 32]} />
      <shaderMaterial
        vertexShader={shaders.sky.vertex}
        fragmentShader={shaders.sky.fragment}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  )
}
