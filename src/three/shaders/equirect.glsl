// Direction sur la sphère correspondant aux UV de THREE.SphereGeometry
// (u autour de l'axe Y, v du pôle sud au pôle nord), pour que la texture cuite
// se plaque sans couture sur la géométrie.
vec3 dirFromUv(vec2 uv) {
  float phi = uv.x * 6.283185307179586;
  float theta = (1.0 - uv.y) * 3.141592653589793;
  return vec3(-cos(phi) * sin(theta), cos(theta), sin(phi) * sin(theta));
}
