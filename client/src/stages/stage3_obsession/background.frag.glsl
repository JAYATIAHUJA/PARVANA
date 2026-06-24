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
