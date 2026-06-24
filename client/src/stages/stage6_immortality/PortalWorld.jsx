import React from 'react';
import { Sparkles, Text } from '@react-three/drei';
import PortalMoth from '../../components/PortalMoth';

export default function PortalWorld() {
  return (
    <group>
      {/* White Gold Cylinder Pillar */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.7, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} emissive="#ffd68a" emissiveIntensity={1.0} />
      </mesh>

      {/* Golden Moth resting still in the light column */}
      <group position={[0, 0, 0.08]} rotation={[0.1, Math.PI, 0]}>
        <PortalMoth scale={0.28} speedFactor={0.0} />
      </group>

      <Sparkles count={70} scale={[2.0, 2.0, 2.0]} color="#ffd68a" size={1.5} speed={0.35} />
      <Text position={[0, 0.45, 0]} fontSize={0.04} color="#ffd68a" anchorX="center" anchorY="middle">
        I BECAME THE LIGHT
      </Text>
    </group>
  );
}
