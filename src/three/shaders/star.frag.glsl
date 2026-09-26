// Photosphère d'une naine rouge : granulation convective animée, assombrissement centre-bord.
uniform float uTime;
uniform float uIntensity;
uniform float uFlare;

varying vec3 vNormalW;
varying vec3 vPosW;
varying vec3 vPosObj;

vec3 heatRamp(float t) {
  vec3 c0 = hex(90.0, 8.0, 4.0);
  vec3 c1 = hex(255.0, 77.0, 46.0);
  vec3 c2 = hex(255.0, 138.0, 61.0);
  vec3 c3 = hex(255.0, 179.0, 138.0);
  vec3 c4 = hex(255.0, 236.0, 214.0);
  vec3 c = mix(c0, c1, smoothstep(0.0, 0.35, t));
  c = mix(c, c2, smoothstep(0.35, 0.6, t));
  c = mix(c, c3, smoothstep(0.6, 0.82, t));
  c = mix(c, c4, smoothstep(0.82, 1.0, t));
  return c;
}

void main() {
  vec3 p = normalize(vPosObj);
  float t = uTime;
  vec3 q = vec3(fbm(p * 2.4 + vec3(0.0, t * 0.02, 0.0), 3), fbm(p * 2.4 + vec3(5.1, -t * 0.015, 2.3), 3), 0.0);
  float large = fbm(p * 3.0 + q * 1.5 + vec3(t * 0.03), 5) * 0.5 + 0.5;
  float cells = 1.0 - abs(snoise(p * 16.0 + q * 2.0 + vec3(0.0, t * 0.08, t * 0.05)));
  float spots = smoothstep(0.62, 0.8, fbm(p * 1.6 + 3.3 + vec3(t * 0.004), 4) * 0.5 + 0.5);
  float heat = large * 0.65 + cells * 0.4 - spots * 0.45 + uFlare * 0.35;

  vec3 v = normalize(cameraPosition - vPosW);
  float mu = max(dot(normalize(vNormalW), v), 0.0);
  float limb = pow(mu, 0.55);
  vec3 col = heatRamp(clamp(heat * limb + 0.08, 0.0, 1.0)) * (0.35 + 0.65 * limb);
  gl_FragColor = vec4(col * uIntensity, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
