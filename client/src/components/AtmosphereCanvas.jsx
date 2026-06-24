import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sparkles, useGLTF, useAnimations, MeshPortalMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, DepthOfField, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';
import vertShader from '../shaders/atmosphere.vert.glsl';
import fragShader from '../shaders/atmosphere.frag.glsl';
import mothModelUrl from '../assets/models/giant_peacock_moth.glb';

// Modular Stage Imports
import EmberParticles from '../stages/stage4_destruction/EmberParticles';
import Stage1World from '../stages/stage1_attraction/PortalWorld';
import Stage2World from '../stages/stage2_longing/PortalWorld';
import Stage3World from '../stages/stage3_obsession/PortalWorld';
import Stage4World from '../stages/stage4_destruction/PortalWorld';
import Stage5World from '../stages/stage5_surrender/PortalWorld';
import Stage6World from '../stages/stage6_immortality/PortalWorld';

function ShaderBackground({ currentTrackId, isFlameOn, flameIntensity, audioBandsRef, setStageA, stageA, stageB, setStageB }) {
  const materialRef = useRef();
  const blendValRef = useRef({ val: 0.0 });
  const { width, height } = useThree((state) => state.viewport);

  // Sync stage uniforms and transition with GSAP
  useEffect(() => {
    const nextStage = parseInt(currentTrackId);
    if (nextStage === stageA) return;

    // Set B to next stage
    setStageB(nextStage);
    blendValRef.current.val = 0.0;

    if (materialRef.current) {
      materialRef.current.uniforms.uStageB.value = nextStage;
      materialRef.current.uniforms.uBlend.value = 0.0;
    }

    gsap.killTweensOf(blendValRef.current);
    gsap.to(blendValRef.current, {
      val: 1.0,
      duration: 3.0,
      ease: 'power2.out',
      onUpdate: () => {
        if (materialRef.current) {
          materialRef.current.uniforms.uBlend.value = blendValRef.current.val;
        }
      },
      onComplete: () => {
        setStageA(nextStage);
        blendValRef.current.val = 0.0;
        if (materialRef.current) {
          materialRef.current.uniforms.uStageA.value = nextStage;
          materialRef.current.uniforms.uBlend.value = 0.0;
        }
      }
    });
  }, [currentTrackId]);

  // Keep uniforms updated per frame
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      
      const b = audioBandsRef?.current?.bass || 0.0;
      const m = audioBandsRef?.current?.mid || 0.0;
      const h = audioBandsRef?.current?.high || 0.0;

      materialRef.current.uniforms.uBass.value = b;
      materialRef.current.uniforms.uMid.value = m;
      materialRef.current.uniforms.uHigh.value = h;
      materialRef.current.uniforms.uIntensity.value = isFlameOn ? flameIntensity : 0.0;
    }
  });

  return (
    <mesh position={[0, 0, 0]} renderOrder={-100} frustumCulled={false}>
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
          uStageA: { value: stageA },
          uStageB: { value: stageB },
          uBlend: { value: 0.0 },
          uBass: { value: 0.0 },
          uMid: { value: 0.0 },
          uHigh: { value: 0.0 },
          uIntensity: { value: 1.4 }
        }}
      />
    </mesh>
  );
}

// EmberParticles is now imported from stages/stage4_destruction/EmberParticles.jsx

// Stage-specific particle system switch
function AtmosphereParticles({ stage, audioBandsRef, currentTime, duration }) {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      const high = audioBandsRef?.current?.high || 0.0;
      const bass = audioBandsRef?.current?.bass || 0.0;
      // Add subtle rotation based on high frequencies
      groupRef.current.rotation.y += 0.001 + high * 0.015;
      groupRef.current.rotation.z += 0.0005;
      
      // Pulse scale slightly on bass beats
      const s = 1.0 + bass * 0.05;
      groupRef.current.scale.set(s, s, s);
    }
  });

  // Stage 5 fading sparkles calculation
  const stage5Count = useMemo(() => {
    const ratio = duration > 0 ? currentTime / duration : 0;
    return Math.max(0, Math.floor(60 * (1.0 - ratio)));
  }, [currentTime, duration]);

  return (
    <group ref={groupRef}>
      {stage === 1 && <Sparkles count={120} scale={[8, 8, 1]} size={1.2} speed={0.18} color="#f4d19b" opacity={0.6} />}
      {stage === 2 && <Sparkles count={40} scale={[10, 10, 1]} size={0.8} speed={0.06} color="#b47aff" opacity={0.4} />}
      {stage === 3 && <Sparkles count={80} scale={[6, 6, 1]} size={1.0} speed={1.1} color="#8e1b1b" opacity={0.7} />}
      {stage === 4 && <EmberParticles count={30} />}
      {stage === 5 && stage5Count > 0 && <Sparkles count={stage5Count} scale={[8, 8, 1]} size={0.7} speed={0.1} color="#afc5ff" opacity={0.5} />}
    </group>
  );
}

// FlamePointLight inside background scene for realistic shadows
function FlameLight({ isFlameOn, flameIntensity, audioBandsRef }) {
  const lightRef = useRef();

  useFrame(() => {
    if (lightRef.current) {
      const mid = audioBandsRef?.current?.mid || 0.0;
      const baseIntensity = isFlameOn ? flameIntensity * 2.5 : 0.0;
      lightRef.current.intensity = baseIntensity + mid * 1.5;
    }
  });

  return (
    <pointLight
      ref={lightRef}
      position={[2.5, 0.5, 0.8]}
      color="#ffa555"
      castShadow
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
      shadow-camera-near={0.5}
      shadow-camera-far={10}
      shadow-bias={-0.001}
      distance={8}
      decay={1.2}
    />
  );
}

// Separate shadow receiver plane
function ShadowPlane() {
  const { width, height } = useThree((state) => state.viewport);
  return (
    <mesh position={[0, 0, -0.04]} receiveShadow scale={[1.3, 1.3, 1]}>
      <planeGeometry args={[width, height]} />
      <shadowMaterial transparent opacity={0.45} />
    </mesh>
  );
}

// 3D Moth component moving in shared space
function Moth3D({ stage, isFlameOn, flameIntensity, audioBandsRef }) {
  const groupRef = useRef();
  const { scene, animations } = useGLTF(mothModelUrl);
  const { actions } = useAnimations(animations, groupRef);
  
  const mothCoords = useRef({ x: -2.2, y: -1.2, z: -0.5, rx: 0.15, ry: Math.PI, rz: 0 });
  const [isMothFlying, setIsMothFlying] = useState(false);
  const [visible, setVisible] = useState(false);

  // Clone scene and override materials based on stage
  const clonedScene = useMemo(() => {
    const s = scene.clone();
    s.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        if (stage === 2) {
          // Silhouette material override
          child.material = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.25
          });
        }
      }
    });
    return s;
  }, [scene, stage]);

  // Sync flapping speed with flight state
  useEffect(() => {
    const actionNames = Object.keys(actions);
    if (actionNames.length > 0) {
      const mainAction = actions[actionNames[0]];
      if (mainAction) {
        mainAction.reset().fadeIn(0.25).play();
        mainAction.setEffectiveTimeScale(isMothFlying ? 2.8 : (stage === 6 ? 0.0 : 0.25));
      }
    }
  }, [actions, isMothFlying, stage]);

  // Stage-specific GSAP movements
  useEffect(() => {
    gsap.killTweensOf(mothCoords.current);

    if (stage === 1 || stage === 4) {
      setVisible(false);
      setIsMothFlying(false);
    } 
    else if (stage === 2) {
      setVisible(true);
      setIsMothFlying(false);
      gsap.to(mothCoords.current, {
        x: -2.0,
        y: -1.0,
        z: -0.2,
        rx: 0.15,
        ry: Math.PI,
        rz: 0.0,
        duration: 2.0,
        ease: 'power2.out'
      });
    } 
    else if (stage === 3) {
      setVisible(true);
      setIsMothFlying(true);
      
      const triggerErraticOrbit = () => {
        if (stage !== 3) return;
        const angle = Math.random() * Math.PI * 2.0;
        const radius = 0.6 + Math.random() * 1.2;
        const targetX = Math.cos(angle) * radius;
        const targetY = Math.sin(angle) * radius;
        const targetZ = 0.1 + Math.random() * 0.4;
        
        const dx = targetX - mothCoords.current.x;
        const dy = targetY - mothCoords.current.y;
        const rotZ = Math.atan2(dy, dx) - Math.PI / 2.0;
        
        gsap.to(mothCoords.current, {
          x: targetX,
          y: targetY,
          z: targetZ,
          rx: 0.3 + Math.random() * 0.2,
          ry: Math.PI + Math.sin(targetX) * 0.3,
          rz: rotZ,
          duration: 0.35 + Math.random() * 0.35,
          ease: 'sine.inOut',
          onComplete: triggerErraticOrbit
        });
      };
      triggerErraticOrbit();
    } 
    else if (stage === 5) {
      setVisible(true);
      setIsMothFlying(true);
      
      // Start from center
      mothCoords.current.x = 0;
      mothCoords.current.y = 0;
      mothCoords.current.z = 0.2;
      mothCoords.current.rx = 0.15;
      mothCoords.current.ry = Math.PI;
      mothCoords.current.rz = 0;

      gsap.to(mothCoords.current, {
        x: 3.5,
        y: 0.5,
        z: -0.8,
        rx: 0.2,
        ry: Math.PI + 0.4,
        rz: 0.15,
        duration: 7.5,
        ease: 'power1.inOut',
        onComplete: () => {
          setIsMothFlying(false);
        }
      });
    } 
    else if (stage === 6) {
      setVisible(true);
      setIsMothFlying(false);
      gsap.to(mothCoords.current, {
        x: 0.0,
        y: 0.0,
        z: 0.15,
        rx: 0.0,
        ry: Math.PI,
        rz: 0.0,
        duration: 3.0,
        ease: 'power2.out'
      });
    }
  }, [stage]);

  // Apply positions and simple sways per frame
  useFrame((state) => {
    if (!visible || !groupRef.current) return;
    
    const t = state.clock.getElapsedTime();
    let xSway = 0;
    let ySway = 0;
    let zSway = 0;

    if (!isMothFlying) {
      xSway = Math.sin(t * 1.5) * 0.015;
      ySway = Math.cos(t * 2.2) * 0.015;
      zSway = Math.sin(t * 1.8) * 0.01;
      
      groupRef.current.rotation.y = mothCoords.current.ry + Math.sin(t * 1.2) * 0.03;
      groupRef.current.rotation.x = mothCoords.current.rx + Math.sin(t * 1.8) * 0.02;
      groupRef.current.rotation.z = mothCoords.current.rz + Math.cos(t * 1.5) * 0.02;
    } else {
      xSway = Math.sin(t * 24.0) * 0.05;
      ySway = Math.cos(t * 28.0) * 0.05;
      zSway = Math.sin(t * 26.0) * 0.03;
      
      groupRef.current.rotation.y = mothCoords.current.ry + Math.sin(t * 22.0) * 0.12;
      groupRef.current.rotation.x = mothCoords.current.rx + Math.sin(t * 26.0) * 0.1;
      groupRef.current.rotation.z = mothCoords.current.rz + Math.cos(t * 24.0) * 0.06;
    }

    groupRef.current.position.set(
      mothCoords.current.x + xSway,
      mothCoords.current.y + ySway,
      mothCoords.current.z + zSway
    );
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} scale={0.7} />
    </group>
  );
}

// Conditional Postprocessing Stack
function PostEffects({ stage }) {
  const chromOffset = useMemo(() => new THREE.Vector2(0.0035, 0.0035), []);
  return (
    <EffectComposer>
      <Vignette eskil={false} offset={0.4} darkness={0.65} />
      <Noise opacity={0.035} />
      
      {stage === 1 && (
        <Bloom luminanceThreshold={0.55} intensity={0.4} mipmapBlur />
      )}
      {stage === 2 && (
        <>
          <DepthOfField focusDistance={0.02} focalLength={0.1} bokehScale={3.0} />
          <Bloom luminanceThreshold={0.72} intensity={0.25} />
        </>
      )}
      {stage === 3 && (
        <>
          <ChromaticAberration offset={chromOffset} />
          <Bloom luminanceThreshold={0.45} intensity={0.75} />
        </>
      )}
      {stage === 4 && (
        <Bloom luminanceThreshold={0.25} intensity={1.4} mipmapBlur />
      )}
      {stage === 5 && (
        <Bloom luminanceThreshold={0.62} intensity={0.75} />
      )}
      {stage === 6 && (
        <Bloom luminanceThreshold={0.04} intensity={3.2} mipmapBlur />
      )}
    </EffectComposer>
  );
}

function PortalWorld({ stage, audioBandsRef, isFlameOn, flameIntensity }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.12;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -1.0]}>
      <ambientLight intensity={0.8} />
      <pointLight position={[0, 3, 3]} intensity={2.0} color="#ffffff" />

      {stage === 1 && <Stage1World />}
      {stage === 2 && <Stage2World />}
      {stage === 3 && <Stage3World audioBandsRef={audioBandsRef} />}
      {stage === 4 && <Stage4World isFlameOn={isFlameOn} flameIntensity={flameIntensity} />}
      {stage === 5 && <Stage5World />}
      {stage === 6 && <Stage6World />}
    </group>
  );
}

function PortalRecord({ isPortalOpen, currentTrackId, audioBandsRef, isFlameOn, flameIntensity }) {
  const portalMaterialRef = useRef();
  const outerRingRef = useRef();
  const { width, height } = useThree((state) => state.viewport);
  const size = useThree((state) => state.size);

  const pixelsToUnits = width / size.width;
  const recordRadius = 245 * pixelsToUnits;
  const labelRadius = 75 * pixelsToUnits;

  // Lerp camera and portal blend on update
  useFrame((state) => {
    const targetZ = isPortalOpen ? 0.22 : 1.0;
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.08);

    if (portalMaterialRef.current) {
      const targetBlend = isPortalOpen ? 1.0 : 0.0;
      portalMaterialRef.current.blend = THREE.MathUtils.lerp(
        portalMaterialRef.current.blend,
        targetBlend,
        0.08
      );
    }

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z -= 0.015;
    }
  });

  const stage = parseInt(currentTrackId) || 1;
  const shouldRender = isPortalOpen || (portalMaterialRef.current && portalMaterialRef.current.blend > 0.01);

  if (!shouldRender) return null;

  return (
    <group position={[0, 0, 0.01]}>
      {/* 3D Vinyl Outer Ring (Black Shiny vinyl) */}
      <mesh ref={outerRingRef} position={[0, 0, 0]}>
        <ringGeometry args={[labelRadius, recordRadius, 64]} />
        <meshStandardMaterial 
          color="#080706" 
          roughness={0.4} 
          metalness={0.85} 
          side={THREE.DoubleSide} 
        />
      </mesh>

      {/* 3D Center Label containing MeshPortalMaterial */}
      <mesh position={[0, 0, 0.001]}>
        <circleGeometry args={[labelRadius, 64]} />
        <MeshPortalMaterial ref={portalMaterialRef} blur={0.15} transparent>
          <PortalWorld 
            stage={stage} 
            audioBandsRef={audioBandsRef} 
            isFlameOn={isFlameOn} 
            flameIntensity={flameIntensity} 
          />
        </MeshPortalMaterial>
      </mesh>
    </group>
  );
}

export default function AtmosphereCanvas({ 
  currentTrackId, 
  isFlameOn, 
  flameIntensity, 
  audioBandsRef, 
  currentTime, 
  duration,
  isPortalOpen
}) {
  const initialStage = parseInt(currentTrackId) || 1;
  const [stageA, setStageA] = useState(initialStage);
  const [stageB, setStageB] = useState(initialStage);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <Canvas
        shadows
        camera={{ position: [0, 0, 1] }}
        style={{ width: '100%', height: '100%', background: 'black' }}
        gl={{ alpha: false, antialias: true }}
      >
        <ShaderBackground
          currentTrackId={currentTrackId}
          isFlameOn={isFlameOn}
          flameIntensity={flameIntensity}
          audioBandsRef={audioBandsRef}
          stageA={stageA}
          setStageA={setStageA}
          stageB={stageB}
          setStageB={setStageB}
        />
        
        <AtmosphereParticles
          stage={stageA}
          audioBandsRef={audioBandsRef}
          currentTime={currentTime}
          duration={duration}
        />

        <FlameLight
          isFlameOn={isFlameOn}
          flameIntensity={flameIntensity}
          audioBandsRef={audioBandsRef}
        />

        <ShadowPlane />

        <Suspense fallback={null}>
          <Moth3D
            stage={stageA}
            isFlameOn={isFlameOn}
            flameIntensity={flameIntensity}
            audioBandsRef={audioBandsRef}
          />
        </Suspense>

        <PortalRecord
          isPortalOpen={isPortalOpen}
          currentTrackId={currentTrackId}
          audioBandsRef={audioBandsRef}
          isFlameOn={isFlameOn}
          flameIntensity={flameIntensity}
        />
        
        <PostEffects stage={stageA} />
      </Canvas>
    </div>
  );
}

// Preload the GLB model
useGLTF.preload(mothModelUrl);
