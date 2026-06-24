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
