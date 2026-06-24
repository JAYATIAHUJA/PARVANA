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
