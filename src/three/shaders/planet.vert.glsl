varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vTangentW;
varying vec3 vBitangentW;
varying vec3 vPosW;

void main() {
  vUv = uv;
  vec3 n = normalize(normal);
  // Repère tangent aligné sur les UV de la sphère (u = longitude, v = latitude).
  vec3 t = vec3(n.z, 0.0, -n.x);
  float tl = length(t);
  t = tl > 1e-4 ? t / tl : vec3(0.0, 0.0, 1.0);
  vec3 b = cross(n, t);
  mat3 m = mat3(modelMatrix);
  vNormalW = normalize(m * n);
  vTangentW = normalize(m * t);
  vBitangentW = normalize(m * b);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vPosW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
