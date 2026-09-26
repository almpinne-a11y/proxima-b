uniform sampler2D uSky;
uniform float uIntensity;
varying vec2 vUv;
void main() {
  vec3 col = texture2D(uSky, vUv).rgb * uIntensity;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
