import React from 'react';
import { Sparkles, Text } from '@react-three/drei';

export default function PortalWorld() {
  return (
    <group>
      {/* Moon Sphere */}
      <mesh>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial color="#afc5ff" roughness={0.8} emissive="#2d3855" emissiveIntensity={0.6} />
      </mesh>
      <Sparkles count={40} scale={[2.2, 2.2, 2.2]} color="#afc5ff" size={1.0} speed={0.15} />
      <Text position={[0, 0.35, 0]} fontSize={0.045} color="#afc5ff" anchorX="center" anchorY="middle">
        चांद
      </Text>
      <Text position={[0, -0.35, 0]} fontSize={0.035} color="#e6edff" anchorX="center" anchorY="middle">
        I LET GO AND FOUND PEACE
      </Text>
    </group>
  );
}
