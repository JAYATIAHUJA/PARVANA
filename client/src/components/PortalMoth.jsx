import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import mothModelUrl from '../assets/models/giant_peacock_moth.glb';

export default function PortalMoth({ wireframe = false, color = null, scale = 0.3, speedFactor = 1.0 }) {
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

// Preload inside the file as well
useGLTF.preload(mothModelUrl);
