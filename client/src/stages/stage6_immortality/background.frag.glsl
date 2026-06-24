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
