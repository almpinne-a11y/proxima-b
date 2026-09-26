import * as THREE from 'three'

export type SceneLayout = {
  planet: THREE.Vector3
  planetRadius: number
  star: THREE.Vector3
  starRadius: number
  /** Poses caméra le long du récit : [position, cible] pour s = 0, 1, 2, … */
  keyframes: Array<[THREE.Vector3, THREE.Vector3]>
}

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

// s = 0 : hero · 1 : approche · 2 : entrée « Distance » · 3 : fin du compteur · 4 : suite
const desktop: SceneLayout = {
  planet: v(2.05, -0.3, 0),
  planetRadius: 1.72,
  star: v(-6.6, 3.4, -5.5),
  starRadius: 0.42,
  keyframes: [
    [v(0, 0.1, 10), v(0.45, 0, 0)],
    [v(1.15, -0.05, 6.3), v(1.7, -0.25, 0)],
    [v(0.4, 0.7, 16.5), v(-1.1, 0.7, -2)],
    [v(-1.2, 1.5, 31), v(-2.4, 1.3, -3.5)],
    [v(0.7, 0.25, 11.5), v(1.1, -0.2, 0)],
  ],
}

const mobile: SceneLayout = {
  planet: v(0.35, -1.55, 0),
  planetRadius: 1.22,
  star: v(-2.3, 4.6, -5.5),
  starRadius: 0.36,
  keyframes: [
    [v(0, 0, 11.5), v(0.1, -0.35, 0)],
    [v(0.35, -0.95, 7.6), v(0.35, -1.45, 0)],
    [v(0, 0.6, 19), v(-0.6, 0.9, -2)],
    [v(-0.8, 1.4, 33), v(-1.1, 1.8, -3.5)],
    [v(0.1, -0.1, 12.5), v(0.25, -0.9, 0)],
  ],
}

export const layoutFor = (aspect: number): SceneLayout => (aspect < 0.9 ? mobile : desktop)

export const smooth = (t: number) => t * t * (3 - 2 * t)
