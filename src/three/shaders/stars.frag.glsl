varying vec3 vColor;
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  float core = exp(-d * d * 7.0);
  float halo = exp(-d * 3.2) * 0.25;
  float a = (core + halo) * (1.0 - smoothstep(0.85, 1.0, d));
  gl_FragColor = vec4(vColor * a * vAlpha, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
