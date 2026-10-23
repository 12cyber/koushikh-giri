import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, Sliders, Sparkles } from 'lucide-react';
import { generateFibonacciSequence, PHI } from '../utils/fibonacciMath';
import { harmonicAudio } from '../utils/harmonicAudio';
import { ScrollReveal } from './ScrollReveal';

type ScaleMode = 'pentatonic' | 'lydian' | 'phi-series';

interface NoteStep {
  n: number;
  fib: number;
  noteName: string;
  freq: number;
}

const SCALES: Record<ScaleMode, { name: string; notes: Array<{ label: string; freq: number }> }> = {
  pentatonic: {
    name: 'Golden Pentatonic (432 Hz Root)',
    notes: [
      { label: 'C4', freq: 256.87 },
      { label: 'D4', freq: 288.33 },
      { label: 'E4', freq: 323.63 },
      { label: 'G4', freq: 384.87 },
      { label: 'A4', freq: 432.0 },
      { label: 'C5', freq: 513.74 },
      { label: 'D5', freq: 576.65 },
      { label: 'E5', freq: 647.27 },
    ],
  },
  lydian: {
    name: 'Lydian Harmonic Mode',
    notes: [
      { label: 'F4', freq: 349.23 },
      { label: 'G4', freq: 392.0 },
      { label: 'A4', freq: 440.0 },
      { label: 'B4', freq: 493.88 },
      { label: 'C5', freq: 523.25 },
      { label: 'D5', freq: 587.33 },
      { label: 'E5', freq: 659.25 },
      { label: 'F5', freq: 698.46 },
    ],
  },
  'phi-series': {
    name: 'Pure φ Frequency Powers (f₀ · φᵏ)',
    notes: [
      { label: 'f₀', freq: 220.0 },
      { label: 'f₀·φ⁰·⁵', freq: 220.0 * Math.sqrt(PHI) },
      { label: 'f₀·φ¹', freq: 220.0 * PHI },
      { label: 'f₀·φ¹·⁵', freq: 220.0 * Math.pow(PHI, 1.5) },
      { label: 'f₀·φ²', freq: 220.0 * Math.pow(PHI, 2) },
      { label: 'f₀·φ²·⁵', freq: 220.0 * Math.pow(PHI, 2.5) },
      { label: 'f₀·φ³', freq: 220.0 * Math.pow(PHI, 3) },
    ],
  },
};

const SEQ_16 = generateFibonacciSequence(16);

export const SectionFibonacciMusicLab: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [scaleMode, setScaleMode] = useState<ScaleMode>('pentatonic');
  const [bpm, setBpm] = useState<number>(112);
  const [includePhiChord, setIncludePhiChord] = useState<boolean>(true);
  const [waveform, setWaveform] = useState<'sine' | 'triangle'>('sine');

  const oscCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeFreqRef = useRef<number>(432.0);
  const pulseEnergyRef = useRef<number>(0.2);

  const currentScale = SCALES[scaleMode];

  const steps: NoteStep[] = SEQ_16.map((fib, n) => {
    const noteObj = currentScale.notes[fib % currentScale.notes.length];
    return {
      n,
      fib,
      noteName: noteObj.label,
      freq: noteObj.freq,
    };
  });

  const currentNote = steps[activeStep] || steps[0];

  const triggerStepSound = (stepObj: NoteStep) => {
    activeFreqRef.current = stepObj.freq;
    pulseEnergyRef.current = 1.0;
    harmonicAudio.playSynthNote(stepObj.freq, 0.36, includePhiChord, waveform);
  };

  // Sequencer clock loop
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.round((60 / bpm / 2) * 1000);

    const timer = setInterval(() => {
      setActiveStep((prev) => {
        const next = (prev + 1) % steps.length;
        const stepObj = steps[next];
        if (stepObj) {
          activeFreqRef.current = stepObj.freq;
          pulseEnergyRef.current = 1.0;
          harmonicAudio.playSynthNote(stepObj.freq, 0.34, includePhiChord, waveform);
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, bpm, scaleMode, includePhiChord, waveform]);

  // 60fps Oscilloscope & Golden Harmonic Wave Canvas
  useEffect(() => {
    const canvas = oscCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;
    const timeData = new Uint8Array(256);

    const renderWave = () => {
      const width = canvas.parentElement?.clientWidth || 640;
      const height = 170;
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Subtle oscilloscope grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      const hasLiveAudio = harmonicAudio.getWaveformData(timeData);
      pulseEnergyRef.current = Math.max(0.18, pulseEnergyRef.current * 0.95);
      phase += 0.055;

      const freqRatio = activeFreqRef.current / 260;

      // Primary Fundamental Wave (Cyan)
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const t = x / width;
        const envelope = Math.sin(t * Math.PI);
        let yOffset = 0;

        if (hasLiveAudio && isPlaying) {
          const bufIdx = Math.floor(t * (timeData.length - 1));
          const sample = (timeData[bufIdx] - 128) / 128;
          yOffset = sample * 52;
        }

        const synthWave =
          Math.sin(t * Math.PI * 6 * freqRatio + phase) *
          34 *
          pulseEnergyRef.current *
          envelope;

        const y = height / 2 + yOffset + synthWave;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Secondary Golden Ratio Overtone Wave (f * 1.618, Gold)
      if (includePhiChord) {
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const t = x / width;
          const envelope = Math.sin(t * Math.PI);
          const phiWave =
            Math.sin(t * Math.PI * 6 * freqRatio * PHI - phase * PHI) *
            22 *
            pulseEnergyRef.current *
            envelope;
          const y = height / 2 + phiWave;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.78)';
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(renderWave);
    };

    animId = requestAnimationFrame(renderWave);
    return () => cancelAnimationFrame(animId);
  }, [includePhiChord, isPlaying]);

  return (
    <section
      id="section-music-lab"
      className="lab-snap-section relative min-h-screen flex flex-col items-center justify-center py-24 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#03060c] lab-grid-bg select-none overflow-hidden"
    >
      <div className="max-w-6xl mx-auto w-full flex flex-col items-center">
        {/* Clean Editorial Header */}
        <ScrollReveal direction="up" className="w-full text-center mb-8">
          <div className="flex items-center justify-center gap-2 font-mono text-xs tracking-widest text-amber-400 uppercase mb-3">
            <span>06</span>
            <span aria-hidden="true">·</span>
            <span>Fibonacci Acoustic Synthesizer</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-['Arial',sans-serif] font-semibold text-white tracking-wide uppercase mb-3 text-balance">
            HEAR THE SEQUENCE IN HARMONY
          </h2>

          <p className="text-sm sm:text-base text-slate-400 font-mono max-w-2xl mx-auto">
            Map Fibonacci numbers F(n) to musical scale degrees and Golden Ratio overtones (f × φ) in real time.
          </p>
        </ScrollReveal>

        {/* Two-Zone Acoustic Laboratory Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">
          {/* Left 8 Cols: Oscilloscope + 16-Step Fibonacci Sequencer Matrix */}
          <ScrollReveal direction="right" delay={0.06} className="lg:col-span-8 flex">
            <div className="w-full rounded-2xl bg-[#040811] border border-cyan-500/25 p-5 sm:p-6 flex flex-col justify-between gap-6">
              {/* Live Waveform Oscilloscope Header & Readout */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-slate-400 mb-3">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span>Live Acoustic Oscilloscope · Fundamental + φ Overtone</span>
                  </div>
                  <div className="tabular-nums text-cyan-300">
                    Step n = {currentNote.n} · F({currentNote.n}) ={' '}
                    <strong className="text-amber-300">{currentNote.fib}</strong> ·{' '}
                    {currentNote.noteName} ({currentNote.freq.toFixed(1)} Hz)
                  </div>
                </div>

                <div className="w-full h-[170px] rounded-xl bg-[#020408] border border-white/10 overflow-hidden relative">
                  <canvas ref={oscCanvasRef} className="w-full h-[170px] block" />
                </div>
              </div>

              {/* 16-Step Fibonacci Modulo Pads */}
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-slate-400 mb-3">
                  <span>16-Step Fibonacci Sequence Matrix (Click any step to audition)</span>
                  <span className="text-amber-300">
                    Formula: Note = Scale[ F(n) mod {currentScale.notes.length} ]
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 font-mono">
                  {steps.map((stepObj, idx) => {
                    const isCurrent = idx === activeStep;
                    return (
                      <button
                        key={stepObj.n}
                        type="button"
                        onClick={() => {
                          setActiveStep(idx);
                          triggerStepSound(stepObj);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                          isCurrent
                            ? 'bg-[#ff69b4] text-slate-950 border-pink-300 font-bold shadow-[0_0_25px_rgba(255,105,180,0.5)] scale-105'
                            : 'bg-[#070d19] hover:bg-slate-900 text-slate-200 border-white/10 hover:border-cyan-400/50'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] opacity-75 tabular-nums">
                          <span>F({stepObj.n})</span>
                          <span>{stepObj.noteName}</span>
                        </div>
                        <div
                          className={`text-base sm:text-lg font-bold tabular-nums mt-1 ${
                            isCurrent ? 'text-slate-950' : 'text-amber-300'
                          }`}
                        >
                          {stepObj.fib}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Right 4 Cols: Synthesizer Controls */}
          <ScrollReveal direction="left" delay={0.12} className="lg:col-span-4 flex">
            <div className="w-full rounded-2xl bg-[#050a14] border border-white/10 p-6 flex flex-col justify-between gap-6">
              <div className="space-y-6">
                {/* 1. Primary Play / Stop Sequencer */}
                <div>
                  <div className="font-mono text-xs text-cyan-400 uppercase tracking-widest mb-2.5">
                    1. Sequencer Transport
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !isPlaying;
                        setIsPlaying(nextState);
                        if (nextState) {
                          triggerStepSound(steps[activeStep]);
                        }
                      }}
                      className={`flex-1 py-3.5 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        isPlaying
                          ? 'bg-[#ff69b4] hover:bg-pink-300 text-slate-950 shadow-[0_0_25px_rgba(255,105,180,0.45)]'
                          : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>{isPlaying ? 'PAUSE SYNTH' : 'PLAY FIBONACCI MELODY'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setActiveStep(0);
                      }}
                      className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 cursor-pointer transition-colors"
                      title="Reset to F(0)"
                      aria-label="Reset to F(0)"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 2. Scale & Harmonic Mode */}
                <div>
                  <div className="font-mono text-xs text-slate-300 mb-2">
                    2. Mathematical Scale Mapping
                  </div>
                  <div className="grid grid-cols-1 gap-2 font-mono text-xs">
                    {(Object.keys(SCALES) as ScaleMode[]).map((key) => {
                      const active = scaleMode === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setScaleMode(key);
                            const nextNote =
                              SCALES[key].notes[
                                SEQ_16[activeStep] % SCALES[key].notes.length
                              ];
                            harmonicAudio.playSynthNote(
                              nextNote.freq,
                              0.32,
                              includePhiChord,
                              waveform
                            );
                          }}
                          className={`px-3.5 py-2.5 rounded-xl border text-left transition-colors cursor-pointer whitespace-nowrap ${
                            active
                              ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 font-bold'
                              : 'bg-slate-900 text-slate-400 hover:text-white border-white/10'
                          }`}
                        >
                          {SCALES[key].name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Tempo Control */}
                <div>
                  <div className="flex items-center justify-between font-mono text-xs mb-1.5">
                    <label htmlFor="synth-bpm-slider" className="text-slate-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Tempo (BPM)</span>
                    </label>
                    <span className="text-amber-300 font-bold tabular-nums">{bpm} BPM</span>
                  </div>
                  <input
                    id="synth-bpm-slider"
                    type="range"
                    min="68"
                    max="168"
                    value={bpm}
                    onChange={(e) => setBpm(parseInt(e.target.value, 10))}
                    className="w-full accent-cyan-400 h-2 bg-slate-900 rounded-lg cursor-pointer"
                  />
                </div>

                {/* 4. Golden Ratio Overtone & Timbre */}
                <div className="space-y-3">
                  <div className="font-mono text-xs text-slate-300">
                    3. Harmonic Overtone &amp; Timbre
                  </div>

                  <button
                    type="button"
                    onClick={() => setIncludePhiChord((prev) => !prev)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      includePhiChord
                        ? 'bg-[#ff69b4] border-pink-300 text-slate-950 font-bold shadow-[0_0_15px_rgba(255,105,180,0.35)]'
                        : 'bg-slate-900 border-white/10 text-slate-400'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className={`w-3.5 h-3.5 ${includePhiChord ? 'text-slate-950' : 'text-amber-400'}`} />
                      <span>φ Golden Overtone (f × 1.618)</span>
                    </span>
                    <span>{includePhiChord ? 'ON' : 'OFF'}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                    {(['sine', 'triangle'] as const).map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setWaveform(w)}
                        className={`py-2 rounded-lg border uppercase transition-colors cursor-pointer ${
                          waveform === w
                            ? 'bg-cyan-400 text-slate-950 font-bold border-cyan-300'
                            : 'bg-slate-900 text-slate-400 hover:text-white border-white/10'
                        }`}
                      >
                        {w} Wave
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 font-mono text-xs text-slate-400 leading-relaxed">
                Because Fibonacci remainders modulo m form periodic Pisano cycles, mapping F(n) to a musical scale creates self-similar repeating melodies!
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
