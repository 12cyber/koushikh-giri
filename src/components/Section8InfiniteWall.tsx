import React, { useState } from 'react';
import { motion } from 'motion/react';
import { getFibonacciBigInt } from '../utils/fibonacciMath';
import { Plus } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { harmonicAudio } from '../utils/harmonicAudio';

const INITIAL_WALL_INDICES = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30, 40, 50, 75, 100,
];

export const Section8InfiniteWall: React.FC = () => {
  const [indices, setIndices] = useState<number[]>(INITIAL_WALL_INDICES);

  const handleLoadMore = () => {
    const last = indices[indices.length - 1];
    const nextBatch = [last + 25, last + 50, last + 75, last + 100];
    setIndices((prev) => [...prev, ...nextBatch]);
    harmonicAudio.playChime('phi', 12);
  };

  return (
    <section
      id="section-infinite"
      className="relative min-h-screen flex flex-col items-center justify-center py-28 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#010204] lab-grid-dense lab-snap-section select-none overflow-hidden"
    >
      <div className="max-w-4xl mx-auto w-full flex flex-col items-center text-center">
        {/* Clean Editorial Header */}
        <ScrollReveal direction="up">
          <div className="flex items-center justify-center gap-2 font-mono text-xs tracking-widest text-cyan-400 uppercase mb-3">
            <span>09</span>
            <span aria-hidden="true">·</span>
            <span>Infinity</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-['Arial',sans-serif] font-semibold text-white tracking-wide uppercase mb-4">
            The Infinite Wall
          </h2>

          <p className="text-sm sm:text-base text-slate-400 font-mono max-w-md mx-auto mb-14">
            Scroll down the vertical monolith as the sequence accelerates into astronomical magnitudes.
          </p>
        </ScrollReveal>

        {/* Vertical Monolith of Numbers with Per-Row Scroll Reveal */}
        <div className="w-full max-w-3xl flex flex-col items-center gap-3 relative">
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-cyan-400/40 via-amber-400/40 to-transparent pointer-events-none" />

          {indices.map((n, idx) => {
            const valStr = getFibonacciBigInt(n).toLocaleString();
            const fadeFactor = Math.max(0.3, 1 - Math.max(0, idx - indices.length + 5) * 0.14);

            return (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: fadeFactor, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative z-10 w-full px-5 py-3.5 rounded-xl bg-[#040811]/90 border border-white/10 hover:border-amber-400/50 transition-colors flex flex-col sm:flex-row items-center justify-between gap-2 font-mono"
              >
                <span className="text-xs text-cyan-400 font-semibold tabular-nums shrink-0">
                  F({n})
                </span>
                <span className="text-sm sm:text-lg font-bold text-amber-300 tabular-nums break-all text-center sm:text-right">
                  {valStr}
                </span>
              </motion.div>
            );
          })}

          {/* Vanishing Horizon Animation into Infinity */}
          <div className="my-6 flex flex-col items-center gap-2 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 animate-ping" />
            <span className="w-1 h-1 rounded-full bg-amber-400/50" />
            <span className="w-1 h-1 rounded-full bg-cyan-400/30" />
            <span className="font-mono text-2xl text-amber-400/70">∞</span>
          </div>

          <button
            type="button"
            onClick={handleLoadMore}
            className="relative z-10 mb-10 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-mono text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate Deeper Terms into Infinity</span>
          </button>

          {/* Required Statement */}
          <ScrollReveal direction="scale" className="w-full">
            <div className="relative z-10 w-full p-8 sm:p-10 rounded-2xl bg-[#040811] border border-cyan-400/40 text-center">
              <h3 className="text-2xl sm:text-4xl font-['Arial',sans-serif] font-semibold text-white mb-3">
                “There is no final Fibonacci number.”
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto">
                Because every pair of positive numbers sums to an even larger number, the sequence continues indefinitely—stretching past the count of atoms in the observable universe into pure mathematical infinity.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
