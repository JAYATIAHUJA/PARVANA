import React, { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import gsap from 'gsap';
import mothModelUrl from '../assets/models/giant_peacock_moth.glb';

// 3D Model sub-component
function Moth3DModel({ isFlying }) {
  const group = useRef();
  const { scene, animations } = useGLTF(mothModelUrl);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    // Play the first animation clip (flapping wings)
    const actionNames = Object.keys(actions);
    if (actionNames.length > 0) {
      const mainAction = actions[actionNames[0]];
      if (mainAction) {
        mainAction.reset().fadeIn(0.25).play();
        // Flap faster when flying, slower when resting
        mainAction.setEffectiveTimeScale(isFlying ? 2.8 : 0.25);
      }
    }
  }, [actions, isFlying]);

  // Subtle natural rotational jitter & breathing tilt
  useFrame((state) => {
    if (group.current) {
      const t = state.clock.getElapsedTime();
      if (!isFlying) {
        // Slow calm breathing/tremble when sitting
        group.current.rotation.y = Math.PI + Math.sin(t * 1.5) * 0.04;
        group.current.rotation.x = 0.15 + Math.sin(t * 2.2) * 0.02;
        group.current.rotation.z = Math.cos(t * 1.8) * 0.02;
      } else {
        // Fast flying flutter tilt
        group.current.rotation.y = Math.PI + Math.sin(t * 25) * 0.18;
        group.current.rotation.x = 0.35 + Math.sin(t * 30) * 0.12;
        group.current.rotation.z = Math.cos(t * 28) * 0.08;
      }
    }
  });

  return (
    <primitive 
      ref={group} 
      object={scene} 
      scale={2.2} // Adjust scale so moth fits nicely in our 85px container
      position={[0, -0.1, 0]} 
    />
  );
}

export default function Moth({ isFlameOn, isPlaying }) {
  const mothRef = useRef(null);
  const [isFlying, setIsFlying] = useState(false);
  const flightInterval = useRef(null);

  // Enlarged canvas container style to prevent clipping and fit the 3D model
  const restStyle = {
    position: 'absolute',
    bottom: '120px',
    left: '100px',
    width: '85px',
    height: '85px',
    zIndex: 40,
    opacity: 0.22, // Faded when resting
    pointerEvents: 'none',
    transition: 'opacity 2.2s ease',
    transformOrigin: 'center center',
  };

  useEffect(() => {
    if (!isFlameOn) {
      if (flightInterval.current) clearInterval(flightInterval.current);
      stopFlight();
      return;
    }

    const triggerChance = () => {
      if (isPlaying && !isFlying) {
        // 35% chance to start flying
        if (Math.random() < 0.35) {
          startFlight();
        }
      }
    };

    // Check flight opportunity every 12 seconds
    flightInterval.current = setInterval(triggerChance, 12000);

    return () => {
      if (flightInterval.current) clearInterval(flightInterval.current);
    };
  }, [isFlameOn, isPlaying, isFlying]);

  const startFlight = () => {
    setIsFlying(true);
    const moth = mothRef.current;
    if (!moth) return;

    // Wake up: fade in visibility
    gsap.to(moth, { opacity: 0.88, duration: 1.2 });

    // Flight target (flame)
    // rest position is bottom-left, flame is at top-right
    const startX = 100;
    const startY = window.innerHeight - 120;
    const targetX = window.innerWidth - 80;
    const targetY = 70;

    const diffX = targetX - startX;
    const diffY = targetY - startY;

    const tl = gsap.timeline({
      onComplete: () => {
        // Sleep state
        gsap.to(moth, { opacity: 0.22, duration: 3.0 });
        setIsFlying(false);
      }
    });

    // 1. Erratic flutter flight towards flame
    tl.to(moth, {
      x: diffX * 0.35 + (Math.random() * 90 - 45),
      y: diffY * 0.35 + (Math.random() * 90 - 45),
      rotation: -12,
      duration: 2.0,
      ease: 'sine.inOut',
    })
    .to(moth, {
      x: diffX * 0.8 + (Math.random() * 60 - 30),
      y: diffY * 0.8 + (Math.random() * 60 - 30),
      rotation: 8,
      duration: 1.8,
      ease: 'sine.inOut',
    })
    // 2. Reach the flame and orbit
    .to(moth, {
      x: diffX,
      y: diffY,
      rotation: 0,
      duration: 0.9,
      ease: 'power1.out',
    });

    // Orbit loops around flame
    const numLoops = 6;
    for (let k = 0; k < numLoops; k++) {
      const angle = (k * (Math.PI * 2)) / 3;
      const radius = 32 + Math.random() * 20;
      tl.to(moth, {
        x: diffX + Math.cos(angle) * radius,
        y: diffY + Math.sin(angle) * radius,
        rotation: (angle * 180) / Math.PI + 90 + (Math.random() * 20 - 10),
        duration: 0.5 + Math.random() * 0.2,
        ease: 'sine.inOut',
      });
    }

    // 3. Retreat back to rest
    tl.to(moth, {
      x: diffX * 0.55 + (Math.random() * 80 - 40),
      y: diffY * 0.55 + (Math.random() * 80 - 40),
      rotation: -30,
      duration: 2.4,
      ease: 'power1.inOut',
    })
    .to(moth, {
      x: 0,
      y: 0,
      rotation: 0,
      duration: 2.0,
      ease: 'power2.inOut',
    });
  };

  const stopFlight = () => {
    const moth = mothRef.current;
    if (!moth) return;

    gsap.killTweensOf(moth);
    gsap.to(moth, {
      x: 0,
      y: 0,
      rotation: 0,
      opacity: 0.22,
      duration: 2.2,
      ease: 'power1.out'
    });
    setIsFlying(false);
  };

  return (
    <div ref={mothRef} style={restStyle}>
      <Canvas 
        camera={{ position: [0, 0, 3.5], fov: 38 }}
        style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        <ambientLight intensity={1.8} />
        <directionalLight position={[1, 5, 2]} intensity={1.2} />
        <pointLight position={[0, 0, 1.5]} intensity={1.6} color="#ffa555" />
        <Suspense fallback={null}>
          <Moth3DModel isFlying={isFlying} />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Pre-load the GLB asset to prevent lag when the moth first flies
useGLTF.preload(mothModelUrl);
