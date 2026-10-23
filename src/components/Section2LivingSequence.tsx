import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { generateFibonacciSequence } from '../utils/fibonacciMath';
import { Sliders, Play, Pause } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { harmonicAudio } from '../utils/harmonicAudio';

const MAX_N = 30;
const FULL_SEQ = generateFibonacciSequence(MAX_N + 1);
const GOLDEN_ANGLE_RAD = 137.507764 * (Math.PI / 180);

export const Section2LivingSequence: React.FC = () => {
  const [n, setN] = useState<number>(12);
  const [autoSweep, setAutoSweep] = useState<boolean>(false);

  useEffect(() => {
    if (!autoSweep) return;
    const timer = setInterval(() => {
      setN((prev) => {
        const next = prev >= MAX_N ? 2 : prev + 1;
        harmonicAudio.playChime('step', next);
        return next;
      });
    }, 650);
    return () => clearInterval(timer);
  }, [autoSweep]);

  const currentVal = FULL_SEQ[n];
  const prev1 = n > 0 ? FULL_SEQ[n - 1] : 0;
  const prev2 = n > 1 ? FULL_SEQ[n - 2] : 0;
  const ratio = n >= 2 && prev1 > 0 ? (currentVal / prev1).toFixed(6) : '—';

  const getTermCoordinates = (idx: number, total: number) => {
    if (total <= 1) return { x: 0, y: -120 };
    const angle = idx * GOLDEN_ANGLE_RAD - Math.PI / 2;
    const minRadius = 105;
    const maxRadius = 210;
    const normalized = idx / Math.max(1, total - 1);
    const r = minRadius + normalized * (maxRadius - minRadius);
    return {
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r,
    };
  };

  const prev1Coords = n >= 1 ? getTermCoordinates(n - 1, n) : null;
  const prev2Coords = n >= 2 ? getTermCoordinates(n - 2, n) : null;

  return (
    <section
      id="section-living"
      className="relative min-h-screen flex flex-col items-center justify-center py-24 px-4 sm:px-6 lg:px-8 bg-[#020409] lab-grid-dense lab-snap-section border-t border-white/10 select-none overflow-hidden"
    >
      <div className="max-w-6xl mx-auto w-full flex flex-col items-center">
        {/* Clean Editorial Header */}
        <ScrollReveal direction="up" className="w-full">
          <div className="w-full flex flex-col sm:flex-row items-start sm:items-end justify-between pb-6 border-b border-white/10 mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs tracking-widest text-cyan-400 uppercase mb-2">
                <span>01B</span>
                <span aria-hidden="true">·</span>
                <span>The Living Sequence</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-['Arial',sans-serif] font-semibold text-white uppercase tracking-wide">
                Interactive Mathematical Machine
              </h2>
            </div>

            <div className="flex items-center gap-4 font-mono text-xs text-slate-400 tabular-nums">
              <span>State: n = {n}</span>
              <span aria-hidden="true">·</span>
              <span>
                Ratio F(n)/F(n−1): <strong className="text-amber-300">{ratio}</strong>
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* Central Machine Constellation Stage */}
        <ScrollReveal direction="scale" delay={0.08} className="w-full">
          <div className="relative w-full h-[460px] sm:h-[520px] rounded-2xl bg-[#040811] border border-cyan-500/25 flex items-center justify-center overflow-hidden p-4">
            {/* SVG Coordinate Vectors & Connecting Lines */}
            <svg
              viewBox="-280 -250 560 500"
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              {/* Reference rings */}
              <circle cx="0" cy="0" r="105" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <circle cx="0" cy="0" r="160" fill="none" stroke="rgba(6,182,212,0.06)" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="0" cy="0" r="210" fill="none" stroke="rgba(245,158,11,0.06)" strokeWidth="1" />

              {/* Sequential chain connecting F(0) -> F(1) -> ... -> F(n-1) */}
              {n >= 2 && (
                <polyline
                  fill="none"
                  stroke="rgba(6, 182, 212, 0.22)"
                  strokeWidth="1.2"
                  points={Array.from({ length: n })
                    .map((_, i) => {
                      const c = getTermCoordinates(i, n);
                      return `${c.x.toFixed(1)},${c.y.toFixed(1)}`;
                    })
                    .join(' ')}
                />
              )}

              {/* Direct Active Energy Vectors from F(n-2) and F(n-1) into Central F(n) */}
              {prev2Coords && (
                <line
                  x1={prev2Coords.x}
                  y1={prev2Coords.y}
                  x2="0"
                  y2="0"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="transition-all duration-300 ease-out"
                />
              )}
              {prev1Coords && (
                <line
                  x1={prev1Coords.x}
                  y1={prev1Coords.y}
                  x2="0"
                  y2="0"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  className="transition-all duration-300 ease-out"
                />
              )}

              {/* Plot all preceding terms F(0) .. F(n-1) around the central core with smooth CSS transform */}
              {Array.from({ length: n }).map((_, idx) => {
                const coords = getTermCoordinates(idx, n);
                const isParent1 = idx === n - 1;
                const isParent2 = idx === n - 2;

                return (
                  <g
                    key={idx}
                    style={{
                      transform: `translate3d(${coords.x.toFixed(1)}px, ${coords.y.toFixed(1)}px, 0)`,
                      transition: 'transform 0.36s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  >
                    <circle
                      r={isParent1 || isParent2 ? 20 : 12}
                      fill={
                        isParent1
                          ? 'rgba(245, 158, 11, 0.22)'
                          : isParent2
                          ? 'rgba(6, 182, 212, 0.22)'
                          : 'rgba(8, 15, 28, 0.9)'
                      }
                      stroke={
                        isParent1
                          ? '#f59e0b'
                          : isParent2
                          ? '#06b6d4'
                          : 'rgba(255,255,255,0.15)'
                      }
                      strokeWidth={isParent1 || isParent2 ? '2' : '1'}
                      className="transition-all duration-300"
                    />
                    <text
                      y="3"
                      textAnchor="middle"
                      fill={isParent1 ? '#fde68a' : isParent2 ? '#67e8f9' : '#94a3b8'}
                      fontSize={isParent1 || isParent2 ? '10' : '8'}
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight={isParent1 || isParent2 ? '700' : '400'}
                    >
                      {FULL_SEQ[idx]}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Central Core Readout: F(n) */}
            <div className="relative z-10 flex flex-col items-center text-center px-6 py-5 rounded-2xl bg-[#020408]/90 border border-amber-400/40 backdrop-blur-md shadow-[0_0_40px_rgba(245,158,11,0.2)] min-w-[230px]">
              <span className="font-mono text-sm sm:text-base text-cyan-300 font-semibold tracking-widest">
                F({n})
              </span>

              <AnimatePresence mode="wait">
                <motion.div
                  key={n}
                  initial={{ opacity: 0.4, scale: 0.94, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0.4, scale: 1.04, y: -4 }}
                  transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
                  className="text-4xl sm:text-6xl md:text-7xl font-mono font-bold text-amber-400 glow-gold tabular-nums my-1"
                >
                  {currentVal.toLocaleString()}
                </motion.div>
              </AnimatePresence>

              <div className="font-mono text-xs text-slate-300 mt-1 tabular-nums">
                {n >= 2 ? (
                  <span>
                    <strong className="text-cyan-300">{prev2.toLocaleString()}</strong> +{' '}
                    <strong className="text-amber-300">{prev1.toLocaleString()}</strong> ={' '}
                    <strong className="text-white">{currentVal.toLocaleString()}</strong>
                  </span>
                ) : (
                  <span>Seed Value F({n}) = {currentVal}</span>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Tactile Slider Control Console */}
        <ScrollReveal direction="up" delay={0.14} className="w-full">
          <div className="w-full mt-6 p-6 rounded-2xl bg-[#050a12] border border-white/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <label
                htmlFor="living-n-slider"
                className="flex items-center gap-2.5 font-mono text-xs sm:text-sm text-slate-200 uppercase tracking-wider"
              >
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Sequence Index Control: n = {n}</span>
              </label>

              <div className="flex items-center gap-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setAutoSweep((prev) => !prev)}
                  className={`px-3.5 py-1.5 rounded border flex items-center gap-1.5 cursor-pointer transition-colors ${
                    autoSweep
                      ? 'bg-[#ff69b4] border-pink-300 text-slate-950 font-bold shadow-[0_0_15px_rgba(255,105,180,0.4)]'
                      : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  {autoSweep ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{autoSweep ? 'Pause Sweep' : 'Auto-Sweep'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAutoSweep(false);
                    setN((prev) => Math.max(0, prev - 1));
                  }}
                  disabled={n <= 0}
                  className="px-3.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-cyan-300 border border-cyan-500/30 cursor-pointer"
                >
                  n − 1
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAutoSweep(false);
                    setN((prev) => Math.min(MAX_N, prev + 1));
                  }}
                  disabled={n >= MAX_N}
                  className="px-3.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-cyan-300 border border-cyan-500/30 cursor-pointer"
                >
                  n + 1
                </button>
              </div>
            </div>

            <input
              id="living-n-slider"
              type="range"
              min="0"
              max={MAX_N}
              value={n}
              onChange={(e) => {
                setAutoSweep(false);
                setN(parseInt(e.target.value, 10));
              }}
              className="w-full accent-cyan-400 h-2 bg-slate-900 rounded-lg cursor-pointer"
            />

            <div className="flex items-center justify-between font-mono text-[11px] text-slate-500 mt-2.5 tabular-nums">
              <span>n = 0 (0)</span>
              <span>n = 12 (144)</span>
              <span>n = 30 (832,040)</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
