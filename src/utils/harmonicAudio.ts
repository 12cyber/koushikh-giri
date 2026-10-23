/**
 * Procedural Web Audio Harmonic Chime & Fibonacci Synthesizer Engine
 * Uses pure Web Audio API oscillators and filters (zero external audio asset files).
 */

import { PHI } from './fibonacciMath';

type SoundListener = (enabled: boolean) => void;

class HarmonicAudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private soundEnabled = true;
  private listeners: Set<SoundListener> = new Set();

  // C4 Pentatonic / Lydian frequencies in Hz for pleasant mathematical chimes
  private readonly CHIME_FREQUENCIES = [
    261.63, // C4
    293.66, // D4
    329.63, // E4
    392.0,  // G4
    440.0,  // A4
    523.25, // C5
    587.33, // D5
    659.25, // E5
    783.99, // G5
    880.0,  // A5
    1046.5, // C6
  ];

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.85;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.22;
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public setEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    this.listeners.forEach((fn) => fn(this.soundEnabled));
  }

  public toggle(): boolean {
    this.setEnabled(!this.soundEnabled);
    if (this.soundEnabled) {
      this.playChime('step', 5);
    }
    return this.soundEnabled;
  }

  public subscribe(fn: SoundListener): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  /**
   * Plays a subtle crystalline harmonic chime for UI interactions
   */
  public playChime(
    type: 'step' | 'discover' | 'success' | 'error' | 'spiral' | 'slide' | 'phi',
    index = 0
  ): void {
    if (!this.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;

    if (type === 'step' || type === 'slide') {
      const freq = this.CHIME_FREQUENCIES[Math.abs(index) % this.CHIME_FREQUENCIES.length];
      this.triggerTone(freq, now, 0.16, 0.14, 'sine');
      this.triggerTone(freq * PHI, now + 0.02, 0.14, 0.05, 'triangle');
    } else if (type === 'spiral' || type === 'phi') {
      const freq = this.CHIME_FREQUENCIES[Math.abs(index) % this.CHIME_FREQUENCIES.length];
      this.triggerTone(freq, now, 0.28, 0.18, 'sine');
      this.triggerTone(freq * PHI, now + 0.035, 0.25, 0.09, 'triangle');
    } else if (type === 'discover' || type === 'success') {
      // Ascending Fibonacci interval chord (Indices 1, 2, 3, 5, 8)
      const chordIndices = [0, 2, 3, 5, 8];
      chordIndices.forEach((ci, stepIdx) => {
        const freq = this.CHIME_FREQUENCIES[ci % this.CHIME_FREQUENCIES.length];
        this.triggerTone(freq, now + stepIdx * 0.055, 0.42, 0.16, 'sine');
      });
    } else if (type === 'error') {
      this.triggerTone(196.0, now, 0.2, 0.14, 'triangle');
      this.triggerTone(185.0, now + 0.07, 0.22, 0.12, 'triangle');
    }
  }

  /**
   * Plays a musical note in the Fibonacci Music & Harmonic Synth Explorer
   * Always plays when user explicitly triggers the Music Synth Lab
   */
  public playSynthNote(
    freq: number,
    durationSec = 0.35,
    includePhiHarmonic = true,
    waveform: OscillatorType = 'sine'
  ): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    this.triggerTone(freq, now, durationSec, 0.28, waveform);

    if (includePhiHarmonic) {
      // Golden Ratio harmonic overtone (f * 1.6180339887)
      this.triggerTone(freq * PHI, now + 0.015, durationSec * 0.85, 0.11, 'sine');
      // Perfect fifth sub-anchor (f * 1.5)
      this.triggerTone(freq * 0.5, now, durationSec * 0.9, 0.1, 'triangle');
    }
  }

  private triggerTone(
    freq: number,
    startTime: number,
    duration: number,
    peakGain: number,
    type: OscillatorType
  ): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(60, Math.min(4000, freq)), startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  /**
   * Reads real-time waveform data from the Web Audio AnalyserNode
   */
  public getWaveformData(targetArray: Uint8Array<ArrayBuffer>): boolean {
    if (!this.analyser || !this.ctx || this.ctx.state !== 'running') {
      return false;
    }
    this.analyser.getByteTimeDomainData(targetArray);
    return true;
  }
}

export const harmonicAudio = new HarmonicAudioEngine();
