// Couronne en billboard : halo radial et filaments lents.
uniform float uTime;
uniform float uIntensity;
uniform float uFlare;
uniform vec3 uColor;
uniform vec3 uHot;
varying vec2 vUv;

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  float r = length(uv);
  float a = atan(uv.y, uv.x);
  float rays = snoise(vec3(cos(a) * 2.2, sin(a) * 2.2, r * 1.5 - uTime * 0.06)) * 0.5 + 0.5;
  rays = mix(0.75, 1.25, rays);
  float halo = exp(-r * 5.5) * 1.1 + exp(-r * 16.0) * 1.8;
  float fade = 1.0 - smoothstep(0.6, 1.0, r);
  vec3 col = mix(uColor, uHot, exp(-r * 9.0)) * halo * rays * fade * (uIntensity + uFlare * 2.5);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
