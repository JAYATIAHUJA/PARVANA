varying vec2 vUv;

void main() {
  vUv = uv;
  // Map vertices directly to normalized device coordinates (NDC) at z = 0.0
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
