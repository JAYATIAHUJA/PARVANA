varying vec2 vUv;
uniform float uTime;
uniform int uStageA;
uniform int uStageB;
uniform float uBlend;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform float uIntensity;

// Simplex 2D noise helpers
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(in vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
             mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  vec2 shift = vec2(100.0);
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 4; ++i) {
    v += a * noise(p);
    p = rot * p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

#include "../stages/stage1_attraction/background.frag.glsl"
#include "../stages/stage2_longing/background.frag.glsl"
#include "../stages/stage3_obsession/background.frag.glsl"
#include "../stages/stage4_destruction/background.frag.glsl"
#include "../stages/stage5_surrender/background.frag.glsl"
#include "../stages/stage6_immortality/background.frag.glsl"

vec4 getStageColor(int stage, vec2 uv) {
  if (stage == 1) return stage1(uv);
  if (stage == 2) return stage2(uv);
  if (stage == 3) return stage3(uv);
  if (stage == 4) return stage4(uv);
  if (stage == 5) return stage5(uv);
  if (stage == 6) return stage6(uv);
  return vec4(0.0, 0.0, 0.0, 1.0);
}

void main() {
  vec4 colorA = getStageColor(uStageA, vUv);
  vec4 colorB = getStageColor(uStageB, vUv);
  
  vec4 finalColor = mix(colorA, colorB, uBlend);
  gl_FragColor = finalColor;
}
