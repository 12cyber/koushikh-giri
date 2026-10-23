import React from 'react';
import { motion } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

interface FinalExperienceProps {
  onRestart: () => void;
}

const CLOSING_LINES = [
  { text: '“YOU STARTED WITH 0.”', className: 'text-slate-400' },
  { text: '“YOU FOUND A RULE.”', className: 'text-slate-300' },
  { text: '“YOU BUILT A PATTERN.”', className: 'text-cyan-300' },
  { text: '“YOU DISCOVERED A CONNECTION.”', className: 'text-amber-300' },
  {
    text: '“AND THE SEQUENCE CONTINUES.”',
    className: 'text-2xl sm:text-4xl md:text-5xl font-bold text-white pt-4',
  },
];

export const FinalExperience: React.FC<FinalExperienceProps> = ({ onRestart }) => {
  return (
    <footer className="relative min-h-screen flex flex-col items-center justify-center py-28 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#020306] lab-grid-bg text-center select-none overflow-hidden">
      <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
        {/* Sequential Final Experience Statements with Staggered Scroll Reveal */}
        <div className="space-y-6 sm:space-y-8 font-['Arial',sans-serif] uppercase tracking-wider text-xl sm:text-3xl md:text-4xl text-slate-300 mb-14">
          {CLOSING_LINES.map((line, idx) => (
            <motion.p
              key={line.text}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{
                type: 'spring',
                stiffness: 110,
                damping: 20,
                delay: idx * 0.08,
              }}
              className={line.className}
            >
              {line.text}
            </motion.p>
          ))}
        </div>

        {/* Final Sequence Chain */}
        <ScrollReveal direction="scale" delay={0.2} className="w-full max-w-2xl mb-12">
          <div className="px-6 py-6 sm:px-10 sm:py-8 rounded-2xl bg-[#040811] border border-amber-500/35 w-full">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3.5 font-mono text-xl sm:text-3xl font-bold text-amber-300 glow-gold tabular-nums">
              <span>0</span>
              <span className="text-slate-600">→</span>
              <span>1</span>
              <span className="text-slate-600">→</span>
              <span>1</span>
              <span className="text-slate-600">→</span>
              <span>2</span>
              <span className="text-slate-600">→</span>
              <span>3</span>
              <span className="text-slate-600">→</span>
              <span>5</span>
              <span className="text-slate-600">→</span>
              <span>8</span>
              <span className="text-slate-600">→</span>
              <span>13</span>
              <span className="text-slate-600">→</span>
              <span className="text-cyan-300 text-3xl sm:text-4xl">∞</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Restart Experience Action */}
        <ScrollReveal direction="up" delay={0.28}>
          <button
            type="button"
            onClick={onRestart}
            className="group px-8 py-4 rounded-xl bg-[#ff69b4] hover:bg-pink-300 text-slate-950 font-mono text-xs sm:text-sm font-bold tracking-widest uppercase transition-all duration-200 flex items-center gap-3 cursor-pointer shadow-[0_0_25px_rgba(255,105,180,0.45)] active:scale-95"
          >
            <RotateCcw className="w-4 h-4 group-hover:-rotate-90 transition-transform duration-300" />
            <span>[RESTART THE EXPERIENCE]</span>
          </button>
        </ScrollReveal>
      </div>
    </footer>
  );
};
