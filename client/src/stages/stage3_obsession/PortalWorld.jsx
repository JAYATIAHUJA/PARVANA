import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Text } from '@react-three/drei';

function ObsessionTorus({ audioBandsRef }) {
  const torusRef = useRef();

  useFrame(() => {
    if (torusRef.current) {
      const bass = audioBandsRef?.current?.bass || 0.0;
      const high = audioBandsRef?.current?.high || 0.0;
      
      torusRef.current.rotation.x += 0.025 + high * 0.18;
      torusRef.current.rotation.y += 0.03 + bass * 0.12;

      const scale = 1.0 + bass * 0.4;
      torusRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh ref={torusRef}>
      <torusKnotGeometry args={[0.24, 0.07, 120, 16]} />
      <meshBasicMaterial color="#8e1b1b" wireframe />
    </mesh>
  );
}

export default function PortalWorld({ audioBandsRef }) {
  return (
    <group>
      {/* Audio-reactive Torus Knot */}
      <ObsessionTorus audioBandsRef={audioBandsRef} />
      <Sparkles count={75} scale={[2.0, 2.0, 2.0]} color="#8e1b1b" size={1.4} speed={2.0} />
      <Text position={[0, 0.45, 0]} fontSize={0.045} color="#8e1b1b" anchorX="center" anchorY="middle">
        तू क्यों ना मुझे देखती?
      </Text>
    </group>
  );
}
