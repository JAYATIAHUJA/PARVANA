import React from 'react';
import { Sparkles, Text } from '@react-three/drei';

export default function PortalWorld() {
  return (
    <group>
      {/* Golden Sun sphere */}
      <mesh>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshBasicMaterial color="#f4d19b" />
      </mesh>
      <Sparkles count={60} scale={[2.0, 2.0, 2.0]} color="#f4d19b" size={1.8} speed={0.4} />
      <Text position={[0, 0.35, 0]} fontSize={0.045} color="#f4d19b" anchorX="center" anchorY="middle">
        बंदा काम का
      </Text>
      <Text position={[0, -0.35, 0]} fontSize={0.035} color="#ebdcc5" anchorX="center" anchorY="middle">
        RAHA NA MAIN BANDA KAAM KA
      </Text>
    </group>
  );
}
