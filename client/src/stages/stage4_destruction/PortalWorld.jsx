import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Text } from '@react-three/drei';
import PortalMoth from '../../components/PortalMoth';
import flameVertShader from '../../shaders/flame.vert.glsl';
import flameFragShader from '../../shaders/flame.frag.glsl';

function PortalFlameMesh({ isFlameOn, flameIntensity }) {
  const materialRef = useRef();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh position={[0, -0.15, 0]}>
      <planeGeometry args={[0.6, 1.2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={flameVertShader}
        fragmentShader={flameFragShader}
        transparent={true}
        depthWrite={false}
        uniforms={{
          uTime: { value: 0 },
          uIntensity: { value: flameIntensity * 1.5 }
        }}
      />
    </mesh>
  );
}

export default function PortalWorld({ isFlameOn, flameIntensity }) {
  return (
    <group>
      {/* Volumetric Flame */}
      <PortalFlameMesh isFlameOn={isFlameOn} flameIntensity={flameIntensity} />
      
      {/* Wireframe Moth burning in the flame */}
      <group position={[0.2, 0.1, 0.05]} rotation={[0.4, 0.5, 0.3]}>
        <PortalMoth wireframe scale={0.2} speedFactor={1.5} />
      </group>

      <Sparkles count={55} scale={[1.8, 2.2, 1.8]} color="#ff7f24" size={1.2} speed={1.5} />
      <Text position={[0, -0.5, 0]} fontSize={0.045} color="#ff6b00" anchorX="center" anchorY="middle">
        I ACCEPT THE FIRE
      </Text>
    </group>
  );
}
