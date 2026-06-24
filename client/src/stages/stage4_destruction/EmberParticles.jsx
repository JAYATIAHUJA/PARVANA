import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function EmberParticles({ count = 30 }) {
  const pointsRef = useRef();
  
  const [positions, speeds, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const phs = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 5.0; // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4.0; // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.5; // z
      spd[i] = 0.3 + Math.random() * 0.4;
      phs[i] = Math.random() * Math.PI * 2.0;
    }
    return [pos, spd, phs];
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      let y = posAttr.getY(i);
      y += speeds[i] * delta * 1.8;
      
      // Loop back to bottom
      if (y > 2.5) {
        y = -2.5;
        posAttr.setX(i, (Math.random() - 0.5) * 5.0);
      }
      
      posAttr.setY(i, y);
      
      let x = posAttr.getX(i);
      x += Math.sin(time + phases[i]) * 0.004;
      posAttr.setX(i, x);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ff7f24"
        size={0.055}
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
