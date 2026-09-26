varying vec3 vNormalW;
varying vec3 vPosW;
varying vec3 vPosObj;
varying vec2 vUv;

void main() {
  vUv = uv;
  vPosObj = position;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vPosW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
