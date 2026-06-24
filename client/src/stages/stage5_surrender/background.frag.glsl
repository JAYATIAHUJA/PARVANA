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
