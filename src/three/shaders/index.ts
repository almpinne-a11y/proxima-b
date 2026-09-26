import noise from './noise.glsl?raw'
import equirect from './equirect.glsl?raw'
import bakeVert from './bake.vert.glsl?raw'
import terrainBake from './terrain.bake.frag.glsl?raw'
import cloudsBake from './clouds.bake.frag.glsl?raw'
import skyBake from './sky.bake.frag.glsl?raw'
import planetVert from './planet.vert.glsl?raw'
import planetFrag from './planet.frag.glsl?raw'
import shellVert from './shell.vert.glsl?raw'
import atmosphereFrag from './atmosphere.frag.glsl?raw'
import starFrag from './star.frag.glsl?raw'
import coronaFrag from './corona.frag.glsl?raw'
import billboardVert from './billboard.vert.glsl?raw'
import skyFrag from './sky.frag.glsl?raw'
import starsVert from './stars.vert.glsl?raw'
import starsFrag from './stars.frag.glsl?raw'

const withNoise = (src: string) => `${noise}\n${src}`
const bake = (src: string) => `${noise}\n${equirect}\n${src}`

export const shaders = {
  bake: { vertex: bakeVert, terrain: bake(terrainBake), clouds: bake(cloudsBake), sky: bake(skyBake) },
  planet: { vertex: planetVert, fragment: planetFrag },
  atmosphere: { vertex: shellVert, fragment: atmosphereFrag },
  star: { vertex: shellVert, fragment: withNoise(starFrag) },
  corona: { vertex: billboardVert, fragment: withNoise(coronaFrag) },
  sky: { vertex: billboardVert, fragment: skyFrag },
  stars: { vertex: starsVert, fragment: starsFrag },
}
