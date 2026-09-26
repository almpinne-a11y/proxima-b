import { Billboard } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useState } from 'react'
import * as THREE from 'three'
import type { SceneLayout } from '../config'
import { shaders } from '../shaders'

type StarProps = {
  layout: SceneLayout
  animate: boolean
}

/** Proxima Centauri : naine rouge M5.5V, granulation animée et couronne. */
export function Star({ layout, animate }: StarProps) {
  const [time] = useState(() => ({ value: 0 }))
  const [flare] = useState(() => ({ value: 0 }))
  const [starUniforms] = useState(() => ({ uTime: time, uIntensity: { value: 3.2 }, uFlare: flare }))
  const [coronaUniforms] = useState(() => ({
    uTime: time,
    uFlare: flare,
    uIntensity: { value: 1.1 },
    uColor: { value: new THREE.Color('#ff4d2e') },
    uHot: { value: new THREE.Color('#ffb38a') },
  }))

  useFrame((_, delta) => {
    if (animate) time.value += Math.min(delta, 0.05)
  })

  return (
    <group position={layout.star}>
      <mesh renderOrder={2}>
        <sphereGeometry args={[layout.starRadius, 64, 48]} />
        <shaderMaterial
          vertexShader={shaders.star.vertex}
          fragmentShader={shaders.star.fragment}
          uniforms={starUniforms}
        />
      </mesh>
      <Billboard>
        <mesh renderOrder={3} scale={layout.starRadius * 16}>
          <planeGeometry args={[1, 1]} />
          <shaderMaterial
            vertexShader={shaders.corona.vertex}
            fragmentShader={shaders.corona.fragment}
            uniforms={coronaUniforms}
            blending={THREE.AdditiveBlending}
            transparent
            depthWrite={false}
          />
        </mesh>
      </Billboard>
    </group>
  )
}
