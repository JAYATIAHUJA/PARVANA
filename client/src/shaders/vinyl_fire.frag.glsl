varying vec2 vUv;
uniform float uTime;
uniform float uIntensity;
uniform float uBass;
uniform float uMid;

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

void main() {
  // Center coordinates: uv is in [0,1]
  vec2 uv = vUv - 0.5;
  
  // Polar coordinates
  float r = length(uv) * 2.0; // r = 1.0 at edge of square
  float theta = atan(uv.y, uv.x);
  
  // We want the fire to lick outwards starting from the vinyl disc radius.
  // The vinyl disc has radius ~0.85 in our canvas space.
  // We'll modulate the radius with FBM noise depending on theta and time.
  float t = uTime * 3.2;
  float bassScale = 1.0 + uBass * 0.65;
  
  // Layered noise for flame details
  float n1 = fbm(vec2(theta * 3.5, r * 1.5 - t * 1.6));
  float n2 = fbm(vec2(theta * 7.0 + 3.1, r * 3.0 - t * 3.2));
  float flameNoise = mix(n1, n2, 0.45) * bassScale;
  
  // Inner radius where flame starts: slightly inside the vinyl edge (e.g. 0.81)
  float innerR = 0.81;
  
  // Deform the radial distance
  float d = r - (innerR + flameNoise * 0.26 * uIntensity);
  
  // If we are too far inside (under the vinyl), fade the color
  float innerFade = smoothstep(0.70, innerR, r);
  
  // Flame density gradients
  float glow = smoothstep(0.28, -0.05, d);
  float body = smoothstep(0.14, -0.02, d);
  float core = smoothstep(0.04, -0.01, d);
  
  vec3 fireGlow = vec3(0.95, 0.18, 0.01); // Deep Crimson
  vec3 fireBody = vec3(0.98, 0.50, 0.05); // Hot Orange
  vec3 fireCore = vec3(1.0, 0.92, 0.45);  // Yellow-White
  
  vec3 col = vec3(0.0);
  col += fireGlow * glow * 1.1;
  col += fireBody * body * 1.4;
  col += fireCore * core * 1.8;
  
  // Scale color and apply inner fade so it doesn't render in the center
  col *= uIntensity * innerFade;
  
  // Alpha channels
  float alpha = glow * innerFade * uIntensity;
  
  gl_FragColor = vec4(col * alpha, alpha);
}
