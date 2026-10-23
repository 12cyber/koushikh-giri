import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, RotateCcw } from 'lucide-react';

const OPENING_NUMBERS = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];

interface OpeningExperienceProps {
  onStartDiscovery: () => void;
  isIntroActive?: boolean;
  onReplayMovieIntro?: () => void;
}

export const OpeningExperience: React.FC<OpeningExperienceProps> = ({
  onStartDiscovery,
  isIntroActive = false,
  onReplayMovieIntro,
}) => {
  const [revealedCount, setRevealedCount] = useState<number>(1);
  const [spiralMode, setSpiralMode] = useState<boolean>(false);
  const [runKey, setRunKey] = useState<number>(0);

  // Direct GPU-accelerated parallax container ref to avoid React re-renders on mousemove
  const arenaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isIntroActive) {
      setRevealedCount(1);
      setSpiralMode(false);
      return;
    }

    setRevealedCount(1);
    setSpiralMode(false);

    let timeoutId: NodeJS.Timeout;
    let spiralTimeoutId: NodeJS.Timeout;

    const revealNext = (index: number) => {
      if (index >= OPENING_NUMBERS.length) {
        spiralTimeoutId = setTimeout(() => {
          setSpiralMode(true);
        }, 320);
        return;
      }

      setRevealedCount(index + 1);
      // Accelerating interval: starts deliberate (780ms for 0 -> 1 -> 1 -> 2), then speeds up smoothly
      const delay = Math.max(115, Math.round(780 * Math.pow(0.76, index)));
      timeoutId = setTimeout(() => {
        revealNext(index + 1);
      }, delay);
    };

    timeoutId = setTimeout(() => {
      revealNext(1);
    }, 550);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(spiralTimeoutId);
    };
  }, [runKey, isIntroActive]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!arenaRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 18;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 18;
    arenaRef.current.style.transform = `translate3d(${nx.toFixed(1)}px, ${ny.toFixed(1)}px, 0)`;
  };

  const currentNumber = OPENING_NUMBERS[Math.min(revealedCount - 1, OPENING_NUMBERS.length - 1)];

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16 overflow-hidden bg-[#020408] lab-grid-bg select-none"
    >
      {/* Top quiet laboratory coordinate header */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between font-mono text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="text-slate-300 tracking-widest uppercase">
            Fibonacci: The Hidden Code of Growth
          </span>
        </div>
        <button
          type="button"
          onClick={() => setRunKey((k) => k + 1)}
          className="text-slate-500 hover:text-cyan-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Replay opening sequence"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Replay Genesis</span>
        </button>
      </div>

      {/* Central Interactive Spiral & Number Emergence Arena */}
      <div
        ref={arenaRef}
        style={{ willChange: 'transform', transition: 'transform 0.18s cubic-bezier(0.22, 1, 0.36, 1)' }}
        className="relative w-full max-w-3xl h-[380px] sm:h-[440px] flex items-center justify-center"
      >
        {/* SVG Golden Spiral Curve that illuminates once numbers form the spiral */}
        <svg
          viewBox="-240 -240 480 480"
          className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-1000 ${
            spiralMode ? 'opacity-90' : 'opacity-25'
          }`}
        >
          {/* Subtle polar reference circles */}
          <circle cx="0" cy="0" r="60" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <circle cx="0" cy="0" r="125" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <circle cx="0" cy="0" r="195" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

          {/* Smooth connecting spiral path through the revealed nodes */}
          <path
            d={OPENING_NUMBERS.slice(0, revealedCount)
              .map((_, idx) => {
                const angle = idx * 0.72 - Math.PI / 2;
                const radius = spiralMode ? idx * 14.5 : idx * 6;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
              })
              .join(' ')}
            fill="none"
            stroke="rgba(245, 158, 11, 0.35)"
            strokeWidth="1.5"
            strokeDasharray={spiralMode ? 'none' : '3 3'}
          />
        </svg>

        {/* Large central pulse when numbers are emerging one by one before spiral expansion */}
        <AnimatePresence mode="wait">
          {!spiralMode && (
            <motion.div
              key={revealedCount}
              initial={{ opacity: 0, scale: 0.84, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.08, y: -4 }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="absolute z-20 flex flex-col items-center justify-center pointer-events-none"
            >
              <span className="font-mono text-7xl sm:text-8xl md:text-9xl font-bold text-amber-400 glow-gold tabular-nums">
                {currentNumber}
              </span>
              <span className="font-mono text-xs text-slate-500 mt-3 tracking-widest uppercase">
                Term {revealedCount} of {OPENING_NUMBERS.length}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spiral nodes: each number transitions smoothly from the center into a growing spiral */}
        {OPENING_NUMBERS.slice(0, revealedCount).map((num, idx) => {
          const angle = idx * 0.72 - Math.PI / 2;
          const radius = spiralMode ? idx * 14.5 : 0;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const isLatest = idx === revealedCount - 1;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.3, x: 0, y: 0 }}
              animate={{
                opacity: spiralMode ? 1 : isLatest ? 0.15 : 0,
                scale: spiralMode ? 0.85 + idx * 0.035 : isLatest ? 1 : 0.4,
                x,
                y,
              }}
              transition={{
                type: 'spring',
                stiffness: 120,
                damping: 18,
                mass: 0.8,
              }}
              className={`absolute font-mono tabular-nums flex items-center justify-center ${
                idx >= 10
                  ? 'text-xl sm:text-2xl font-bold text-amber-300 glow-gold'
                  : idx >= 5
                  ? 'text-base sm:text-lg font-semibold text-amber-400'
                  : 'text-xs sm:text-sm text-amber-200/80'
              }`}
            >
              <span className="px-2 py-1 rounded bg-[#020408]/85 border border-amber-500/25">
                {num}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom linear sequence trace so visitor can inspect all emerged numbers clearly */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3 font-mono text-sm sm:text-base text-slate-400 mb-8 max-w-2xl">
        {OPENING_NUMBERS.slice(0, Math.min(revealedCount, 10)).map((num, idx) => (
          <React.Fragment key={idx}>
            <span
              className={`tabular-nums transition-colors duration-300 ${
                idx === revealedCount - 1 || spiralMode
                  ? 'text-amber-400 font-semibold'
                  : 'text-slate-400'
              }`}
            >
              {num}
            </span>
            {idx < Math.min(revealedCount, 10) - 1 && (
              <span className="text-slate-700 select-none">→</span>
            )}
          </React.Fragment>
        ))}
        {spiralMode && <span className="text-cyan-400 font-bold">→ …</span>}
      </div>

      {/* Prompt & Action Button */}
      <div
        className={`relative z-10 flex flex-col items-center text-center transition-all duration-700 ${
          revealedCount >= 7
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-['Arial',sans-serif] font-normal not-italic tracking-wider uppercase text-white mb-6 text-balance">
          CAN YOU FIND THE RULE?
        </h1>

        <button
          type="button"
          onClick={onStartDiscovery}
          className="group px-7 py-3.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-400 text-cyan-300 hover:text-slate-950 border border-cyan-400/60 font-mono text-xs sm:text-sm font-bold tracking-widest uppercase transition-all duration-200 flex items-center gap-3 cursor-pointer shadow-[0_0_25px_-5px_rgba(6,182,212,0.45)]"
        >
          <span>[START THE DISCOVERY]</span>
          <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>
    </section>
  );
};
