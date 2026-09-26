import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { shaders } from './shaders'

type BakeOptions = {
  width: number
  height: number
  seed?: number
  /** Précision flottante (altitude pour le relief) ou 8 bits (couleurs seules). */
  float?: boolean
  /** Nombre de bandes : le calcul est réparti sur plusieurs frames. */
  strips?: number
}

/**
 * Texture équirectangulaire procédurale calculée une seule fois sur le GPU,
 * bande par bande (scissor) pour ne jamais bloquer le GPU sur un seul appel de dessin :
 * le bruit fractal, coûteux, n'est donc pas recalculé à chaque pixel et à chaque frame.
 */
export class ProgressiveBake {
  readonly target: THREE.WebGLRenderTarget
  private readonly material: THREE.ShaderMaterial
  private readonly geometry = new THREE.PlaneGeometry(2, 2)
  private readonly scene = new THREE.Scene()
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  private readonly strips: number
  private next = 0

  constructor(gl: THREE.WebGLRenderer, fragmentShader: string, options: BakeOptions) {
    const { width, height, seed = 0, float = false, strips = 16 } = options
    this.strips = strips
    this.target = new THREE.WebGLRenderTarget(width, height, {
      type: float ? THREE.HalfFloatType : THREE.UnsignedByteType,
      format: THREE.RGBAFormat,
      generateMipmaps: false,
      minFilter: THREE.LinearMipmapLinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      depthBuffer: false,
      stencilBuffer: false,
    })
    this.target.texture.anisotropy = gl.capabilities.getMaxAnisotropy()
    this.material = new THREE.ShaderMaterial({
      vertexShader: shaders.bake.vertex,
      fragmentShader,
      uniforms: { uSeed: { value: seed } },
      depthTest: false,
      depthWrite: false,
    })
    const quad = new THREE.Mesh(this.geometry, this.material)
    quad.frustumCulled = false
    this.scene.add(quad)
  }

  get progress() {
    return this.next / this.strips
  }

  get done() {
    return this.next >= this.strips
  }

  /** Calcule `count` bandes. Renvoie true quand la texture est complète. */
  step(gl: THREE.WebGLRenderer, count = 1) {
    if (this.done) return true
    const { width, height } = this.target
    const band = Math.ceil(height / this.strips)
    const previousTarget = gl.getRenderTarget()
    const previousAutoClear = gl.autoClear
    gl.autoClear = false
    for (let i = 0; i < count && !this.done; i++) {
      const y = this.next * band
      const last = this.next === this.strips - 1
      // Les mipmaps ne sont générées qu'après la dernière bande.
      this.target.texture.generateMipmaps = last
      this.target.scissor.set(0, y, width, Math.min(band, height - y))
      this.target.scissorTest = true
      gl.setRenderTarget(this.target)
      gl.render(this.scene, this.camera)
      this.next += 1
    }
    this.target.scissorTest = false
    gl.setRenderTarget(previousTarget)
    gl.autoClear = previousAutoClear
    if (this.done) {
      this.geometry.dispose()
      this.material.dispose()
    }
    return this.done
  }

  dispose() {
    this.geometry.dispose()
    this.material.dispose()
    this.target.dispose()
  }
}

/** File d'attente : une seule texture est calculée à la fois. */
const queue: ProgressiveBake[] = []

/** Hook : lance une cuisson progressive et renvoie la texture + la progression. */
export function useProgressiveBake(fragmentShader: string, options: BakeOptions, stripsPerFrame = 2) {
  const gl = useThree((s) => s.gl)
  const { width, height, seed, float, strips } = options
  const bake = useMemo(
    () => new ProgressiveBake(gl, fragmentShader, { width, height, seed, float, strips }),
    [gl, fragmentShader, width, height, seed, float, strips],
  )
  const [state, setState] = useState({ bake, progress: 0 })

  useEffect(() => {
    queue.push(bake)
    return () => {
      queue.splice(queue.indexOf(bake), 1)
      bake.dispose()
    }
  }, [bake])

  // Priorité négative : s'exécute avant le rendu, sans en prendre le contrôle.
  useFrame((frame, delta) => {
    if (bake.done || queue.find((b) => !b.done) !== bake) return
    // Rythme adaptatif : une seule bande par frame si l'appareil peine.
    bake.step(frame.gl, delta > 1 / 40 ? 1 : stripsPerFrame)
    setState({ bake, progress: bake.progress })
  }, -1)

  return { texture: bake.target.texture, progress: state.bake === bake ? state.progress : 0 }
}
