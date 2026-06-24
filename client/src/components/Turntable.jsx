import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import VinylFire from './VinylFire';

export default function Turntable({
  currentTrack,
  isPlaying,
  onPlayPause,
  currentTime,
  duration,
  isFlameOn,
  flameIntensity,
  audioBandsRef,
  onPortalTrigger
}) {
  const recordRef = useRef(null);
  const reflectionRef = useRef(null);
  const tonearmRef = useRef(null);
  const rotationTween = useRef(null);
  const sheenTween = useRef(null);

  const [showFire, setShowFire] = useState(false);

  useEffect(() => {
    let timeout;
    if (currentTrack?.id === '4') {
      setShowFire(true);
    } else {
      // Keep it mounted for 3 seconds to let uIntensity fade to 0
      timeout = setTimeout(() => {
        setShowFire(false);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [currentTrack?.id]);

  // 1. Initialize Platter Rotation Tween
  useEffect(() => {
    rotationTween.current = gsap.to(recordRef.current, {
      rotation: '+=360',
      duration: 5.2,
      repeat: -1,
      ease: 'none',
      paused: true,
    });

    return () => {
      rotationTween.current?.kill();
    };
  }, []);

  // 2. Playback state rotation control
  useEffect(() => {
    if (!rotationTween.current) return;

    if (isPlaying) {
      gsap.to(rotationTween.current, {
        timeScale: 1.0,
        duration: 2.0,
        ease: 'power2.out',
        onStart: () => rotationTween.current.play(),
      });
    } else {
      gsap.to(rotationTween.current, {
        timeScale: 0.0,
        duration: 2.5,
        ease: 'power2.out',
        onComplete: () => rotationTween.current.pause(),
      });
    }
  }, [isPlaying]);

  // 2b. Dynamic Reflection Sheen Rotation loop based on current track stage
  useEffect(() => {
    sheenTween.current?.kill();

    if (isPlaying) {
      let rotationSpeed = 24; // normal slow rotation in seconds per full cycle
      let rotationEase = 'none';

      if (currentTrack?.id === '4') {
        // Stage 4 (Shamaa Interlude): fast, heat-driven moving orange reflections!
        rotationSpeed = 8;
      } else if (currentTrack?.id === '3') {
        // Stage 3 (Tu Kyun Na Mujhe Dekhti): tense, fast speed
        rotationSpeed = 14;
      } else if (currentTrack?.id === '6') {
        // Stage 6 (Aashiqana): slow, peaceful ethereal glide
        rotationSpeed = 36;
      }

      sheenTween.current = gsap.to(reflectionRef.current, {
        rotation: '+=360',
        duration: rotationSpeed,
        repeat: -1,
        ease: rotationEase,
      });
    } else {
      // Gently return vinyl reflections to neutral rest position
      gsap.to(reflectionRef.current, {
        rotation: 0,
        duration: 2.0,
        ease: 'power2.out',
      });
    }

    return () => {
      sheenTween.current?.kill();
    };
  }, [isPlaying, currentTrack?.id]);

  // 3. Precise tonearm angle tracking mapping
  // Arm rest: 0deg. Playing outer edge: 18deg, inner edge: 33deg.
  const progressRatio = duration > 0 ? currentTime / duration : 0;
  const targetAngle = isPlaying ? 18.0 + progressRatio * 15.0 : 0;

  useEffect(() => {
    if (isPlaying) {
      gsap.to(tonearmRef.current, {
        rotation: targetAngle,
        duration: isPlaying && progressRatio === 0 ? 1.8 : 0.5, // back ease-out entry, then linear-ish track sweeps
        ease: isPlaying && progressRatio === 0 ? 'back.out(0.6)' : 'power1.out',
      });
    } else {
      gsap.to(tonearmRef.current, {
        rotation: 0,
        duration: 2.0,
        ease: 'power2.inOut',
      });
    }
  }, [isPlaying, targetAngle]);

  const handleVinylMouseEnter = () => {
    if (!isPlaying) return;
    gsap.to(rotationTween.current, { timeScale: 1.35, duration: 0.8, ease: 'power1.out' });
    gsap.to(reflectionRef.current, { rotation: '+=12', duration: 0.8, ease: 'power1.out' });
  };

  const handleVinylMouseLeave = () => {
    if (!isPlaying) return;
    gsap.to(rotationTween.current, { timeScale: 1.0, duration: 1.0, ease: 'power1.inOut' });
  };

  return (
    <div 
      className="vinyl-platter-chassis flex items-center justify-center relative"
      style={{
        width: '520px',
        height: '520px',
        border: '1px solid var(--border-copper)',
      }}
    >
      {/* Brass bezel accents */}
      <div 
        className="absolute inset-3.5 rounded-full pointer-events-none opacity-25"
        style={{
          border: '1px dashed var(--color-text-muted)',
        }}
      />

      {/* Volumetric Vinyl Fire Ring overlay */}
      {showFire && (
        <VinylFire 
          isFlameOn={isFlameOn} 
          flameIntensity={flameIntensity} 
          audioBandsRef={audioBandsRef} 
          currentTrackId={currentTrack?.id} 
        />
      )}

      {/* Rotating Platter Disc */}
      <div
        ref={recordRef}
        onMouseEnter={handleVinylMouseEnter}
        onMouseLeave={handleVinylMouseLeave}
        onClick={onPlayPause}
        className="vinyl-disc cursor-pointer flex items-center justify-center"
        style={{
          width: '490px',
          height: '490px',
        }}
      >
        {/* Conic Sheen Light Reflection */}
        <div ref={reflectionRef} className="vinyl-sheen" />

        {/* Analogue Dust Speck Layer */}
        <div className="vinyl-dust-overlay" />

        {/* Center label */}
        <div
          className="relative flex items-center justify-center z-10"
          onClick={(e) => {
            e.stopPropagation();
            if (onPortalTrigger) onPortalTrigger();
          }}
          style={{
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #150f0c 0%, #060504 100%)',
            border: '1.5px solid rgba(161, 102, 63, 0.22)',
            boxShadow: 'inset 0 4px 12px rgba(0, 0, 0, 0.9)',
            overflow: 'hidden',
            cursor: 'zoom-in',
          }}
        >
          {/* Faded album sleeve visualizer background */}
          {currentTrack?.coverArtUrl && (
            <img
              src={currentTrack.coverArtUrl}
              alt="sleeve art label"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-[0.2] select-none"
              style={{ filter: 'grayscale(1) sepia(0.4)' }}
            />
          )}

          {/* Editorial copy on label */}
          <div className="flex flex-col items-center justify-center text-center px-3 z-10" style={{ gap: '2px' }}>
            <span 
              className="font-serif font-bold italic text-[11px] leading-tight" 
              style={{ color: 'var(--color-text-secondary)', letterSpacing: '0.04em', textShadow: 'var(--typography-glow)' }}
            >
              {currentTrack?.title || 'No Track'}
            </span>
            <span 
              className="font-sans text-[7px] tracking-[0.2em] font-black" 
              style={{ color: 'var(--color-accent)', textShadow: 'var(--typography-glow)' }}
            >
              {currentTrack?.titleHindi || 'परवाना'}
            </span>
            <span 
              className="font-sans text-[5.5px] uppercase tracking-[0.12em] font-bold mt-1.5" 
              style={{ color: 'var(--color-text-muted)' }}
            >
              Chaar Diwaari
            </span>
          </div>

          {/* Central hole rim */}
          <div
            className="absolute"
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: '#030202',
              border: '1px solid rgba(161, 102, 63, 0.3)',
              boxShadow: 'inset 0 3px 5px rgba(0,0,0,0.95)',
              zIndex: 25,
            }}
          />
        </div>
      </div>

      {/* Brass Spindle pin */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #fff 0%, #a87243 45%, #462c14 100%)',
          zIndex: 30,
          boxShadow: '0 4px 6px rgba(0,0,0,0.65)',
        }}
      />

      {/* Physical Tonearm Cartridge Assembly */}
      <div
        ref={tonearmRef}
        className="absolute pointer-events-none"
        style={{
          right: '-25px',
          top: '-45px',
          width: '130px',
          height: '380px',
          transformOrigin: '100px 60px',
          transform: 'rotate(0deg)',
          zIndex: 35,
          filter: 'var(--tonearm-glow)',
        }}
      >
        <svg viewBox="0 0 130 380" className="w-full h-full overflow-visible" fill="none">
          {/* Base structure support pivot */}
          <circle cx="100" cy="60" r="18" fill="#151210" stroke="var(--border-copper)" strokeWidth="1" />
          <circle cx="100" cy="60" r="11" fill="#2d2520" />
          <circle cx="100" cy="60" r="4.5" fill="var(--color-accent)" />

          {/* Weight details */}
          <rect x="88" y="12" width="24" height="22" rx="2" fill="#6e4225" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
          <line x1="100" y1="34" x2="100" y2="48" stroke="#87512e" strokeWidth="2.5" />

          {/* Tonearm metal copper bar */}
          <path 
            d="M 100 70 Q 100 200, 42 270 T 18 335" 
            stroke="var(--color-text-secondary)" 
            strokeWidth="3.0" 
            fill="none" 
            strokeLinecap="round"
            style={{ opacity: 0.95 }}
          />

          {/* Cartridge headshell and stylus needle */}
          <g transform="translate(7, 328) rotate(-28)">
            <rect x="0" y="0" width="12" height="24" rx="1.5" fill="#151210" stroke="var(--border-copper)" strokeWidth="0.8" />
            {/* Needle bracket */}
            <path d="M 6 24 L 6 30 L 9 31" stroke="#87512e" strokeWidth="1.4" fill="none" />
            <circle cx="6" cy="6" r="1.5" fill="var(--color-accent)" />
          </g>
        </svg>
      </div>

    </div>
  );
}
