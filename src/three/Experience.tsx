import { useProgress } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { usePageVisible } from '@/hooks/usePageVisible'
import { useReducedMotion, useSite } from '@/lib/store'
import { CameraRig } from './CameraRig'
import { layoutFor } from './config'
import { Planet } from './objects/Planet'
import { Sky } from './objects/Sky'
import { Star } from './objects/Star'
import { Starfield } from './objects/Starfield'
import { PostFX } from './PostFX'

/** Signale au loader : cuisson des textures, compilation des shaders, première image. */
function Readiness({ baked }: { baked: boolean }) {
  const { gl, scene, camera } = useThree()
  const setLoading = useSite((s) => s.setLoading)
  const setWebgl = useSite((s) => s.setWebgl)
  const assets = useProgress()
  const frames = useRef(0)
  const [compiled, setCompiled] = useState(false)

  useEffect(() => {
    // Textures chargées par three.js (aucune pour l'instant : la scène est procédurale).
    setLoading('assets', assets.total === 0 ? 1 : assets.progress / 100)
  }, [assets.total, assets.progress, setLoading])

  useEffect(() => {
    if (!baked) return
    setLoading('scene', 0.6)
    let cancelled = false
    gl.compileAsync(scene, camera)
      .catch(() => undefined)
      .then(() => {
        if (cancelled) return
        setLoading('scene', 1)
        setCompiled(true)
      })
    return () => {
      cancelled = true
    }
  }, [baked, gl, scene, camera, setLoading])

  useFrame(() => {
    if (!compiled || frames.current > 2) return
    frames.current += 1
    if (frames.current === 2) {
      setLoading('frame', 1)
      setWebgl('ready')
    }
  })

  return null
}

function Scene({ eco, animate }: { eco: boolean; animate: boolean }) {
  const size = useThree((s) => s.size)
  const layout = useMemo(() => layoutFor(size.width / Math.max(size.height, 1)), [size.width, size.height])
  const bakeSize = eco ? 1024 : 2048
  const setLoading = useSite((s) => s.setLoading)
  const [planetProgress, setPlanetProgress] = useState(0)
  const [skyProgress, setSkyProgress] = useState(0)
  const baked = planetProgress >= 1 && skyProgress >= 1

  useEffect(() => {
    // Cuisson des textures : 60 % de l'étape « scène », la compilation des shaders fait le reste.
    setLoading('scene', (planetProgress * 0.75 + skyProgress * 0.25) * 0.6)
  }, [planetProgress, skyProgress, setLoading])

  return (
    <>
      <Sky bakeSize={bakeSize} onProgress={setSkyProgress} />
      <Starfield count={eco ? 1500 : 4000} animate={animate} />
      <Star layout={layout} animate={animate} />
      <Planet layout={layout} bakeSize={bakeSize} animate={animate} onProgress={setPlanetProgress} />
      <CameraRig layout={layout} parallax={animate} />
      <Readiness baked={baked} />
    </>
  )
}

export function Experience() {
  const quality = useSite((s) => s.quality)
  const setWebgl = useSite((s) => s.setWebgl)
  const setQuality = useSite((s) => s.setQuality)
  const [attempt, setAttempt] = useState(0)
  const reduced = useReducedMotion()
  const small = useMediaQuery('(max-width: 899px)')
  const visible = usePageVisible()
  const eco = quality === 'eco' || small

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        key={attempt}
        dpr={eco ? [1, 1.5] : [1, 2]}
        frameloop={visible ? 'always' : 'never'}
        camera={{ fov: 35, near: 0.1, far: 500, position: [0, 0.1, 10] }}
        gl={{ antialias: false, alpha: false, stencil: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NoToneMapping
          gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault()
            // Première perte en qualité Haute : on relance la scène en Économie.
            if (attempt === 0 && useSite.getState().quality === 'high') {
              setQuality('eco')
              setAttempt(1)
            } else {
              setWebgl('failed')
            }
          })
        }}
      >
        <color attach="background" args={['#05030a']} />
        <Scene eco={eco} animate={!reduced} />
        <PostFX eco={eco} />
      </Canvas>
    </div>
  )
}
