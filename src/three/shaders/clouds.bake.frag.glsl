// Carte de nuages (cuite une seule fois). Les modèles de climat de planètes
// en rotation synchrone prévoient un bouclier nuageux autour du point subsolaire.
uniform float uSeed;
varying vec2 vUv;

void main() {
  vec3 p = dirFromUv(vUv);
  float facing = dot(p, vec3(1.0, 0.0, 0.0));
  vec3 w = p * 2.2 + uSeed * 3.1;
  vec3 q = vec3(fbm(w, 4), fbm(w + vec3(3.3, 8.1, 1.7), 4), fbm(w + vec3(6.4, 2.2, 9.9), 4));
  // Tourbillons : étirement le long des parallèles.
  vec3 stretched = vec3(p.x * 1.0, p.y * 2.6, p.z * 1.0);
  float n = fbm(stretched * 3.4 + q * 1.6, 6) * 0.5 + 0.5;
  float wisps = fbm(stretched * 9.0 + q * 3.0, 4) * 0.5 + 0.5;
  float coverage = mix(0.62, 0.44, smoothstep(0.1, 0.95, facing));
  float d = smoothstep(coverage, coverage + 0.22, n) * (0.65 + 0.35 * wisps);
  d = max(d, smoothstep(0.7, 0.9, wisps) * 0.25);
  gl_FragColor = vec4(d, n, wisps, 1.0);
}
