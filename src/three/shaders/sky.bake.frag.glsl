// Fond de ciel très discret : bande galactique, poussières et nébulosités.
uniform float uSeed;
varying vec2 vUv;

void main() {
  vec3 d = dirFromUv(vUv);
  vec3 galNormal = normalize(vec3(0.35, 0.82, -0.45));
  float lat = dot(d, galNormal);
  float band = exp(-lat * lat * 9.0);
  float core = exp(-pow(length(d - normalize(vec3(-0.7, 0.15, -0.7))), 2.0) * 2.2);
  vec3 q = vec3(fbm(d * 2.0 + uSeed, 4), fbm(d * 2.0 + 7.3, 4), fbm(d * 2.0 + 13.1, 4));
  float clouds = fbm(d * 3.5 + q * 1.2, 6) * 0.5 + 0.5;
  float dust = smoothstep(0.35, 0.75, ridged(d * 5.0 + q * 2.0, 5));
  float neb = smoothstep(0.55, 0.95, fbm(d * 1.4 + q * 2.5 + 3.0, 5) * 0.5 + 0.5);

  vec3 violet = hex(38.0, 16.0, 58.0);
  vec3 rose = hex(70.0, 22.0, 34.0);
  vec3 warm = hex(120.0, 70.0, 60.0);
  vec3 col = vec3(0.0);
  col += mix(violet, rose, clouds) * band * clouds * 0.9;
  col += warm * band * core * clouds * 0.55;
  col *= 1.0 - dust * band * 0.75;
  col += mix(violet, rose, q.x * 0.5 + 0.5) * neb * 0.22;
  col += hex(9.0, 6.0, 16.0);
  gl_FragColor = vec4(col, 1.0);
}
