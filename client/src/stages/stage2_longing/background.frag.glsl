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
