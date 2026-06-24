import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import vertShader from '../shaders/vinyl_fire.vert.glsl';
import fragShader from '../shaders/vinyl_fire.frag.glsl';
import gsap from 'gsap';

function VinylFireMesh({ isFlameOn, flameIntensity, audioBandsRef, currentTrackId }) {
  const materialRef = useRef();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      
      const bass = audioBandsRef?.current?.bass || 0.0;
      const mid = audioBandsRef?.current?.mid || 0.0;
      
      materialRef.current.uniforms.uBass.value = bass;
      materialRef.current.uniforms.uMid.value = mid;

      // Only burn when we are on Stage 4 and the flame is turned on
      const isStage4 = currentTrackId === '4';
      const targetIntensity = (isFlameOn && isStage4) ? flameIntensity : 0.0;
      
      // Interpolate the intensity uniform for a smooth fade-in and fade-out
      materialRef.current.uniforms.uIntensity.value = gsap.utils.interpolate(
        materialRef.current.uniforms.uIntensity.value,
        targetIntensity,
        0.08
      );
    }
  });

  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertShader}
        fragmentShader={fragShader}
        transparent={true}
        depthWrite={false}
        depthTest={false}
        uniforms={{
          uTime: { value: 0 },
          uIntensity: { value: 0.0 },
          uBass: { value: 0.0 },
          uMid: { value: 0.0 }
        }}
      />
    </mesh>
  );
}

export default function VinylFire({ isFlameOn, flameIntensity, audioBandsRef, currentTrackId }) {
  return (
    <div 
      className="absolute pointer-events-none" 
      style={{ 
        width: '580px', 
        height: '580px', 
        zIndex: 5, // Sits in front of platter chassis but behind the rotating record
        top: '-30px', 
        left: '-30px',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 1.0], fov: 90 }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <VinylFireMesh 
          isFlameOn={isFlameOn} 
          flameIntensity={flameIntensity} 
          audioBandsRef={audioBandsRef} 
          currentTrackId={currentTrackId}
        />
      </Canvas>
    </div>
  );
}
