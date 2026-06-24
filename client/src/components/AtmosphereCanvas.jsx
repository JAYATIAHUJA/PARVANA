import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sparkles, useGLTF, useAnimations, MeshPortalMaterial, Text } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, DepthOfField, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';
import vertShader from '../shaders/atmosphere.vert.glsl';
import fragShader from '../shaders/atmosphere.frag.glsl';
import flameVertShader from '../shaders/flame.vert.glsl';
import flameFragShader from '../shaders/flame.frag.glsl';
import mothModelUrl from '../assets/models/giant_peacock_moth.glb';

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

// Custom volumetric rising embers for Stage 4
function EmberParticles({ count = 30 }) {
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

// Sub-component for Stage 4 flame mesh inside the portal
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

// Sub-component for Stage 3 Torus
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

// Helper sub-component for rendering the moth model inside the portal space
function PortalMoth({ wireframe = false, color = null, scale = 0.3, speedFactor = 1.0 }) {
  const groupRef = useRef();
  const { scene, animations } = useGLTF(mothModelUrl);
  const { actions } = useAnimations(animations, groupRef);

  const clonedScene = useMemo(() => {
    const s = scene.clone();
    s.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
        if (wireframe) {
          child.material = new THREE.MeshBasicMaterial({
            color: 0xff4500,
            wireframe: true,
            transparent: true,
            opacity: 0.7
          });
        } else if (color !== null) {
          child.material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.35
          });
        }
      }
    });
    return s;
  }, [scene, wireframe, color]);

  useEffect(() => {
    const actionNames = Object.keys(actions);
    if (actionNames.length > 0) {
      const action = actions[actionNames[0]];
      if (action) {
        action.reset().fadeIn(0.25).play();
        action.setEffectiveTimeScale(isFinite(speedFactor) ? 1.8 * speedFactor : 0.0);
      }
    }
  }, [actions, speedFactor]);

  useFrame((state) => {
    if (groupRef.current && speedFactor > 0.01) {
      const t = state.clock.getElapsedTime();
      groupRef.current.position.y = Math.sin(t * 2.2) * 0.06;
      groupRef.current.rotation.y = Math.sin(t * 0.8) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} scale={scale} />
    </group>
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

      {stage === 1 && (
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
      )}

      {stage === 2 && (
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
      )}

      {stage === 3 && (
        <group>
          {/* Audio-reactive Torus Knot */}
          <ObsessionTorus audioBandsRef={audioBandsRef} />
          <Sparkles count={75} scale={[2.0, 2.0, 2.0]} color="#8e1b1b" size={1.4} speed={2.0} />
          <Text position={[0, 0.45, 0]} fontSize={0.045} color="#8e1b1b" anchorX="center" anchorY="middle">
            तू क्यों ना मुझे देखती?
          </Text>
        </group>
      )}

      {stage === 4 && (
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
      )}

      {stage === 5 && (
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
      )}

      {stage === 6 && (
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
      )}
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
