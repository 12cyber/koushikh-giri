import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { harmonicAudio } from '../utils/harmonicAudio';

const GROWTH_SEQUENCE = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];

export const Section3Growth: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(6);
  const [speed, setSpeed] = useState<'SLOW' | 'NORMAL' | 'FAST'>('NORMAL');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const speedIntervals = {
    SLOW: 1900,
    NORMAL: 1050,
    FAST: 480,
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep((prev) => (prev >= GROWTH_SEQUENCE.length - 1 ? 0 : prev + 1));
      }, speedIntervals[speed]);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  const activeValue = GROWTH_SEQUENCE[currentStep];

  return (
    <section
      id="section-growth"
      className="relative min-h-screen flex flex-col items-center justify-center py-24 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#03060a] lab-grid-bg lab-snap-section select-none overflow-hidden"
    >
      <div className="max-w-6xl mx-auto w-full flex flex-col items-center text-center">
        {/* Clean Editorial Header */}
        <ScrollReveal direction="up">
          <div className="flex items-center justify-center gap-2 font-mono text-xs tracking-widest text-cyan-400 uppercase mb-3">
            <span>02</span>
            <span aria-hidden="true">·</span>
            <span>Growth</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-['Arial',sans-serif] font-semibold text-white tracking-wide uppercase mb-3">
            Geometric Expansion
          </h2>

          <p className="text-base sm:text-lg font-serif italic text-amber-200/90 max-w-xl mx-auto mb-10">
            “Simple rules can create surprisingly complex growth.”
          </p>
        </ScrollReveal>

        {/* Proportional Circles Stage */}
        <ScrollReveal direction="scale" delay={0.08} className="w-full">
          <div className="relative w-full min-h-[380px] sm:min-h-[430px] rounded-2xl bg-[#040811] border border-cyan-500/25 p-6 flex flex-col items-center justify-between overflow-hidden">
            <div className="w-full flex items-center justify-between font-mono text-xs text-slate-400">
              <span>Proportional Scale: 1 unit = 4px diameter</span>
              <span className="text-amber-300 font-bold tabular-nums">
                Current Term: {activeValue} (Step {currentStep + 1} / {GROWTH_SEQUENCE.length})
              </span>
            </div>

            {/* Horizontal Proportional Circle Chain */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 my-auto py-6">
              {GROWTH_SEQUENCE.map((val, idx) => {
                const isVisible = idx <= currentStep;
                const isCurrent = idx === currentStep;
                const diameter = Math.max(14, val * 4.2);

                return (
                  <motion.button
                    key={idx}
                    type="button"
                    initial={{ opacity: 0, scale: 0.4, y: 16 }}
                    whileInView={{
                      opacity: !isVisible ? 0.15 : isCurrent ? 1 : 0.85,
                      scale: !isVisible ? 0.5 : 1,
                      y: 0,
                    }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{
                      type: 'spring',
                      stiffness: 120,
                      damping: 18,
                      delay: idx * 0.035,
                    }}
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStep(idx);
                    }}
                    style={{
                      width: `${diameter}px`,
                      height: `${diameter}px`,
                    }}
                    className={`rounded-full flex items-center justify-center font-mono transition-colors duration-300 cursor-pointer shrink-0 ${
                      !isVisible
                        ? 'border border-slate-800 bg-transparent text-transparent'
                        : isCurrent
                        ? 'border-2 border-amber-400 bg-amber-400/20 text-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.45)] font-bold'
                        : 'border border-cyan-400/50 bg-cyan-950/25 text-cyan-200 hover:border-amber-400'
                    }`}
                    title={`Term ${idx + 1}: ${val}`}
                  >
                    <span
                      className={`tabular-nums ${
                        val < 3 ? 'text-[9px]' : val < 13 ? 'text-xs' : 'text-sm sm:text-base'
                      }`}
                    >
                      {val}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Sequence Progression Chain */}
            <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-xs sm:text-sm text-slate-400 pt-2 border-t border-white/5 w-full">
              {GROWTH_SEQUENCE.map((val, idx) => (
                <React.Fragment key={idx}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStep(idx);
                    }}
                    className={`px-2 py-0.5 rounded tabular-nums transition-colors cursor-pointer ${
                      idx === currentStep
                        ? 'text-amber-400 font-bold underline underline-offset-4'
                        : idx < currentStep
                        ? 'text-slate-200'
                        : 'text-slate-600'
                    }`}
                  >
                    {val}
                  </button>
                  {idx < GROWTH_SEQUENCE.length - 1 && (
                    <span className="text-slate-700 select-none">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Speed Control Bar: SLOW, NORMAL, FAST */}
        <ScrollReveal direction="up" delay={0.14}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 p-3 rounded-xl bg-[#050a12] border border-white/10">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 font-mono text-xs font-semibold uppercase flex items-center gap-2 cursor-pointer transition-colors"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStep(0);
                }}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 cursor-pointer transition-colors"
                title="Reset growth sequence"
                aria-label="Reset growth sequence"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="h-5 w-[1px] bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="text-slate-500 mr-1 uppercase">Speed:</span>
              {(['SLOW', 'NORMAL', 'FAST'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    speed === s
                      ? 'bg-[#ff69b4] text-slate-950 font-bold shadow-[0_0_15px_rgba(255,105,180,0.45)]'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
