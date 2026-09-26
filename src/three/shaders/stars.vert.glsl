attribute float aSize;
attribute vec3 aColor;
attribute float aPhase;
uniform float uTime;
uniform float uPixelRatio;
uniform float uTwinkle;
varying vec3 vColor;
varying float vAlpha;

void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float tw = 0.5 + 0.5 * sin(uTime * (0.4 + aPhase * 1.6) + aPhase * 40.0);
  vAlpha = 1.0 - uTwinkle * 0.55 * tw;
  vColor = aColor;
  gl_PointSize = aSize * uPixelRatio;
}
