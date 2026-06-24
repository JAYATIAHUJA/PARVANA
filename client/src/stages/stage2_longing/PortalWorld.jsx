import React from 'react';
import { Sparkles, Text } from '@react-three/drei';
import PortalMoth from '../../components/PortalMoth';

export default function PortalWorld() {
  return (
    <group>
      {/* Moon model */}
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color="#afc5ff" roughness={0.7} emissive="#5b4ca5" emissiveIntensity={0.4} />
      </mesh>
      
      {/* Silhouette Moth floating in twilight */}
      <group position={[0, -0.05, 0.05]}>
        <PortalMoth color={0x000000} scale={0.25} speedFactor={0.5} />
      </group>

      <Sparkles count={45} scale={[2.0, 2.0, 2.0]} color="#b47aff" size={1.2} speed={0.2} />
      <Text position={[0, 0.35, 0]} fontSize={0.045} color="#b47aff" anchorX="center" anchorY="middle">
        इस तरह
      </Text>
      <Text position={[0, -0.35, 0]} fontSize={0.035} color="#dcdfe3" anchorX="center" anchorY="middle">
        DROWNING IN THE TWILIGHT
      </Text>
    </group>
  );
}
