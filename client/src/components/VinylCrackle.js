// Web Audio API Synthesizer for Analogue Vinyl Crackles and Pops
// Creates a looping audio buffer of filtered white noise + micro impulse crackles.

export default class VinylCrackle {
  constructor() {
    this.ctx = null;
    this.crackleSource = null;
    this.gainNode = null;
    this.isPlaying = false;
    this.buffer = null;
  }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    const sampleRate = this.ctx.sampleRate;
    const duration = 5.0; // 5 seconds of unique crackle before loop
    const bufferSize = sampleRate * duration;
    
    // Create mono audio buffer
    this.buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = this.buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // 1. Core continuous background hiss (very soft)
      let hiss = (Math.random() * 2 - 1) * 0.008;

      // 2. Random clicks & pops
      let pop = 0;
      if (Math.random() < 0.00006) {
        // Generate a sharp spike followed by exponential decay
        const popLength = Math.floor(Math.random() * 60) + 15;
        const popStrength = (Math.random() * 0.18 + 0.04) * (Math.random() < 0.5 ? 1 : -1);
        
        for (let j = 0; j < popLength && (i + j) < bufferSize; j++) {
          data[i + j] += popStrength * Math.exp(-j / 8);
        }
      }

      data[i] += hiss;
    }

    // Set up gain nodes for smooth fading
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);

    // Warmth filter: lowpass at 900Hz to make it sound muffled and old
    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(900, this.ctx.currentTime);

    // Highpass filter to remove rumble below 80Hz
    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(80, this.ctx.currentTime);

    this.gainNode.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(this.ctx.destination);
  }

  start(volume = 0.18) {
    this.init();
    if (this.isPlaying) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.crackleSource = this.ctx.createBufferSource();
    this.crackleSource.buffer = this.buffer;
    this.crackleSource.loop = true;

    this.crackleSource.connect(this.gainNode);
    this.crackleSource.start(0);

    // Fade in
    this.gainNode.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.6);
    this.isPlaying = true;
  }

  stop() {
    if (!this.isPlaying || !this.crackleSource) return;

    // Fade out to prevent sudden cut-offs
    this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
    
    const sourceToStop = this.crackleSource;
    this.crackleSource = null;
    this.isPlaying = false;

    setTimeout(() => {
      try {
        sourceToStop.stop();
        sourceToStop.disconnect();
      } catch (err) {
        // Source might have already been stopped
      }
    }, 600);
  }

  setVolume(volume) {
    if (!this.gainNode || !this.ctx) return;
    this.gainNode.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.15);
  }
}
