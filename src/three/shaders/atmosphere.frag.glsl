// Halo externe (sphère plus grande, faces arrière, mélange additif).
uniform vec3 uLightDir;
uniform vec3 uDayColor;
uniform vec3 uNightColor;
uniform float uIntensity;
uniform float uLimb;

varying vec3 vNormalW;
varying vec3 vPosW;

void main() {
  vec3 v = normalize(cameraPosition - vPosW);
  vec3 n = normalize(vNormalW);
  vec3 l = normalize(uLightDir);
  float k = clamp(-dot(n, v), 0.0, 1.0);
  float glow = pow(clamp(k / uLimb, 0.0, 1.0), 4.0);
  float lit = smoothstep(-0.3, 0.6, dot(n, l));
  float backlit = pow(max(dot(-v, l), 0.0), 5.0);
  vec3 col = mix(uNightColor * 0.1, uDayColor, lit) * glow * uIntensity;
  col += uDayColor * backlit * glow * 1.6 * uIntensity;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
