import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PHI } from '../utils/fibonacciMath';
import { ScrollReveal } from './ScrollReveal';
import { harmonicAudio } from '../utils/harmonicAudio';

const RATIO_OPTIONS = [
  { numerator: 13, denominator: 8, label: '13 / 8' },
  { numerator: 21, denominator: 13, label: '21 / 13' },
  { numerator: 34, denominator: 21, label: '34 / 21' },
  { numerator: 55, denominator: 34, label: '55 / 34' },
  { numerator: 89, denominator: 55, label: '89 / 55' },
];

const PHI_DIGITS = '1.6180339887...'.split('');

export const Section5GoldenConnection: React.FC = () => {
  const [selectedRatioIndex, setSelectedRatioIndex] = useState<number>(3);

  const activeRatio = RATIO_OPTIONS[selectedRatioIndex];
  const quotient = activeRatio.numerator / activeRatio.denominator;
  const difference = Math.abs(quotient - PHI);

  return (
    <section
      id="section-golden"
      className="relative min-h-screen flex flex-col items-center justify-center py-24 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#020307] lab-grid-bg lab-snap-section select-none overflow-hidden"
    >
      <div className="max-w-5xl mx-auto w-full flex flex-col items-center text-center">
        {/* Clean Editorial Header */}
        <ScrollReveal direction="up">
          <div className="flex items-center justify-center gap-2 font-mono text-xs tracking-widest text-amber-400 uppercase mb-3">
            <span>04</span>
            <span aria-hidden="true">·</span>
            <span>The Golden Connection</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-['Arial',sans-serif] font-semibold text-white tracking-wide uppercase mb-8">
            THE NUMBER BEHIND THE PATTERN
          </h2>
        </ScrollReveal>

        {/* Giant Interactive Moving Number: 1.6180339887... */}
        <ScrollReveal direction="scale" delay={0.06} className="w-full mb-12">
          <div className="w-full py-10 px-4 rounded-2xl bg-[#04070f] border border-amber-500/30 flex flex-col items-center justify-center overflow-hidden">
            <div
              aria-label="1.6180339887..."
              className="flex items-center justify-center flex-wrap font-mono text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-amber-300 glow-gold tracking-tight tabular-nums"
            >
              {PHI_DIGITS.map((char, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{
                    type: 'spring',
                    stiffness: 120,
                    damping: 18,
                    delay: idx * 0.03,
                  }}
                  style={{
                    animationDelay: `${idx * 0.14}s`,
                  }}
                  className="inline-block animate-float-digit hover:text-cyan-300 transition-colors duration-200 cursor-default"
                >
                  {char}
                </motion.span>
              ))}
            </div>

            <div className="mt-4 font-mono text-xs sm:text-sm text-slate-400 flex items-center gap-3">
              <span>φ = 1.618033988...</span>
              <span aria-hidden="true">·</span>
              <span>Exact Value: (1 + √5) / 2</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Consecutive Ratio Explorer & Visual Division */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Pair Selector + Stacked Fraction Division */}
          <ScrollReveal direction="right" delay={0.1} className="lg:col-span-6 flex">
            <div className="w-full p-6 sm:p-8 rounded-2xl bg-[#050a12] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="font-mono text-xs text-cyan-400 uppercase tracking-widest mb-4 text-left">
                  Select Consecutive Fibonacci Numbers
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-8">
                  {RATIO_OPTIONS.map((opt, idx) => {
                    const isSelected = idx === selectedRatioIndex;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => {
                          setSelectedRatioIndex(idx);
                          harmonicAudio.playChime('phi', idx + 5);
                        }}
                        className={`px-3.5 py-2 rounded-lg font-mono text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? 'bg-cyan-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.35)] scale-105'
                            : 'bg-slate-900 text-slate-300 hover:text-white border border-white/10'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {/* Stacked Visual Division Display with smooth crossfade */}
                <div className="p-6 rounded-xl bg-[#03060a] border border-amber-500/25 flex items-center justify-center gap-5 font-mono min-h-[132px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeRatio.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="flex items-center justify-center gap-5"
                    >
                      <div className="flex flex-col items-center tabular-nums">
                        <span className="text-2xl sm:text-4xl font-bold text-amber-300">
                          {activeRatio.numerator}
                        </span>
                        <span className="w-16 h-[2px] bg-slate-500 my-1.5" />
                        <span className="text-2xl sm:text-4xl font-bold text-cyan-300">
                          {activeRatio.denominator}
                        </span>
                      </div>

                      <span className="text-2xl sm:text-3xl text-slate-500">=</span>

                      <div className="text-left tabular-nums">
                        <div className="text-2xl sm:text-4xl font-bold text-white">
                          {quotient.toFixed(6)}...
                        </div>
                        <div className="text-xs text-amber-400/90 mt-1">
                          Δ from φ: {difference.toFixed(7)}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 text-left font-mono text-xs text-slate-400">
                As consecutive Fibonacci numbers increase, their quotient locks ever closer to φ = 1.618033988...
              </div>
            </div>
          </ScrollReveal>

          {/* Right: Animated Convergence Visualization */}
          <ScrollReveal direction="left" delay={0.14} className="lg:col-span-6 flex">
            <div className="w-full p-6 sm:p-8 rounded-2xl bg-[#050a12] border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between font-mono text-xs text-slate-400 mb-4">
                <span className="uppercase tracking-widest text-amber-400">
                  Convergence Trajectory
                </span>
                <span className="tabular-nums">Target: φ = 1.618033988...</span>
              </div>

              <div className="w-full h-56 bg-[#03060a] rounded-xl border border-white/10 p-4 relative flex items-center">
                <svg viewBox="0 0 400 160" className="w-full h-full overflow-visible">
                  {/* Golden Ratio Reference Horizon */}
                  <line
                    x1="15"
                    y1="80"
                    x2="385"
                    y2="80"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeDasharray="5 5"
                  />
                  <text
                    x="385"
                    y="72"
                    textAnchor="end"
                    fill="#fbbf24"
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    φ = 1.618033988...
                  </text>

                  {/* Convergence Polyline */}
                  <polyline
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    points={RATIO_OPTIONS.map((r, i) => {
                      const x = 35 + i * 80;
                      const val = r.numerator / r.denominator;
                      const y = 80 - (val - PHI) * 7500;
                      const clampedY = Math.max(18, Math.min(142, y));
                      return `${x},${clampedY.toFixed(1)}`;
                    }).join(' ')}
                  />

                  {/* Interactive Ratio Nodes */}
                  {RATIO_OPTIONS.map((r, i) => {
                    const x = 35 + i * 80;
                    const val = r.numerator / r.denominator;
                    const y = 80 - (val - PHI) * 7500;
                    const clampedY = Math.max(18, Math.min(142, y));
                    const isActive = i === selectedRatioIndex;

                    return (
                      <g
                        key={r.label}
                        className="cursor-pointer"
                        onClick={() => setSelectedRatioIndex(i)}
                      >
                        <line
                          x1={x}
                          y1="80"
                          x2={x}
                          y2={clampedY}
                          stroke={isActive ? '#fbbf24' : 'rgba(255,255,255,0.15)'}
                          strokeWidth="1"
                        />
                        <circle
                          cx={x}
                          cy={clampedY}
                          r={isActive ? 7.5 : 4.5}
                          fill={isActive ? '#fbbf24' : '#06b6d4'}
                          stroke="#03060a"
                          strokeWidth="2"
                          className="transition-all duration-300"
                        />
                        <text
                          x={x}
                          y={clampedY < 80 ? clampedY - 12 : clampedY + 18}
                          textAnchor="middle"
                          fill={isActive ? '#fde68a' : '#94a3b8'}
                          fontSize="10"
                          fontFamily="JetBrains Mono, monospace"
                        >
                          {r.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="mt-4 flex items-center justify-between font-mono text-xs text-slate-400">
                <span>Each step alternates above and below φ</span>
                <span className="text-cyan-300 tabular-nums">
                  Error: {(difference * 100).toFixed(4)}%
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
