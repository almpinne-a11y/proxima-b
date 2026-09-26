import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { pointerState } from '@/lib/store'
import { useProgressiveBake } from '../bake'
import type { SceneLayout } from '../config'
import { shaders } from '../shaders'

type PlanetProps = {
  layout: SceneLayout
  bakeSize: number
  animate: boolean
  onProgress?: (progress: number) => void
}

/** Point subsolaire en espace objet : il reste face à l'étoile (rotation synchrone). */
const SUBSTELLAR = new THREE.Vector3(1, 0, 0)
const ATMOSPHERE_SCALE = 1.14

export function Planet({ layout, bakeSize, animate, onProgress }: PlanetProps) {
  const tilt = useRef<THREE.Group>(null)

  const terrain = useProgressiveBake(shaders.bake.terrain, { width: bakeSize, height: bakeSize / 2, seed: 3.7, float: true, strips: bakeSize / 32 })
  const clouds = useProgressiveBake(shaders.bake.clouds, { width: bakeSize, height: bakeSize / 2, seed: 1.3, strips: bakeSize / 64 })
  const maps = useMemo(() => ({ terrain: terrain.texture, clouds: clouds.texture }), [terrain.texture, clouds.texture])

  useEffect(() => {
    onProgress?.(terrain.progress * 0.65 + clouds.progress * 0.35)
  }, [terrain.progress, clouds.progress, onProgress])

  const lightDir = useMemo(() => layout.star.clone().sub(layout.planet).normalize(), [layout])
  const orientation = useMemo(() => new THREE.Quaternion().setFromUnitVectors(SUBSTELLAR, lightDir), [lightDir])

  // Uniforms stables : on ne met à jour que leurs valeurs.
  const [planetUniforms] = useState(() => ({
    uTerrain: { value: maps.terrain },
    uClouds: { value: maps.clouds },
    uTexel: { value: new THREE.Vector2(1 / bakeSize, 2 / bakeSize) },
    uLightDir: { value: lightDir.clone() },
    uLightColor: { value: new THREE.Color('#ff9f6e') },
    uLightIntensity: { value: 1.7 },
    uDayRim: { value: new THREE.Color('#ffb38a') },
    uNightRim: { value: new THREE.Color('#5fc8ff') },
    uTwilight: { value: new THREE.Color('#7a2f6e') },
    uCloudShift: { value: 0 },
    uBump: { value: bakeSize * 0.01 },
    uExposure: { value: 1 },
  }))
  const [atmosphereUniforms] = useState(() => ({
    uLightDir: { value: lightDir.clone() },
    uDayColor: { value: new THREE.Color('#ff8a3d') },
    uNightColor: { value: new THREE.Color('#5fc8ff') },
    uIntensity: { value: 1.35 },
    uLimb: { value: Math.sqrt(1 - 1 / (ATMOSPHERE_SCALE * ATMOSPHERE_SCALE)) },
  }))

  useEffect(() => {
    planetUniforms.uTerrain.value = maps.terrain
    planetUniforms.uClouds.value = maps.clouds
    planetUniforms.uTexel.value.set(1 / bakeSize, 2 / bakeSize)
    planetUniforms.uBump.value = bakeSize * 0.01
  }, [maps, bakeSize, planetUniforms])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    if (animate) planetUniforms.uCloudShift.value = (planetUniforms.uCloudShift.value + dt * 0.0018) % 1
    // Lumière en espace monde : direction planète → étoile.
    planetUniforms.uLightDir.value.copy(lightDir)
    atmosphereUniforms.uLightDir.value.copy(lightDir)
    const group = tilt.current
    if (group) {
      const k = 1 - Math.exp(-dt * 2.5)
      group.rotation.x += (pointerState.y * 0.1 - group.rotation.x) * k
      group.rotation.y += (pointerState.x * 0.16 - group.rotation.y) * k
    }
  })

  return (
    <group position={layout.planet} scale={layout.planetRadius}>
      <group ref={tilt}>
        <mesh quaternion={orientation} renderOrder={0}>
          <sphereGeometry args={[1, 160, 120]} />
          <shaderMaterial
            vertexShader={shaders.planet.vertex}
            fragmentShader={shaders.planet.fragment}
            uniforms={planetUniforms}
          />
        </mesh>
        <mesh scale={ATMOSPHERE_SCALE} renderOrder={1}>
          <sphereGeometry args={[1, 96, 64]} />
          <shaderMaterial
            vertexShader={shaders.atmosphere.vertex}
            fragmentShader={shaders.atmosphere.fragment}
            uniforms={atmosphereUniforms}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            transparent
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  )
}
