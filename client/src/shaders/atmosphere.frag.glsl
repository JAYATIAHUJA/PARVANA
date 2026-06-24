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

// Stage 1: Amber caustic light field
vec4 stage1(vec2 uv) {
  vec2 p = uv - 0.5;
  
  // Caustic ripple formula
  float t = uTime * 0.8;
  float bassPulse = uBass * 0.15;
  float r = length(p) * (2.0 - bassPulse);
  
  float w1 = sin(p.x * 6.0 + t) * 0.5 + 0.5;
  float w2 = cos(p.y * 6.0 - t * 1.2) * 0.5 + 0.5;
  
  // Safe positive caustics mapping to avoid undefined pow() behaviors
  float rawCaustics = fbm(p * 4.0 + vec2(w1, w2) * 1.5) * (1.0 - r);
  float caustics = max(0.0, rawCaustics);
  
  vec3 bg = vec3(0.16, 0.08, 0.05);   // Warmer, richer walnut brown
  vec3 mid = vec3(0.79, 0.44, 0.20);  // Deep glowing copper
  vec3 light = vec3(0.98, 0.85, 0.60); // Vibrant warm gold
  
  float strength = pow(caustics, 1.5);
  vec3 col = mix(bg, mid, strength);
  col += light * strength * 1.5 * uIntensity;
  
  return vec4(col, 1.0);
}

// Stage 2: Violet fog planes (drifting depth)
vec4 stage2(vec2 uv) {
  vec2 p = uv;
  float t = uTime * 0.15;
  
  // Drifting layers of noise
  float n1 = fbm(p * 2.5 + vec2(t, -t * 0.3));
  float n2 = fbm(p * 5.0 + vec2(-t * 0.5, t * 0.4));
  float fog = mix(n1, n2, 0.5);
  
  vec3 bg = vec3(0.08, 0.06, 0.14);        // Deep atmospheric purple-indigo
  vec3 mid = vec3(0.35, 0.20, 0.55);       // Rich glowing violet
  vec3 highlight = vec3(0.68, 0.45, 0.88);  // Lavender highlight
  
  float strength = pow(fog, 1.8);
  vec3 col = mix(bg, mid, strength);
  col += highlight * strength * 0.85;
  
  // Vignette
  col *= 1.0 - length(uv - 0.5) * 1.0;
  
  return vec4(max(vec3(0.0), col), 1.0);
}

// Stage 3: Red fluid distortion (domain warping) + Dark Electricity Blinks
vec4 stage3(vec2 uv) {
  vec2 p = (uv - 0.5) * 2.0;
  float t = uTime * 0.5;
  float bassScale = 1.0 + uBass * 0.3;
  
  // Domain warp
  vec2 q = vec2(
    fbm(p + vec2(0.0, 0.0) + vec2(sin(t), cos(t)) * 0.4),
    fbm(p + vec2(5.2, 1.3) + vec2(cos(t * 0.8), sin(t * 1.1)) * 0.4)
  );
  
  vec2 r = vec2(
    fbm(p + 4.0 * q + vec2(1.7, 9.2) + t * 0.25),
    fbm(p + 4.0 * q + vec2(8.3, 2.8) + t * 0.15)
  );
  
  float f = fbm(p + 4.0 * r) * bassScale;
  
  vec3 bg = vec3(0.03, 0.005, 0.005); // Near black-red
  vec3 mid = vec3(0.45, 0.05, 0.05); // Blood red
  vec3 highlight = vec3(0.85, 0.1, 0.1); // Crimson
  
  vec3 col = mix(bg, mid, f);
  col = mix(col, highlight, dot(q, q) * 0.5);
  
  // ── Dark Electricity Blinks ──
  // High-frequency random flashing trigger modulated by audio bands
  float audioTrigger = uHigh * 0.45 + uBass * 0.45;
  float flashTime = uTime * 22.0;
  float threshold = 0.88 - audioTrigger * 0.15;
  float flash = step(threshold, sin(flashTime) * cos(flashTime * 1.37) * sin(flashTime * 2.1));
  
  if (flash > 0.4) {
    // desaturate/darken fluid to create high-voltage shock base
    col = mix(col, vec3(0.02, 0.0, 0.05), 0.75);
    
    // Branch 1: Vertical jagged lightning
    float sway1 = fbm(vec2(uv.y * 8.0, uTime * 15.0)) - 0.5;
    float path1 = abs(uv.x - 0.5 - sway1 * 0.5);
    
    // Branch 2: Horizontal jagged lightning
    float sway2 = fbm(vec2(uv.x * 8.0, uTime * 18.0 + 10.0)) - 0.5;
    float path2 = abs(uv.y - 0.5 - sway2 * 0.5);
    
    // Branch 3: Diagonal jagged lightning
    float sway3 = fbm(vec2((uv.x + uv.y) * 6.0, uTime * 20.0 - 5.0)) - 0.5;
    float path3 = abs((uv.x - uv.y) - sway3 * 0.4);
    
    // Combine lightning fields
    float boltGlow = exp(-path1 * 25.0) + exp(-path2 * 25.0) + exp(-path3 * 25.0);
    float boltCore = exp(-path1 * 140.0) + exp(-path2 * 140.0) + exp(-path3 * 140.0);
    
    vec3 glowColor = vec3(0.42, 0.05, 0.9); // Toxic magenta-violet
    vec3 coreColor = vec3(0.0);             // Pitch black core
    
    col = mix(col, glowColor, min(1.0, boltGlow * 0.8));
    col = mix(col, coreColor, min(1.0, boltCore * 0.98));
    
    // Strobe desaturation blinking
    float strobeFactor = 0.15 + 0.45 * abs(sin(uTime * 85.0));
    col *= strobeFactor;
  }
  
  return vec4(col, 1.0);
}

// Stage 4: Dark heat shimmer + Viewport Borders on Fire
vec4 stage4(vec2 uv) {
  vec2 p = uv;
  float t = uTime * 2.5;
  
  // Center heat wave distortion
  float yDistortion = sin(p.y * 10.0 - t) * 0.015 * (1.0 - p.y);
  float xDistortion = cos(p.x * 12.0 + t * 0.8) * 0.012 * (1.0 - p.y);
  
  float r = length(uv - vec2(0.5 + xDistortion, 0.3 + yDistortion));
  float shimmer = exp(-r * 3.5) * fbm(uv * 10.0 + vec2(0.0, -t * 0.4));
  
  vec3 bg = vec3(0.015, 0.006, 0.002); // Pure charcoal amber
  vec3 core = vec3(0.8, 0.3, 0.0); // Rust amber
  
  vec3 col = mix(bg, core, shimmer * 1.0 * uIntensity);
  
  // ── Viewport Borders on Fire! ──
  float edgeX = min(uv.x, 1.0 - uv.x);
  float edgeY = min(uv.y, 1.0 - uv.y);
  float edge = min(edgeX, edgeY);
  
  // Multi-layered noise for detailed, violent border flames
  float n1 = fbm(uv * 4.5 - vec2(0.0, uTime * 2.2));
  float n2 = fbm(uv * 9.0 - vec2(uTime * 1.0, uTime * 3.8));
  float flameNoise = mix(n1, n2, 0.4);
  
  // Lick further inwards (0.22 width)
  float borderDist = edge - flameNoise * 0.22;
  
  // Border fire colors
  float borderGlow = smoothstep(0.25, 0.0, borderDist);
  float borderBody = smoothstep(0.15, 0.0, borderDist);
  float borderCore = smoothstep(0.06, 0.0, borderDist);
  
  vec3 fireGlowColor = vec3(0.95, 0.22, 0.02); // Deep Crimson-Orange
  vec3 fireBodyColor = vec3(0.98, 0.55, 0.08); // Hot Golden Orange
  vec3 fireCoreColor = vec3(1.0, 0.95, 0.5);   // Bright White-Yellow
  
  col += fireGlowColor * borderGlow * 1.2 * uIntensity;
  col += fireBodyColor * borderBody * 1.6 * uIntensity;
  col += fireCoreColor * borderCore * 2.0 * uIntensity;
  
  return vec4(col, 1.0);
}

// Stage 5: Cold moonlight shaft
vec4 stage5(vec2 uv) {
  vec2 p = uv - 0.5;
  
  // Vertical light shaft swaying slowly
  float sway = sin(uTime * 0.3) * 0.08 * (1.0 - uv.y);
  float d = abs(p.x - sway);
  
  float beam = exp(-d * 7.5) * (0.15 + 0.85 * uv.y);
  beam += fbm(uv * 5.0 + vec2(0.0, -uTime * 0.2)) * 0.15 * beam;
  
  vec3 bg = vec3(0.02, 0.03, 0.05); // Cold blue-grey
  vec3 lightColor = vec3(0.68, 0.77, 0.95); // Silver blue
  
  vec3 col = mix(bg, lightColor, beam * 0.75);
  return vec4(col, 1.0);
}

// Stage 6: White-gold column
vec4 stage6(vec2 uv) {
  vec2 p = uv - 0.5;
  
  float d = abs(p.x);
  float beam = pow(1.0 - clamp(d * 2.0, 0.0, 1.0), 16.0) * (0.3 + 0.7 * uv.y);
  
  // Add volumetric noise
  beam += fbm(uv * 12.0 + vec2(0.0, -uTime * 0.1)) * 0.06 * beam;
  
  vec3 bg = vec3(0.0); // Pure dark void
  vec3 lightColor = vec3(1.0, 0.98, 0.92); // White gold
  
  vec3 col = mix(bg, lightColor, beam * 0.8);
  return vec4(col, 1.0);
}

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
