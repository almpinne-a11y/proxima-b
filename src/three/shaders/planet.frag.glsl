uniform sampler2D uTerrain;
uniform sampler2D uClouds;
uniform vec2 uTexel;
uniform vec3 uLightDir;
uniform vec3 uLightColor;
uniform float uLightIntensity;
uniform vec3 uDayRim;
uniform vec3 uNightRim;
uniform vec3 uTwilight;
uniform float uCloudShift;
uniform float uBump;
uniform float uExposure;

varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vTangentW;
varying vec3 vBitangentW;
varying vec3 vPosW;

void main() {
  vec4 terr = texture2D(uTerrain, vUv);
  float h = terr.a;
  float hx = texture2D(uTerrain, vUv + vec2(uTexel.x, 0.0)).a;
  float hy = texture2D(uTerrain, vUv + vec2(0.0, uTexel.y)).a;

  vec3 ng = normalize(vNormalW);
  vec3 n = normalize(ng - uBump * ((hx - h) * normalize(vTangentW) + (hy - h) * normalize(vBitangentW)));
  vec3 v = normalize(cameraPosition - vPosW);
  vec3 l = normalize(uLightDir);

  float ndl = dot(n, l);
  float ndlGeo = dot(ng, l);
  float terminator = smoothstep(-0.1, 0.22, ndlGeo);
  float twilight = smoothstep(-0.3, 0.0, ndlGeo) * (1.0 - smoothstep(0.0, 0.24, ndlGeo));
  float night = 1.0 - smoothstep(-0.28, 0.04, ndlGeo);

  vec2 cuv = vUv + vec2(uCloudShift, 0.0);
  vec4 cl = texture2D(uClouds, cuv);
  float clouds = cl.r;
  // Ombre portée des nuages, décalée vers l'étoile.
  float shadow = texture2D(uClouds, cuv + vec2(0.006, 0.002)).r;

  vec3 albedo = terr.rgb;
  float iceMask = smoothstep(0.42, 0.62, dot(albedo, vec3(0.333)));

  vec3 sun = uLightColor * uLightIntensity;
  vec3 color = albedo * sun * max(ndl, 0.0) * terminator * (1.0 - shadow * 0.5);
  color += albedo * uTwilight * twilight * 0.55;
  // Face nuit : presque noire. Lueur des étoiles, reflet froid à peine visible sur la glace.
  color += albedo * uNightRim * 0.0035 * night;
  color += uNightRim * iceMask * 0.005 * night;

  // Reflet spéculaire sur la glace côté jour.
  vec3 hv = normalize(l + v);
  float spec = pow(max(dot(n, hv), 0.0), 70.0) * iceMask * (1.0 - clouds) * terminator;
  color += sun * spec * 0.45;

  // Nuages éclairés, bord crépusculaire violacé.
  vec3 cloudLit = mix(vec3(1.0, 0.9, 0.84), vec3(1.0), 0.25) * sun * clamp(ndlGeo * 1.15 + 0.05, 0.0, 1.0);
  vec3 cloudCol = cloudLit + uTwilight * twilight * 0.8 + uNightRim * 0.002 * night;
  color = mix(color, cloudCol, clamp(clouds * 0.92, 0.0, 1.0));

  // Atmosphère vue au limbe : halo --glow côté jour, liseré --night côté nuit.
  float fres = pow(1.0 - max(dot(ng, v), 0.0), 3.2);
  float rim = pow(1.0 - max(dot(ng, v), 0.0), 6.0);
  color += uDayRim * fres * smoothstep(-0.15, 0.55, ndlGeo) * 1.1;
  color += uNightRim * rim * night * 0.55;

  gl_FragColor = vec4(color * uExposure, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
