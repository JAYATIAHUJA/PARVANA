import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import Turntable from './components/Turntable';
import VinylCrackle from './components/VinylCrackle';
import FlameValve3D from './components/FlameValve3D';
import AtmosphereCanvas from './components/AtmosphereCanvas';

const STAGE_THEMES = {
  '1': {
    '--bg-primary': '#311A12',
    '--bg-panel': 'rgba(49, 26, 18, 0.55)',
    '--border-copper': 'rgba(201, 122, 61, 0.22)',
    '--color-text-primary': '#F4D19B',
    '--color-text-secondary': '#ebdcc5',
    '--color-text-muted': '#7d6855',
    '--color-accent': '#C97A3D',
    '--color-accent-glow': 'rgba(201, 122, 61, 0.35)',
    '--vinyl-reflection-opacity': 0.8,
    '--vinyl-dust-opacity': 0.1,
    '--vinyl-grooves-opacity': 0.88,
    '--noise-opacity': 0.05,
    '--flame-scale': 1.0,
    '--flame-glow-color': 'rgba(201, 122, 61, 0.45)',
    '--flame-core-color': '#ffe082',
    '--flame-outer-color': 'rgba(201, 122, 61, 0.7)',
    '--dust-color': 'rgba(244, 209, 155, 0.6)',
    '--glow-opacity': 0.75,
    '--typography-glow': '0px 0px 10px rgba(201, 122, 61, 0.3)',
    '--glass-reflection': 'rgba(255, 230, 200, 0.08)'
  },
  '2': {
    '--bg-primary': '#1B1528',
    '--bg-panel': 'rgba(27, 21, 40, 0.55)',
    '--border-copper': 'rgba(107, 76, 165, 0.25)',
    '--color-text-primary': '#fbf8f3',
    '--color-text-secondary': '#dcdfe3',
    '--color-text-muted': '#6b4ca5',
    '--color-accent': '#b47aff',
    '--color-accent-glow': 'rgba(180, 122, 255, 0.35)',
    '--vinyl-reflection-opacity': 0.45,
    '--vinyl-dust-opacity': 0.05,
    '--vinyl-grooves-opacity': 0.75,
    '--noise-opacity': 0.04,
    '--flame-scale': 0.85,
    '--flame-glow-color': 'rgba(180, 122, 255, 0.35)',
    '--flame-core-color': '#e8d5ff',
    '--flame-outer-color': 'rgba(107, 76, 165, 0.7)',
    '--dust-color': 'rgba(180, 122, 255, 0.4)',
    '--glow-opacity': 0.65,
    '--typography-glow': '0px 0px 15px rgba(180, 122, 255, 0.4)',
    '--glass-reflection': 'rgba(180, 122, 255, 0.05)'
  },
  '3': {
    '--bg-primary': '#140404',
    '--bg-panel': 'rgba(20, 4, 4, 0.7)',
    '--border-copper': 'rgba(142, 27, 27, 0.3)',
    '--color-text-primary': '#fbf8f3',
    '--color-text-secondary': '#ebdcc5',
    '--color-text-muted': '#3b0b0b',
    '--color-accent': '#8e1b1b',
    '--color-accent-glow': 'rgba(142, 27, 27, 0.5)',
    '--vinyl-reflection-opacity': 0.25,
    '--vinyl-dust-opacity': 0.08,
    '--vinyl-grooves-opacity': 0.65,
    '--noise-opacity': 0.08,
    '--flame-scale': 1.25,
    '--flame-glow-color': 'rgba(142, 27, 27, 0.6)',
    '--flame-core-color': '#ffbaba',
    '--flame-outer-color': 'rgba(142, 27, 27, 0.8)',
    '--dust-color': 'rgba(142, 27, 27, 0.5)',
    '--glow-opacity': 0.85,
    '--typography-glow': '0px 0px 12px rgba(142, 27, 27, 0.6)',
    '--glass-reflection': 'rgba(142, 27, 27, 0.05)'
  },
  '4': {
    '--bg-primary': '#090300',
    '--bg-panel': 'rgba(9, 3, 0, 0.6)',
    '--border-copper': 'rgba(255, 107, 0, 0.35)',
    '--color-text-primary': '#FFF5EB',
    '--color-text-secondary': '#FFD2A8',
    '--color-text-muted': '#3a1200',
    '--color-accent': '#FF6B00',
    '--color-accent-glow': 'rgba(255, 107, 0, 0.6)',
    '--vinyl-reflection-opacity': 0.75,
    '--vinyl-dust-opacity': 0.25,
    '--vinyl-grooves-opacity': 0.9,
    '--noise-opacity': 0.09,
    '--flame-scale': 1.8,
    '--flame-glow-color': 'rgba(255, 107, 0, 0.75)',
    '--flame-core-color': '#fff3cc',
    '--flame-outer-color': 'rgba(255, 69, 0, 0.85)',
    '--dust-color': 'rgba(255, 107, 0, 0.7)',
    '--glow-opacity': 0.95,
    '--typography-glow': '0px 0px 20px rgba(255, 107, 0, 0.7)',
    '--glass-reflection': 'rgba(255, 107, 0, 0.15)'
  },
  '5': {
    '--bg-primary': '#0A0D18',
    '--bg-panel': 'rgba(10, 13, 24, 0.55)',
    '--border-copper': 'rgba(175, 197, 255, 0.2)',
    '--color-text-primary': '#E6EDFF',
    '--color-text-secondary': '#AFC5FF',
    '--color-text-muted': '#3a486b',
    '--color-accent': '#AFC5FF',
    '--color-accent-glow': 'rgba(175, 197, 255, 0.25)',
    '--vinyl-reflection-opacity': 0.65,
    '--vinyl-dust-opacity': 0.02,
    '--vinyl-grooves-opacity': 0.55,
    '--noise-opacity': 0.03,
    '--flame-scale': 0.3,
    '--flame-glow-color': 'rgba(175, 197, 255, 0.15)',
    '--flame-core-color': '#e6f0ff',
    '--flame-outer-color': 'rgba(58, 72, 107, 0.6)',
    '--dust-color': 'rgba(175, 197, 255, 0.3)',
    '--glow-opacity': 0.45,
    '--typography-glow': '0px 0px 15px rgba(175, 197, 255, 0.35)',
    '--glass-reflection': 'rgba(175, 197, 255, 0.05)'
  },
  '6': {
    '--bg-primary': '#FFFDF8',
    '--bg-panel': 'rgba(255, 253, 248, 0.85)',
    '--border-copper': 'rgba(255, 214, 138, 0.4)',
    '--color-text-primary': '#311A12',
    '--color-text-secondary': '#6B4CA5',
    '--color-text-muted': '#A1663F',
    '--color-accent': '#FFD68A',
    '--color-accent-glow': 'rgba(255, 214, 138, 0.7)',
    '--vinyl-reflection-opacity': 0.9,
    '--vinyl-dust-opacity': 0.01,
    '--vinyl-grooves-opacity': 0.95,
    '--noise-opacity': 0.02,
    '--flame-scale': 1.5,
    '--flame-glow-color': 'rgba(255, 214, 138, 0.6)',
    '--flame-core-color': '#ffffff',
    '--flame-outer-color': 'rgba(255, 244, 214, 0.9)',
    '--dust-color': 'rgba(255, 214, 138, 0.5)',
    '--glow-opacity': 0.85,
    '--typography-glow': '0px 0px 25px rgba(255, 214, 138, 0.5)',
    '--glass-reflection': 'rgba(255, 244, 214, 0.2)'
  }
};


const PARVANA_TRACKS = [
  {
    id: '1',
    title: 'Banda Kaam Ka',
    titleHindi: 'बंदा काम का',
    artist: 'Chaar Diwaari, Sanjith Hegde',
    duration: 215,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverArtUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80',
    lyricSnippet: 'Seedha seedha raasta tha... Raha na main banda kaam ka',
    chapter: 'Attraction',
    stageClass: 'stage-attraction',
    hindiStage: 'आकर्षण',
    description: 'The first encounter. Straying off the straight path. The light catches the eye.',
    spotifyUrl: 'https://open.spotify.com/track/6vH6xKa1vh9ihWrLYZAmU8',
    titleEn: '01. ATTRACTION',
    stageSubtitle: 'Warmth of First Encounter',
    narrativeStage: 'Attraction',
    poetryHindi: [
      'Ek roshni thi,',
      'door se jahi hui...',
      'Na naam pata tha,',
      'na manzil.',
      'Bas kheenchta chala gaya,',
      'jaise parvana.'
    ],
    bottomQuote: 'The flame never called. The moth still came.'
  },
  {
    id: '2',
    title: 'Iss Tarah',
    titleHindi: 'इस तरह',
    artist: 'Chaar Diwaari, Sonu Nigam',
    duration: 242,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverArtUrl: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&auto=format&fit=crop&q=80',
    lyricSnippet: 'Ambar se sagar mile, Le chal tu vahan pe mujhe... Iss tarah aa...',
    chapter: 'Longing',
    stageClass: 'stage-longing',
    hindiStage: 'लालसा',
    description: 'The desperate plea for connection. Aching under the fading twilight.',
    spotifyUrl: 'https://open.spotify.com/track/1hj2XHe0acA4QuAS0HSxsz',
    titleEn: '02. LONGING',
    stageSubtitle: 'Drowning in Thoughts',
    narrativeStage: 'Longing',
    poetryHindi: [
      'Har lamha tera,',
      'har khayal tera.',
      'Is tarah tera intezaar',
      'karta raha.'
    ],
    bottomQuote: 'You were everywhere, yet nowhere to be found.'
  },
  {
    id: '3',
    title: 'Tu Kyu Na Mujhe Dekhti',
    titleHindi: 'तू क्यों ना मुझे देखती',
    artist: 'Chaar Diwaari',
    duration: 188,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverArtUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&auto=format&fit=crop&q=80',
    lyricSnippet: 'Tu kyu na mujhe dekhti? Kyun mujhse door bhaagti?',
    chapter: 'Obsession',
    stageClass: 'stage-obsession',
    hindiStage: 'जुनून',
    description: 'The descent into mania. Screaming at the silent, blinding beacon.',
    spotifyUrl: 'https://open.spotify.com/track/5WOhPBuOp2xlyXiRaWLfqU',
    titleEn: '03. OBSESSION',
    stageSubtitle: "Why Don't You See Me?",
    narrativeStage: 'Obsession',
    poetryHindi: [
      'Tu kyun na mujhe dekhti?',
      'Main yahan hoon,',
      'tere saamne.',
      'Phir bhi tu anjaan,',
      'kyun itni door?'
    ],
    bottomQuote: 'Unseen. Unheard. Still I stayed.'
  },
  {
    id: '4',
    title: 'Shamaa Interlude',
    titleHindi: 'शमा',
    artist: 'Chaar Diwaari',
    duration: 86,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    coverArtUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80',
    lyricSnippet: 'شمع جلتی رہی، پروانہ جل گیا...',
    chapter: 'Self Destruction',
    stageClass: 'stage-burning',
    hindiStage: 'आत्मविनाश',
    description: 'The moment of contact. Pain and certainty fuse into absolute light.',
    spotifyUrl: 'https://open.spotify.com/track/2YXvRK8aEWkWlBEY8bzH3K',
    titleEn: '04. DESTRUCTION',
    stageSubtitle: 'I Burn For You',
    narrativeStage: 'Destruction',
    poetryHindi: [
      'Aag se khelne chala tha,',
      'yaha hi tha anjaam.',
      'Shamaa ke itne kareeb,',
      'ab lautna bhi bekar.'
    ],
    bottomQuote: 'I wanted the light. I accepted the fire.'
  },
  {
    id: '5',
    title: 'Chaand',
    titleHindi: 'चांद',
    artist: 'Chaar Diwaari, Encore ABJ',
    duration: 254,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    coverArtUrl: 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=400&auto=format&fit=crop&q=80',
    lyricSnippet: 'Tu jo dekh le zara, zaalima... Mein marke bhi amar hu.',
    chapter: 'Surrender',
    stageClass: 'stage-surrender',
    hindiStage: 'समर्पण',
    description: 'A suicide note on burning parchment. Complete acceptance of the end.',
    spotifyUrl: 'https://open.spotify.com/track/3R6AGNnigrMm3E0nZYle4G',
    titleEn: '05. SURRENDER',
    stageSubtitle: 'I Accept the End',
    narrativeStage: 'Surrender',
    poetryHindi: [
      'Jo tha mera,',
      'sab tujhpe kho diya.',
      'Ab khud ko chhod diya,',
      'tera hona hi kaafi tha.'
    ],
    bottomQuote: 'I let go. And found peace in the burn.'
  },
  {
    id: '6',
    title: 'Aashiqana',
    titleHindi: 'आशिकाना',
    artist: 'Chaar Diwaari, Indian Ocean, Gini',
    duration: 288,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    coverArtUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80',
    lyricSnippet: 'Kanha, yeh khela hai kya? Jalte chiraagon mein tu jo mila...',
    chapter: 'Immortality',
    stageClass: 'stage-immortality',
    hindiStage: 'अमरता',
    description: 'Annihilation (Fana) becomes Immortality (Baqaa). The separate self fades away.',
    spotifyUrl: 'https://open.spotify.com/track/5VmmaElvu2KTB0mpUSGlMy',
    titleEn: '06. IMMORTALITY',
    stageSubtitle: 'I Became the Light',
    narrativeStage: 'Immortality',
    poetryHindi: [
      'Jo parvana tha,',
      'ab roshni ban gaya.',
      'Ab na jalna, na marna,',
      'bas rehna... hamesha.'
    ],
    bottomQuote: 'I didn\'t just love the light. I became it.'
  }
];

// Helper to generate sigmoidal distortion curve for Kashish saturation
function makeDistortionCurve(amount) {
  const k = typeof amount === 'number' ? amount : 50;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    // Sigmoid distortion equation
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

function formatTime(secs) {
  if (isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function App() {
  const [currentTrack, setCurrentTrack] = useState(PARVANA_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFlameOn, setIsFlameOn] = useState(true);
  const [flameIntensity, setFlameIntensity] = useState(1.4);
  const flameValRef = useRef({ val: 1.4 });
  const flickerTweenRef = useRef(null);
  const audioBandsRef = useRef({ bass: 0.0, mid: 0.0, high: 0.0 });
  const [showSmoke, setShowSmoke] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Portal State & Transition
  const [isPortalOpen, setIsPortalOpen] = useState(false);

  useEffect(() => {
    if (isPortalOpen) {
      gsap.to('.os-container', {
        opacity: 0,
        duration: 1.2,
        ease: 'power2.inOut',
        onComplete: () => {
          gsap.set('.os-container', { display: 'none', pointerEvents: 'none' });
        }
      });
    } else {
      gsap.set('.os-container', { display: 'grid', pointerEvents: 'auto' });
      gsap.to('.os-container', {
        opacity: 1,
        duration: 1.2,
        ease: 'power2.inOut'
      });
    }
  }, [isPortalOpen]);
  const [activeHoverStage, setActiveHoverStage] = useState(null);

  const containerRef = useRef(null);

  // Pre-amp dial variables
  const [kashishVal, setKashishVal] = useState(65); // Warmth/Saturation dial
  const [junoonVal, setJunoonVal] = useState(48);   // Depth/Bass dial
  const [qurbatVal, setQurbatVal] = useState(72);   // Closeness/Volume dial

  // Drag coordinates for rotary dials
  const activeDialRef = useRef(null);
  const dialStartY = useRef(0);
  const dialStartVal = useRef(0);

  // Audio system refs
  const audioRef = useRef(new Audio());
  const crackleRef = useRef(new VinylCrackle());

  // Web Audio Nodes
  const audioCtxRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const shaperNodeRef = useRef(null);
  const lowShelfNodeRef = useRef(null);
  const gainNodeRef = useRef(null);
  const analyserNodeRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  // VU Levels frequency status
  const [vuLevels, setVuLevels] = useState([0, 0, 0, 0, 0]);

  // Initialize Web Audio pipeline on interaction
  const initAudioCtx = () => {
    if (audioCtxRef.current) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaElementSource(audioRef.current);
      sourceNodeRef.current = source;

      // Saturation (Kashish) Node
      const shaper = ctx.createWaveShaper();
      shaper.curve = makeDistortionCurve(isFlameOn ? (kashishVal * 0.7) : 0);
      shaper.oversample = '4x';
      shaperNodeRef.current = shaper;

      // Bass Boost (Junoon) filter node
      const lowShelf = ctx.createBiquadFilter();
      lowShelf.type = 'lowshelf';
      lowShelf.frequency.setValueAtTime(150, ctx.currentTime);
      const bassGain = (junoonVal / 100) * 18 - 6; // map to -6dB to +12dB
      lowShelf.gain.setValueAtTime(bassGain, ctx.currentTime);
      lowShelfNodeRef.current = lowShelf;

      // Volume (Qurbat) gain node
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(qurbatVal / 100, ctx.currentTime);
      gainNodeRef.current = gain;

      // Analyser Node
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyserNodeRef.current = analyser;

      // Connect nodes
      source.connect(shaper);
      shaper.connect(lowShelf);
      lowShelf.connect(analyser);
      analyser.connect(gain);
      gain.connect(ctx.destination);

      startVuAnalysis();
    } catch (e) {
      console.warn("Failed to initialize Web Audio:", e);
    }
  };

  // Run the frequency analysis loop
  const startVuAnalysis = () => {
    const analyser = analyserNodeRef.current;
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!audioCtxRef.current) return;
      analyser.getByteFrequencyData(dataArray);

      // Map frequencies to 5 vertical channels
      const bands = [0, 0, 0, 0, 0];
      const step = Math.floor(bufferLength / 5);

      for (let i = 0; i < 5; i++) {
        let sum = 0;
        for (let j = 0; j < step; j++) {
          sum += dataArray[i * step + j];
        }
        const avg = sum / step;
        // Scale to 0-10 dots
        bands[i] = Math.min(10, Math.floor((avg / 255) * 11));
      }

      // Extract frequency band values for WebGL audio reactivity (bass, mid, high)
      let bassSum = 0;
      for (let i = 0; i < 5; i++) bassSum += dataArray[i];
      audioBandsRef.current.bass = bassSum / (5 * 255);

      let midSum = 0;
      for (let i = 5; i < 16; i++) midSum += dataArray[i];
      audioBandsRef.current.mid = midSum / (11 * 255);

      let highSum = 0;
      for (let i = 16; i < 32; i++) highSum += dataArray[i];
      audioBandsRef.current.high = highSum / (16 * 255);

      setVuLevels(bands);
      animationFrameIdRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  // Volumetric flame flickering system
  useEffect(() => {
    if (isFlameOn) {
      flickerTweenRef.current?.kill();
      
      // Warm ignition/fade-in to baseline intensity 1.4
      flickerTweenRef.current = gsap.to(flameValRef.current, {
        val: 1.4,
        duration: 1.5,
        ease: 'power1.out',
        onUpdate: () => {
          setFlameIntensity(flameValRef.current.val);
        },
        onComplete: () => {
          // Recursive organic flickering loop
          const runFlicker = () => {
            if (!isFlameOn) return;
            const targetVal = 1.0 + Math.random() * 0.8;
            const duration = 0.08 + Math.random() * 0.12;
            
            flickerTweenRef.current = gsap.to(flameValRef.current, {
              val: targetVal,
              duration: duration,
              ease: 'power1.inOut',
              onUpdate: () => {
                setFlameIntensity(flameValRef.current.val);
              },
              onComplete: runFlicker
            });
          };
          runFlicker();
        }
      });
    } else {
      // Warm fade-out/extinguish over 2s
      flickerTweenRef.current?.kill();
      flickerTweenRef.current = gsap.to(flameValRef.current, {
        val: 0.0,
        duration: 2.0,
        ease: 'power2.out',
        onUpdate: () => {
          setFlameIntensity(flameValRef.current.val);
        }
      });
    }

    return () => {
      flickerTweenRef.current?.kill();
    };
  }, [isFlameOn]);

  // Sync state variables with Audio Node parameters
  useEffect(() => {
    if (shaperNodeRef.current) {
      const distCurve = isFlameOn ? (kashishVal * 0.7) : 0;
      shaperNodeRef.current.curve = makeDistortionCurve(distCurve);
    }
  }, [kashishVal, isFlameOn]);

  useEffect(() => {
    if (lowShelfNodeRef.current && audioCtxRef.current) {
      const bassGain = (junoonVal / 100) * 18 - 6;
      lowShelfNodeRef.current.gain.setValueAtTime(bassGain, audioCtxRef.current.currentTime);
    }
  }, [junoonVal]);

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(qurbatVal / 100, audioCtxRef.current.currentTime);
    }
  }, [qurbatVal]);

  // Sync track loading
  useEffect(() => {
    if (currentTrack) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrack]);

  // Handle Play/Pause
  useEffect(() => {
    if (isPlaying) {
      initAudioCtx();
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    const tickTime = () => setCurrentTime(audio.currentTime);
    const setMeta = () => setDuration(audio.duration || 0);
    const onEnd = () => handleNextTrack();

    audio.addEventListener('timeupdate', tickTime);
    audio.addEventListener('loadedmetadata', setMeta);
    audio.addEventListener('ended', onEnd);

    return () => {
      audio.removeEventListener('timeupdate', tickTime);
      audio.removeEventListener('loadedmetadata', setMeta);
      audio.removeEventListener('ended', onEnd);
    };
  }, [currentTrack]);

  // Crackle Playback Sync
  useEffect(() => {
    if (isPlaying && isFlameOn) {
      crackleRef.current.start((qurbatVal / 100) * 0.22);
    } else {
      crackleRef.current.stop();
    }
  }, [isPlaying, isFlameOn, qurbatVal]);

  // Clear intervals and requestAnimationFrame loops on unmount
  useEffect(() => {
    return () => {
      crackleRef.current.stop();
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, []);

  // Track Select Navigation
  const handleTrackSelect = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const handlePrevTrack = () => {
    const idx = PARVANA_TRACKS.findIndex((t) => t.id === currentTrack.id);
    const prev = idx - 1 < 0 ? PARVANA_TRACKS.length - 1 : idx - 1;
    setCurrentTrack(PARVANA_TRACKS[prev]);
    setIsPlaying(true);
  };

  const handleNextTrack = () => {
    const idx = PARVANA_TRACKS.findIndex((t) => t.id === currentTrack.id);
    const next = (idx + 1) % PARVANA_TRACKS.length;
    setCurrentTrack(PARVANA_TRACKS[next]);
    setIsPlaying(true);
  };

  const handleTimelineChange = (e) => {
    const t = parseFloat(e.target.value);
    audioRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const handleFlameToggle = () => {
    if (isFlameOn) {
      setIsFlameOn(false);
      setShowSmoke(true);
      setTimeout(() => setShowSmoke(false), 4500);
    } else {
      setIsFlameOn(true);
      setShowSmoke(false);
    }
  };

  // Dial Drag Handlers
  const startDialDrag = (dial, e) => {
    initAudioCtx(); // safety trigger
    activeDialRef.current = dial;
    dialStartY.current = e.clientY;
    
    if (dial === 'kashish') dialStartVal.current = kashishVal;
    if (dial === 'junoon') dialStartVal.current = junoonVal;
    if (dial === 'qurbat') dialStartVal.current = qurbatVal;

    document.addEventListener('mousemove', handleDialDrag);
    document.addEventListener('mouseup', stopDialDrag);
  };

  const handleDialDrag = (e) => {
    const dial = activeDialRef.current;
    if (!dial) return;

    const deltaY = dialStartY.current - e.clientY;
    const nextVal = Math.min(100, Math.max(0, dialStartVal.current + deltaY * 0.65));

    if (dial === 'kashish') setKashishVal(nextVal);
    if (dial === 'junoon') setJunoonVal(nextVal);
    if (dial === 'qurbat') setQurbatVal(nextVal);
  };

  const stopDialDrag = () => {
    activeDialRef.current = null;
    document.removeEventListener('mousemove', handleDialDrag);
    document.removeEventListener('mouseup', stopDialDrag);
  };

  const getDialAngle = (val) => (val / 100) * 270 - 135;

  // ── Theme Engine Morphing effect (GSAP variables interpolation) ──
  useEffect(() => {
    if (!containerRef.current || !currentTrack) return;
    const theme = STAGE_THEMES[currentTrack.id];
    if (!theme) return;

    // Morph the custom CSS variables over 3 seconds
    gsap.to(containerRef.current, {
      ...theme,
      duration: 3,
      ease: 'power2.out'
    });
  }, [currentTrack.id]);

  // ── Stage 3 Subconscious Blur Pulse (Removed to maintain screen clarity) ──

  // Determine currently active class state for ambient color transitions
  const activeStageClass = activeHoverStage 
    ? PARVANA_TRACKS.find(t => t.id === activeHoverStage)?.stageClass 
    : currentTrack.stageClass;

  return (
    <div ref={containerRef} className={`listening-room ${isFlameOn ? 'theme-warm' : 'theme-cold'} ${activeStageClass}`}>
      
      {/* WebGL Atmosphere Background System */}
      <AtmosphereCanvas
        currentTrackId={currentTrack.id}
        isFlameOn={isFlameOn}
        flameIntensity={flameIntensity}
        audioBandsRef={audioBandsRef}
        currentTime={currentTime}
        duration={duration}
        isPortalOpen={isPortalOpen}
      />

      {/* Portal Exit Button overlay */}
      {isPortalOpen && (
        <button
          onClick={() => setIsPortalOpen(false)}
          className="absolute top-8 right-10 font-serif italic text-sm tracking-widest hover:text-[var(--color-accent)] transition-colors duration-300 z-50 pointer-events-auto bg-transparent border border-[var(--border-copper)] px-4 py-1.5 cursor-pointer text-[var(--color-text-primary)]"
          style={{ textShadow: 'var(--typography-glow)' }}
        >
          [ Exit Portal ]
        </button>
      )}

      {/* Dynamic Ambient Glow */}
      <div className="ambient-glow" />

      {/* Dynamic Top Center Stage Header */}
      <div className="absolute top-8 left-0 right-0 flex justify-center pointer-events-none z-30 select-none">
        <div className="flex flex-col items-center text-center">
          <span className="font-sans text-[7.5px] font-bold tracking-[0.35em] text-[var(--color-text-muted)] uppercase mb-1">
            PARVANA OS - EMOTIONAL PHASES
          </span>
          <span className="font-serif italic text-[11px] tracking-[0.06em]" style={{ color: 'var(--color-accent)', textShadow: 'var(--typography-glow)' }}>
            {currentTrack.titleEn} &mdash; {currentTrack.stageSubtitle}
          </span>
        </div>
      </div>





      {/* ── 3-PANEL INTERACTIVE OPERATING SYSTEM ── */}
      <div className="os-container">
        
        {/* ── LEFT PANEL: NAVIGATION & PROGRESSION ── */}
        <aside className="os-panel">
          <div className="flex flex-col gap-6 h-full justify-between">
            
            {/* System brand header */}
            <div className="flex flex-col gap-1">
              <span className="os-sub" style={{ color: 'var(--color-text-muted)' }}>Analogue Deck</span>
              <h1 className="os-title" style={{ color: 'var(--color-text-primary)' }}>Parvana OS</h1>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-accent)', letterSpacing: '0.15em' }}>परवाना</span>
            </div>

            {/* High-Fidelity Narrative Stage & Hindi Poetry */}
            <div className="flex flex-col gap-2.5 my-1">
              <span className="font-sans text-[8px] font-bold tracking-[0.22em] uppercase" style={{ color: 'var(--color-text-muted)' }}>
                NARRATIVE STAGE
              </span>
              <h2 className="font-serif text-2xl font-light leading-none capitalize" style={{ color: 'var(--color-accent)', textShadow: 'var(--typography-glow)' }}>
                {currentTrack.narrativeStage}
              </h2>
              
              <div className="flex flex-col gap-1 mt-2.5 pl-4 border-l border-[var(--border-copper)] font-serif italic text-[14.5px] leading-relaxed select-none" style={{ color: 'var(--color-text-secondary)' }}>
                {currentTrack.poetryHindi.map((line, idx) => (
                  <p key={idx} className="m-0 tracking-wide">{line}</p>
                ))}
              </div>
            </div>

            {/* Antique index track progression */}
            <nav className="flex flex-col custom-scroll overflow-y-auto pr-1" style={{ maxHeight: '240px' }}>
              {PARVANA_TRACKS.map((track, index) => {
                const isActive = currentTrack.id === track.id;
                return (
                  <div
                    key={track.id}
                    className="chapter-item flex items-center justify-between"
                    style={{ opacity: isActive ? 1.0 : 0.42 }}
                    onClick={() => handleTrackSelect(track)}
                    onMouseEnter={() => setActiveHoverStage(track.id)}
                    onMouseLeave={() => setActiveHoverStage(null)}
                  >
                    <div className="flex items-center gap-6">
                      <span 
                        className="chapter-number"
                        style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-primary)' }}
                      >
                        0{index + 1}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <span 
                          className="chapter-title"
                          style={{ color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
                        >
                          {track.title}
                        </span>
                        <span className="chapter-meta" style={{ color: 'var(--color-text-muted)' }}>
                          Stage 0{index + 1} &bull; {track.chapter}
                        </span>
                      </div>
                    </div>
                    <span className="chapter-hindi" style={{ color: 'var(--color-accent)' }}>
                      {track.hindiStage}
                    </span>
                  </div>
                );
              })}
            </nav>

            {/* Poetic bottom stage quote */}
            <div className="flex flex-col justify-center items-center py-3 px-1 text-center border-t border-[var(--border-copper)]">
              <p className="font-serif italic text-[13px] leading-snug tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
                "{currentTrack.bottomQuote}"
              </p>
            </div>

            {/* Sidebar directory links */}
            <div 
              className="flex justify-between items-center pt-4"
              style={{ borderTop: '1px solid var(--border-copper)', fontSize: '7.5px', fontWeight: 900, tracking: '0.15em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}
            >
              <span>VALVE DECK</span>
              <span>STAGES</span>
              <span>SHAMA SIGNAL</span>
            </div>

          </div>
        </aside>

        {/* ── CENTER PANEL: MASSIVE VINYL DECK ── */}
        <main className="os-center-viewport">
          <div className="flex flex-col items-center">
            
            {/* Platter component */}
            <Turntable 
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              currentTime={currentTime}
              duration={duration}
              isFlameOn={isFlameOn}
              flameIntensity={flameIntensity}
              audioBandsRef={audioBandsRef}
              onPortalTrigger={() => setIsPortalOpen(true)}
            />

            {/* Timeline track progress */}
            <div className="w-full max-w-[420px] flex flex-col items-center gap-2.5 mt-8 z-20">
              <input
                type="range"
                className="timeline-slider"
                min="0"
                max={duration || 1}
                value={currentTime}
                onChange={handleTimelineChange}
              />
              <div className="flex justify-between w-full font-mono text-[9px]" style={{ color: 'var(--color-text-muted)' }}>
                <span>{formatTime(currentTime)}</span>
                <span className="font-serif italic" style={{ letterSpacing: '0.04em' }}>
                  {isPlaying ? 'fading into light...' : 'even if it burns.'}
                </span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Phase Navigation steps list */}
            <div className="flex justify-center items-center gap-6 mt-6 z-20 font-sans text-[8px] font-bold tracking-[0.2em] select-none text-[var(--color-text-muted)] border-t border-b border-[var(--border-copper)] py-2.5 w-full max-w-[420px]">
              {['ATTRACTION', 'LONGING', 'OBSESSION', 'DESTRUCTION', 'IMMORTALITY'].map((phase, idx) => {
                const trackIndices = {
                  '0': ['1'],
                  '1': ['2'],
                  '2': ['3'],
                  '3': ['4', '5'],
                  '4': ['6']
                };
                const isCurrent = trackIndices[idx].includes(currentTrack.id);
                return (
                  <span 
                    key={phase} 
                    className="transition-colors duration-500"
                    style={{ color: isCurrent ? 'var(--color-accent)' : 'inherit' }}
                  >
                    {phase}
                  </span>
                );
              })}
            </div>

            {/* Spotify search redirect */}
            <div className="mt-5 z-20">
              <a
                href={currentTrack.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-serif italic text-[10px] opacity-45 hover:opacity-90 hover:text-[var(--color-accent)] transition-all duration-300"
                style={{ letterSpacing: '0.08em', textDecoration: 'none' }}
              >
                [ Seek complete union on Spotify ]
              </a>
            </div>

          </div>
        </main>

        {/* ── RIGHT PANEL: HI-FI PRE-AMP CONSOLE ── */}
        <aside className="os-panel os-panel-right">
          <div className="flex flex-col justify-between h-full py-2 items-center">
            
            {/* Now Playing visual sleeve */}
            <div className="flex flex-col items-center select-none w-full">
              <span className="os-sub mb-3" style={{ color: 'var(--color-text-muted)' }}>Current Chapter</span>
              <div 
                className="w-full relative overflow-hidden"
                style={{
                  maxWidth: '240px',
                  background: '#0c0a09',
                  border: '1px solid var(--border-copper)',
                  boxShadow: '0 15px 30px rgba(0,0,0,0.5)',
                  borderRadius: '12px'
                }}
              >
                <iframe 
                  src={`https://open.spotify.com/embed/track/${currentTrack.spotifyUrl.split('/track/')[1].split('?')[0]}?utm_source=generator&theme=0`} 
                  width="100%" 
                  height="152" 
                  frameBorder="0" 
                  allowFullScreen="" 
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                  loading="lazy"
                  style={{ display: 'block' }}
                />
              </div>
            </div>

            {/* Vacuum Tube Flame component (Master analogue toggle) */}
            <div className="flex flex-col items-center gap-2">
              <div className="vacuum-tube-valve" onClick={handleFlameToggle}>
                <FlameValve3D isFlameOn={isFlameOn} flameIntensity={flameIntensity} audioBandsRef={audioBandsRef} />
                {showSmoke && <div className="smoke-wisp" />}
              </div>
              <div className="vacuum-tube-base" />
              <span className="dial-label-engraved mt-1">SHAMAA VALVE</span>
              <span className="dial-stage-sub">{isFlameOn ? 'Warm Analogue' : 'Cold Digital'}</span>
            </div>

            {/* Rotary Dials for Web Audio parameters */}
            <div className="flex justify-around items-center w-full gap-4">
              
              {/* Kashish (Attraction / Saturation) */}
              <div className="copper-knob-plate" onMouseDown={(e) => startDialDrag('kashish', e)}>
                <div className="copper-knob-ring">
                  <div 
                    className="copper-knob-dial"
                    style={{ transform: `rotate(${getDialAngle(kashishVal)}deg)` }}
                  >
                    <span className="copper-knob-dot" />
                  </div>
                </div>
                <span className="dial-label-engraved">KASHISH</span>
                <span className="dial-stage-sub">Attraction</span>
              </div>

              {/* Junoon (Obsession / Depth) */}
              <div className="copper-knob-plate" onMouseDown={(e) => startDialDrag('junoon', e)}>
                <div className="copper-knob-ring">
                  <div 
                    className="copper-knob-dial"
                    style={{ transform: `rotate(${getDialAngle(junoonVal)}deg)` }}
                  >
                    <span className="copper-knob-dot" />
                  </div>
                </div>
                <span className="dial-label-engraved">JUNOON</span>
                <span className="dial-stage-sub">Obsession</span>
              </div>

              {/* Qurbat (Closeness / Gain) */}
              <div className="copper-knob-plate" onMouseDown={(e) => startDialDrag('qurbat', e)}>
                <div className="copper-knob-ring">
                  <div 
                    className="copper-knob-dial"
                    style={{ transform: `rotate(${getDialAngle(qurbatVal)}deg)` }}
                  >
                    <span className="copper-knob-dot" />
                  </div>
                </div>
                <span className="dial-label-engraved">QURBAT</span>
                <span className="dial-stage-sub">Closeness</span>
              </div>

            </div>

            {/* Real-time Jumping VU meter console */}
            <div className="flex flex-col items-center gap-2 select-none w-full px-2">
              <div className="vu-rack w-full">
                {vuLevels.map((level, idx) => (
                  <div key={idx} className="vu-bar">
                    {Array.from({ length: 10 }).map((_, dotIdx) => {
                      const isActive = level > dotIdx;
                      let activeClass = '';
                      if (isActive) {
                        if (dotIdx < 6) activeClass = 'level-active-low';
                        else if (dotIdx < 9) activeClass = 'level-active-mid';
                        else activeClass = 'level-active-high';
                      }
                      return (
                        <div 
                          key={dotIdx} 
                          className={`vu-dot ${activeClass}`} 
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              <span className="dial-label-engraved">DECIBELS AMPLITUDE</span>
            </div>

            {/* Editorial triggers */}
            <div className="flex items-center gap-6 mt-2 select-none">
              <button 
                className="font-serif text-[10px] uppercase tracking-[0.1em]" 
                style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={handlePrevTrack}
              >
                Look Back
              </button>
              <button 
                className="poetic-trigger-btn"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? 'Freeze' : 'Come Closer'}
              </button>
              <button 
                className="font-serif text-[10px] uppercase tracking-[0.1em]" 
                style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={handleNextTrack}
              >
                Step Closer
              </button>
            </div>

          </div>
        </aside>

      </div>

      {/* Floating footer watermark */}
      <footer 
        className="absolute bottom-4 left-10 right-10 flex justify-between items-center z-10 pointer-events-none"
        style={{ fontSize: '7.5px', textTransform: 'uppercase', letterSpacing: '0.25em', color: 'var(--color-text-muted)', opacity: 0.5 }}
      >
        <span>Stay Until The Light Fades.</span>
        <span>Parvana listening ritual &copy; 2026</span>
      </footer>

    </div>
  );
}
