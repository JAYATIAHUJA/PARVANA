import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function MothShadow({ isFlameOn, isPlaying }) {
  const shadowRef = useRef(null);
  const triggerInterval = useRef(null);

  useEffect(() => {
    if (!isFlameOn || !isPlaying) {
      if (triggerInterval.current) clearInterval(triggerInterval.current);
      return;
    }

    // Periodically check to trigger the moth shadow flutter
    const checkChance = () => {
      if (Math.random() < 0.45) {
        animateShadow();
      }
    };

    triggerInterval.current = setInterval(checkChance, 16000);

    return () => {
      if (triggerInterval.current) clearInterval(triggerInterval.current);
    };
  }, [isFlameOn, isPlaying]);

  const animateShadow = () => {
    const el = shadowRef.current;
    if (!el) return;

    // Reset properties to start offscreen (left/bottom)
    gsap.killTweensOf(el);
    gsap.set(el, {
      x: -50,
      y: window.innerHeight * 0.4,
      opacity: 0,
      scale: 0.7,
      rotation: -10,
    });

    const tl = gsap.timeline();

    // Glide across the screen, fluttering erratically near the light sources
    tl.to(el, {
      opacity: 0.14,
      x: window.innerWidth * 0.25,
      y: window.innerHeight * 0.25,
      rotation: 25,
      scale: 0.9,
      duration: 2.2,
      ease: 'sine.inOut',
    })
    // Micro flutter zig-zags
    .to(el, {
      x: window.innerWidth * 0.28,
      y: window.innerHeight * 0.18,
      rotation: -15,
      duration: 0.35,
      ease: 'power1.inOut',
    })
    .to(el, {
      x: window.innerWidth * 0.32,
      y: window.innerHeight * 0.22,
      rotation: 10,
      duration: 0.4,
      ease: 'power1.inOut',
    })
    // Sweep closer to the right pre-amp section (where the vacuum tube is)
    .to(el, {
      x: window.innerWidth * 0.75,
      y: window.innerHeight * 0.15,
      rotation: -45,
      scale: 1.1,
      opacity: 0.16,
      duration: 2.5,
      ease: 'sine.out',
    })
    // Circle briefly
    .to(el, {
      x: window.innerWidth * 0.79,
      y: window.innerHeight * 0.2,
      rotation: 60,
      duration: 0.8,
      ease: 'sine.inOut',
    })
    // Fade into the background shadow of the pre-amp console
    .to(el, {
      x: window.innerWidth * 0.9,
      y: window.innerHeight * 0.35,
      opacity: 0,
      scale: 0.6,
      duration: 1.8,
      ease: 'power2.in',
    });
  };

  return (
    <div
      ref={shadowRef}
      className="pointer-events-none fixed z-30"
      style={{
        width: '36px',
        height: '24px',
        opacity: 0,
        filter: 'blur(4.5px)',
        mixBlendMode: 'multiply',
        transformOrigin: 'center center',
      }}
    >
      <svg
        viewBox="0 0 32 24"
        fill="rgba(0, 0, 0, 0.75)"
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
      >
        {/* Moth shadow paths */}
        <path d="M16 12 C10 4, 2 2, 1 8 C0 14, 8 18, 16 12Z" />
        <path d="M16 12 C22 4, 30 2, 31 8 C32 14, 24 18, 16 12Z" />
        <ellipse cx="16" cy="12" rx="1.8" ry="4" fill="rgba(0,0,0,0.85)" />
      </svg>
    </div>
  );
}
