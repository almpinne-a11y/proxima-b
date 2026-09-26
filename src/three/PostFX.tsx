import { Bloom, ChromaticAberration, EffectComposer, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { useMemo } from 'react'
import * as THREE from 'three'

/** Qualité Haute : bloom + légère aberration chromatique. Économie : bloom seul. */
export function PostFX({ eco }: { eco: boolean }) {
  const offset = useMemo(() => new THREE.Vector2(0.00055, 0.00035), [])
  if (eco) {
    return (
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={1.1} luminanceThreshold={0.85} luminanceSmoothing={0.25} radius={0.7} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    )
  }
  return (
    <EffectComposer multisampling={4}>
      <Bloom mipmapBlur intensity={1.2} luminanceThreshold={0.82} luminanceSmoothing={0.25} radius={0.74} />
      <ChromaticAberration offset={offset} radialModulation modulationOffset={0.35} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  )
}
