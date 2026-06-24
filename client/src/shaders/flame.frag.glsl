varying vec2 vUv;
uniform float uTime;
uniform float uIntensity;

// Simple 2D Noise
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
  vec2 uv = vUv;
  
  // Center x coordinate around 0
  float x = uv.x - 0.5;
  
  // Animate noise going upwards
  vec2 noiseUv = vec2(x * 3.0, uv.y * 2.0 - uTime * 3.5);
  float n = fbm(noiseUv);
  
  // Distort x position based on noise and height (more distortion towards the top)
  float distortion = (n - 0.5) * 0.22 * smoothstep(0.0, 0.8, uv.y);
  float distortedX = x + distortion;
  
  // Create tapering flame shape profile
  // Flame is wider at bottom, tapered at top
  float baseWidth = 0.12 + 0.18 * (1.0 - uv.y);
  float dist = abs(distortedX) / baseWidth;
  
  // Smoothly fade at bottom and top
  float verticalFade = smoothstep(0.0, 0.15, uv.y) * smoothstep(1.0, 0.4, uv.y);
  
  // Evaluate flame density field
  float flameField = 1.0 - smoothstep(0.0, 0.85, dist);
  
  // Apply vertical fade and scale by intensity
  flameField *= verticalFade * uIntensity;
  
  // Map density field to colors
  vec3 coreColor = vec3(1.0, 0.9, 0.65);     // Hot white-yellow core
  vec3 midColor = vec3(0.95, 0.42, 0.15);    // Warm amber-orange
  vec3 edgeColor = vec3(0.7, 0.12, 0.05);    // Cool red edges
  
  vec3 finalColor = vec3(0.0);
  if (flameField > 0.6) {
    float t = (flameField - 0.6) / 0.4;
    finalColor = mix(midColor, coreColor, t);
  } else if (flameField > 0.15) {
    float t = (flameField - 0.15) / 0.45;
    finalColor = mix(edgeColor, midColor, t);
  } else {
    float t = flameField / 0.15;
    finalColor = mix(vec3(0.0), edgeColor, t);
  }
  
  // Add subtle glow
  float alpha = smoothstep(0.02, 0.18, flameField);
  
  gl_FragColor = vec4(finalColor, alpha);
}
