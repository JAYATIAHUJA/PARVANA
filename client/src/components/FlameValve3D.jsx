import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import vertShader from '../shaders/flame.vert.glsl';
import fragShader from '../shaders/flame.frag.glsl';
import gsap from 'gsap';

function FlameMesh({ isFlameOn, flameIntensity }) {
  const materialRef = useRef();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      
      // Smoothly animate intensity uniform
      const targetIntensity = isFlameOn ? flameIntensity : 0.0;
      materialRef.current.uniforms.uIntensity.value = gsap.utils.interpolate(
        materialRef.current.uniforms.uIntensity.value,
        targetIntensity,
        0.15
      );
    }
  });

  return (
    <mesh position={[0, -0.15, 0]}>
      <planeGeometry args={[1.2, 2.0]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertShader}
        fragmentShader={fragShader}
        transparent={true}
        depthWrite={false}
        uniforms={{
          uTime: { value: 0 },
          uIntensity: { value: 0 }
        }}
      />
    </mesh>
  );
}

function FlameLight({ isFlameOn, flameIntensity, audioBandsRef }) {
  const lightRef = useRef();

  useFrame(() => {
    if (lightRef.current) {
      const mid = audioBandsRef?.current?.mid || 0.0;
      const baseIntensity = isFlameOn ? flameIntensity * 2.0 : 0.0;
      // Add vocal/mid band bump to local light intensity
      lightRef.current.intensity = baseIntensity + mid * 1.5;
    }
  });

  return (
    <pointLight 
      ref={lightRef}
      position={[0, 0.5, 0.5]} 
      color="#ffa555" 
      distance={5}
      decay={1.5}
    />
  );
}

export default function FlameValve3D({ isFlameOn, flameIntensity, audioBandsRef }) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
      <Canvas
        camera={{ position: [0, 0, 1.5], fov: 60 }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.3} />
        
        <FlameLight isFlameOn={isFlameOn} flameIntensity={flameIntensity} audioBandsRef={audioBandsRef} />
        
        <FlameMesh isFlameOn={isFlameOn} flameIntensity={flameIntensity} />
      </Canvas>
    </div>
  );
}
