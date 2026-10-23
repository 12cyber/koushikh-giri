import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ArrowDown } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { harmonicAudio } from '../utils/harmonicAudio';

const RIDDLE_SEQUENCE = [1, 1, 2, 3, 5, 8, 13, 21, 34];

export const Section1Discovery: React.FC = () => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean>(false);
  const [shakeWrong, setShakeWrong] = useState<boolean>(false);
  const [inspectedIdx, setInspectedIdx] = useState<number>(8);

  const handleChoice = (val: number) => {
    setSelectedAnswer(val);
    if (val === 55) {
      setIsAnswerCorrect(true);
      setInspectedIdx(9);
      setShakeWrong(false);
      harmonicAudio.playChime('success', 9);
    } else {
      setIsAnswerCorrect(false);
      setShakeWrong(true);
      harmonicAudio.playChime('error', 2);
      setTimeout(() => setShakeWrong(false), 500);
    }
  };

  const fullSequence = isAnswerCorrect ? [...RIDDLE_SEQUENCE, 55] : RIDDLE_SEQUENCE;

  return (
    <section
      id="section-discover"
      className="relative min-h-screen flex flex-col items-center justify-center py-24 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#03060a] lab-grid-bg lab-snap-section overflow-hidden"
    >
      <div className="max-w-4xl mx-auto w-full text-center flex flex-col items-center">
        {/* Clean Editorial Section Header */}
        <ScrollReveal direction="up" distance={22}>
          <div className="flex items-center justify-center gap-2 font-mono text-xs tracking-widest text-cyan-400 uppercase mb-3">
            <span>01</span>
            <span aria-hidden="true">·</span>
            <span>The Discovery</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-['Arial',sans-serif] font-semibold text-white tracking-wide uppercase mb-10 text-balance">
            WHAT COMES NEXT?
          </h2>
        </ScrollReveal>

        {/* Sequence Display Strip with Staggered Scroll Entrance */}
        <ScrollReveal direction="scale" delay={0.08} className="w-full mb-10">
          <div className="w-full p-6 sm:p-10 rounded-2xl bg-[#050a12] border border-white/10">
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 font-mono">
              {RIDDLE_SEQUENCE.map((num, i) => {
                const isParentOf55 = !isAnswerCorrect && (i === 7 || i === 8);
                const isInspectedTarget = isAnswerCorrect && i === inspectedIdx;
                const isInspectedParent =
                  isAnswerCorrect && (i === inspectedIdx - 1 || i === inspectedIdx - 2);

                return (
                  <React.Fragment key={i}>
                    <motion.button
                      type="button"
                      initial={{ opacity: 0, y: 14, scale: 0.9 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: false, amount: 0.3 }}
                      transition={{
                        type: 'spring',
                        stiffness: 130,
                        damping: 18,
                        delay: i * 0.04,
                      }}
                      onClick={() => {
                        if (isAnswerCorrect && i >= 2) setInspectedIdx(i);
                      }}
                      className={`px-3 py-2 rounded-lg text-xl sm:text-3xl font-semibold tabular-nums transition-colors duration-200 ${
                        isInspectedTarget
                          ? 'bg-[#ff69b4] text-slate-950 font-bold scale-110 shadow-[0_0_20px_rgba(255,105,180,0.45)]'
                          : isInspectedParent
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                          : isParentOf55
                          ? 'text-amber-300 border border-amber-500/20 bg-amber-500/5'
                          : 'text-slate-200 hover:text-amber-300'
                      } ${isAnswerCorrect && i >= 2 ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      {num}
                    </motion.button>
                    <span className="text-slate-700 text-sm select-none">·</span>
                  </React.Fragment>
                );
              })}

              {/* The Target Mystery Slot */}
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ type: 'spring', stiffness: 130, damping: 16, delay: 0.36 }}
                onClick={() => {
                  if (isAnswerCorrect) setInspectedIdx(9);
                }}
                className={`px-5 sm:px-6 py-2.5 rounded-xl border font-mono text-2xl sm:text-4xl font-bold tabular-nums transition-all duration-300 ${
                  isAnswerCorrect
                    ? inspectedIdx === 9
                      ? 'bg-[#ff69b4] text-slate-950 border-pink-300 scale-110 shadow-[0_0_30px_rgba(255,105,180,0.5)] cursor-pointer'
                      : 'bg-pink-500/20 text-pink-300 border-pink-400/50 cursor-pointer'
                    : 'bg-cyan-950/40 text-cyan-300 border-cyan-400/60'
                }`}
              >
                {isAnswerCorrect ? '55' : '?'}
              </motion.button>
            </div>

            <AnimatePresence>
              {!isAnswerCorrect && selectedAnswer !== null && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 font-mono text-xs text-rose-300"
                >
                  Not quite {selectedAnswer}. Look closely at the last two numbers: 21 and 34.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </ScrollReveal>

        {/* Three Large Interactive Choices: 55, 54, 56 */}
        <ScrollReveal direction="up" delay={0.16} className="w-full max-w-lg mb-12">
          <div className="grid grid-cols-3 gap-4 sm:gap-6 w-full">
            {[55, 54, 56].map((option, idx) => {
              const isSelected = selectedAnswer === option;
              const isCorrectOption = option === 55;

              let btnStyle =
                'bg-[#070d19] text-slate-100 border-white/15 hover:border-cyan-400 hover:text-cyan-300';

              if (isSelected) {
                if (isCorrectOption) {
                  btnStyle =
                    'bg-[#ff69b4] text-slate-950 border-pink-300 font-bold shadow-[0_0_25px_rgba(255,105,180,0.5)] scale-105';
                } else {
                  btnStyle = 'bg-rose-950/60 text-rose-300 border-rose-500/60';
                }
              }

              return (
                <motion.button
                  key={option}
                  type="button"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{
                    type: 'spring',
                    stiffness: 120,
                    damping: 18,
                    delay: 0.1 + idx * 0.06,
                  }}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleChoice(option)}
                  className={`py-5 rounded-xl border text-2xl sm:text-4xl font-mono font-bold tabular-nums transition-colors duration-200 cursor-pointer ${btnStyle} ${
                    shakeWrong && isSelected && !isCorrectOption ? 'animate-shake' : ''
                  }`}
                >
                  {option}
                </motion.button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Dramatic Rule & Formula Reveal */}
        <AnimatePresence>
          {isAnswerCorrect && (
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-2xl p-6 sm:p-10 rounded-2xl bg-[#060c17] border border-cyan-400/40 text-center"
            >
              <div className="flex items-center justify-center gap-2 font-mono text-xs text-cyan-300 tracking-widest uppercase mb-3">
                <Check className="w-4 h-4 text-cyan-400" />
                <span>Discovery Verified</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-['Arial',sans-serif] font-bold text-amber-300 tracking-wide uppercase mb-4">
                YOU JUST DISCOVERED THE RULE.
              </h3>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed mb-6 max-w-lg mx-auto">
                Each number is created by adding the previous two numbers.
              </p>

              {/* Interactive Live Equation Box */}
              <div className="p-5 sm:p-6 rounded-xl bg-[#03060a] border border-amber-400/40 font-mono mb-6">
                <div className="text-xs text-slate-400 uppercase tracking-widest mb-2">
                  Recurrence Law
                </div>
                <div className="text-2xl sm:text-4xl text-amber-300 font-bold tracking-wider glow-gold">
                  F(n) = F(n − 1) + F(n − 2)
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 text-xs sm:text-sm text-cyan-300 flex items-center justify-center gap-2 tabular-nums">
                  <span>
                    Inspecting: {fullSequence[inspectedIdx - 2]} + {fullSequence[inspectedIdx - 1]} ={' '}
                    <strong className="text-amber-300">{fullSequence[inspectedIdx]}</strong>
                  </span>
                  <span className="text-slate-500 hidden sm:inline">
                    (Click any number in the sequence above to test)
                  </span>
                </div>
              </div>

              <a
                href="#section-living"
                className="inline-flex items-center gap-2 font-mono text-xs text-cyan-300 hover:text-white tracking-widest uppercase transition-colors"
              >
                <span>Enter the Living Sequence Laboratory</span>
                <ArrowDown className="w-4 h-4" />
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
