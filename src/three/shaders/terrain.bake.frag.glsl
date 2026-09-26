// Carte de surface de Proxima b (cuite une seule fois) :
// rgb = albédo (linéaire), a = altitude normalisée.
// La planète est probablement en rotation synchrone : le point subsolaire est fixe
// sur la surface (+X en espace objet). On y place un désert rouille, et une calotte
// de glace centrée sur le point antistellaire, comme dans les modèles « eyeball ».
uniform float uSeed;
varying vec2 vUv;

void main() {
  vec3 p = dirFromUv(vUv);
  vec3 s = vec3(1.0, 0.0, 0.0);
  float facing = dot(p, s);

  vec3 w = p * 1.35 + uSeed;
  vec3 q = vec3(fbm(w, 4), fbm(w + vec3(5.2, 1.3, 2.8), 4), fbm(w + vec3(2.1, 7.7, 4.4), 4));
  float continents = fbm(p * 1.9 + q * 0.95 + uSeed * 0.37, 6);
  float ridges = ridged(p * 4.2 + q * 1.4, 5);
  float detail = fbm(p * 18.0 + q, 4);
  float h = continents * 0.8 + ridges * 0.38 * smoothstep(-0.05, 0.35, continents) + detail * 0.08;

  // Cratères doux : creux arrondis dispersés.
  float craters = smoothstep(0.62, 0.78, snoise(p * 9.0 + uSeed * 1.7)) * 0.18;
  h -= craters;

  float height01 = clamp(h * 0.9 + 0.5, 0.0, 1.0);

  vec3 basin = hex(22.0, 13.0, 16.0);
  vec3 basalt = hex(46.0, 24.0, 24.0);
  vec3 rust = hex(98.0, 40.0, 24.0);
  vec3 ochre = hex(146.0, 76.0, 44.0);
  vec3 dust = hex(186.0, 124.0, 88.0);
  vec3 pale = hex(222.0, 176.0, 140.0);

  vec3 col = basin;
  col = mix(col, basalt, smoothstep(0.18, 0.34, height01));
  col = mix(col, rust, smoothstep(0.32, 0.46, height01));
  col = mix(col, ochre, smoothstep(0.46, 0.6, height01));
  col = mix(col, dust, smoothstep(0.6, 0.74, height01));
  col = mix(col, pale, smoothstep(0.78, 0.92, height01));

  // Stries minérales et variations d'oxydation.
  float mineral = fbm(p * 6.0 + q * 2.0 + 11.0, 4);
  col *= 0.82 + 0.36 * smoothstep(-0.4, 0.5, mineral);
  col = mix(col, col * vec3(1.08, 0.86, 0.8), smoothstep(0.2, 0.6, fbm(p * 3.0 - q, 3)));

  // Glace : hémisphère nuit, bords déchiquetés.
  float iceEdge = -facing + fbm(p * 3.2 + q * 1.3, 5) * 0.42;
  float ice = smoothstep(0.5, 0.66, iceEdge);
  float cracks = ridged(p * 11.0 + q * 2.0, 3);
  vec3 iceCol = mix(hex(170.0, 186.0, 206.0), hex(236.0, 240.0, 246.0), smoothstep(0.1, 0.5, cracks));
  col = mix(col, iceCol, ice);
  height01 = mix(height01, 0.55 + cracks * 0.12, ice * 0.7);

  gl_FragColor = vec4(col, height01);
}
