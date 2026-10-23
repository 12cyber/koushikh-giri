import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FastForward } from 'lucide-react';
import { harmonicAudio } from '../utils/harmonicAudio';

interface CinematicMovieIntroProps {
  onComplete: () => void;
}

type IntroPhase = 'initial-dark' | 'presenter' | 'interlude' | 'main-title' | 'curtain-lift';

export const CinematicMovieIntro: React.FC<CinematicMovieIntroProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<IntroPhase>('initial-dark');

  // Lock page scrolling completely while the movie intro is active
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []);

  // Theatrical movie sequence timeline
  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase('presenter');
      harmonicAudio.playChime('step', 2);
    }, 350);

    // Fade away "GRADE 10 AND 9 PRESENTS"
    const t2 = setTimeout(() => {
      setPhase('interlude');
    }, 3200);

    // Fade in big title "FIBONACCI IN NATURE"
    const t3 = setTimeout(() => {
      setPhase('main-title');
      harmonicAudio.playChime('discover');
    }, 4000);

    // Fade away "FIBONACCI IN NATURE" and lift curtain to normal screen
    const t4 = setTimeout(() => {
      setPhase('curtain-lift');
    }, 7400);

    // Complete intro and unlock scroll
    const t5 = setTimeout(() => {
      onComplete();
    }, 8400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'curtain-lift' ? 0 : 1 }}
      transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[100] bg-[#010205] flex flex-col items-center justify-center select-none overflow-hidden"
      aria-live="polite"
    >
      {/* Top Cinema Letterbox Bar */}
      <motion.div
        initial={{ height: 64 }}
        animate={{ height: phase === 'curtain-lift' ? 0 : 56 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-0 left-0 right-0 bg-black border-b border-white/10 z-20"
      />

      {/* Ambient Golden Ratio Cinema Backdrop Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <motion.div
          animate={{
            scale: phase === 'main-title' ? [0.85, 1.12] : 0.75,
            opacity: phase === 'main-title' ? 0.32 : phase === 'presenter' ? 0.14 : 0,
          }}
          transition={{ duration: 2.8, ease: 'easeOut' }}
          className="w-[520px] h-[520px] rounded-full bg-radial from-amber-500/25 via-cyan-500/10 to-transparent blur-3xl"
        />
      </div>

      {/* Center Stage for Sequential Movie Title Cards */}
      <div className="relative z-10 max-w-5xl w-full px-6 text-center flex flex-col items-center justify-center min-h-[320px]">
        <AnimatePresence mode="wait">
          {phase === 'presenter' && (
            <motion.div
              key="card-presenter"
              initial={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.06, filter: 'blur(10px)' }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
            >
              <span className="font-mono text-xs sm:text-sm tracking-[0.45em] text-cyan-400 uppercase mb-4">
                EXPLORICA EXHIBITION
              </span>
              <h1 className="font-['Arial',sans-serif] text-2xl sm:text-4xl md:text-5xl font-bold tracking-[0.28em] uppercase text-white">
                GRADE 10 AND 9 PRESENTS
              </h1>
              <div className="mt-6 w-28 h-[1px] bg-gradient-to-r from-transparent via-[#ff69b4] to-transparent" />
            </motion.div>
          )}

          {phase === 'main-title' && (
            <motion.div
              key="card-main-title"
              initial={{ opacity: 0, scale: 0.88, y: 14, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.1, y: -10, filter: 'blur(12px)' }}
              transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col items-center"
            >
              {/* Animated Golden Spiral SVG Emblem behind the big title */}
              <motion.svg
                initial={{ rotate: -45, opacity: 0 }}
                animate={{ rotate: 0, opacity: 0.35 }}
                transition={{ duration: 2.2, ease: 'easeOut' }}
                viewBox="-120 -120 240 240"
                className=" absolute -z-10 w-64 h-64 sm:w-80 sm:h-80 pointer-events-none"
              >
                <circle
                  cx="0"
                  cy="0"
                  r="96"
                  fill="none"
                  stroke="rgba(251, 191, 36, 0.25)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <path
                  d="M 0 0 A 8 8 0 0 1 8 8 A 16 16 0 0 1 -8 24 A 24 24 0 0 1 -32 0 A 40 40 0 0 1 8 -40 A 64 64 0 0 1 72 24 A 96 96 0 0 1 -24 120"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </motion.svg>

              <span className="font-mono text-xs sm:text-sm tracking-[0.35em] text-amber-300 uppercase mb-4">
                0 · 1 · 1 · 2 · 3 · 5 · 8 · 13 · 21 · 34 · 55 · 89
              </span>

              <h1 className="font-['Arial',sans-serif] text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-[0.14em] uppercase text-white glow-gold text-balance leading-tight">
                FIBONACCI IN NATURE
              </h1>

              <p className="mt-5 font-mono text-xs sm:text-sm tracking-[0.25em] text-cyan-300 uppercase">
                THE HIDDEN CODE OF GROWTH
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Cinema Letterbox Bar with Skip Option */}
      <motion.div
        initial={{ height: 64 }}
        animate={{ height: phase === 'curtain-lift' ? 0 : 56 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-0 left-0 right-0 bg-black border-t border-white/10 z-20 flex items-center justify-between px-6 overflow-hidden"
      >
        <span className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">
          Explorica Mathematical Cinema · Scroll Locked During Prologue
        </span>

        <button
          type="button"
          onClick={onComplete}
          className="px-3 py-1 rounded bg-[#ff69b4] hover:bg-pink-300 text-slate-950 font-mono text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <span>Skip Intro</span>
          <FastForward className="w-3 h-3" />
        </button>
      </motion.div>
    </motion.div>
  );
};
