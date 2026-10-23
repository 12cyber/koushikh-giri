import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, CheckCircle2, RotateCcw, ArrowRight, Trophy, Clock, Flame } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { harmonicAudio } from '../utils/harmonicAudio';

interface CaseItem {
  id: number;
  title: string;
  difficulty: string;
  promptSequence: string[];
  options: number[];
  correctAnswer: number;
  clue: string;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  timeSeconds: number;
  streak: number;
  timestamp: string;
}

const STORAGE_KEY = 'fibonacci_exhibition_leaderboard_v1';

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'seed-1',
    name: 'Leonardo P.',
    timeSeconds: 11.4,
    streak: 5,
    timestamp: 'Exhibition Record',
  },
  {
    id: 'seed-2',
    name: 'Ada Lovelace',
    timeSeconds: 14.8,
    streak: 5,
    timestamp: 'Booth Benchmark',
  },
  {
    id: 'seed-3',
    name: 'Kepler Lab',
    timeSeconds: 19.2,
    streak: 4,
    timestamp: 'Booth Benchmark',
  },
];

const DETECTIVE_CASES: CaseItem[] = [
  {
    id: 1,
    title: 'Case 01 · Forward Sequence Trace',
    difficulty: 'Level 1',
    promptSequence: ['2', '3', '5', '8', '13', '?'],
    options: [20, 21, 22, 24],
    correctAnswer: 21,
    clue: '8 + 13 = 21.',
  },
  {
    id: 2,
    title: 'Case 02 · Classic Origin Chain',
    difficulty: 'Level 2',
    promptSequence: ['1', '1', '2', '3', '5', '8', '?'],
    options: [11, 12, 13, 15],
    correctAnswer: 13,
    clue: '5 + 8 = 13.',
  },
  {
    id: 3,
    title: 'Case 03 · Missing Interior Term',
    difficulty: 'Level 3',
    promptSequence: ['5', '8', '?', '21', '34'],
    options: [12, 13, 14, 16],
    correctAnswer: 13,
    clue: '5 + 8 = 13, and 8 + 13 = 21.',
  },
  {
    id: 4,
    title: 'Case 04 · High-Order Jump',
    difficulty: 'Level 4',
    promptSequence: ['13', '21', '34', '55', '89', '?'],
    options: [134, 144, 142, 154],
    correctAnswer: 144,
    clue: '55 + 89 = 144.',
  },
  {
    id: 5,
    title: 'Case 05 · Reverse Deduction',
    difficulty: 'Level 5',
    promptSequence: ['?', '8', '13', '21', '34'],
    options: [3, 4, 5, 6],
    correctAnswer: 5,
    clue: '21 − 13 = 8, and 13 − 8 = 5.',
  },
];

export const Section7FibonacciDetective: React.FC = () => {
  const [currentCaseIndex, setCurrentCaseIndex] = useState<number>(0);
  const [solvedCount, setSolvedCount] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<'idle' | 'success' | 'fail'>('idle');
  const [streak, setStreak] = useState<number>(0);
  const [hadWrongAttemptOnCurrent, setHadWrongAttemptOnCurrent] = useState<boolean>(false);

  // Live timer state
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [elapsedDeciseconds, setElapsedDeciseconds] = useState<number>(0);

  // Booth Leaderboard state
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_LEADERBOARD;
  });
  const [visitorName, setVisitorName] = useState<string>('');
  const [scoreSubmitted, setScoreSubmitted] = useState<boolean>(false);

  const currentCase = DETECTIVE_CASES[currentCaseIndex];
  const isGameFinished = solvedCount === DETECTIVE_CASES.length;

  useEffect(() => {
    if (!timerRunning || isGameFinished) return;
    const interval = setInterval(() => {
      setElapsedDeciseconds((prev) => prev + 1);
    }, 100);
    return () => clearInterval(interval);
  }, [timerRunning, isGameFinished]);

  const handleSelectAnswer = (option: number) => {
    if (statusMessage === 'success') return;
    if (!timerRunning && solvedCount === 0) {
      setTimerRunning(true);
    }

    setSelectedOption(option);

    if (option === currentCase.correctAnswer) {
      setStatusMessage('success');
      const nextSolved = Math.max(solvedCount, currentCaseIndex + 1);
      setSolvedCount(nextSolved);

      if (!hadWrongAttemptOnCurrent) {
        setStreak((s) => s + 1);
      }

      if (nextSolved === DETECTIVE_CASES.length) {
        setTimerRunning(false);
        harmonicAudio.playChime('discover');
      } else {
        harmonicAudio.playChime('step', currentCaseIndex + 3);
      }
    } else {
      setStatusMessage('fail');
      setHadWrongAttemptOnCurrent(true);
      setStreak(0);
      harmonicAudio.playChime('error');
    }
  };

  const handleNextCase = () => {
    setSelectedOption(null);
    setStatusMessage('idle');
    setHadWrongAttemptOnCurrent(false);
    if (currentCaseIndex < DETECTIVE_CASES.length - 1) {
      setCurrentCaseIndex((prev) => prev + 1);
    }
  };

  const handleRestart = () => {
    setCurrentCaseIndex(0);
    setSolvedCount(0);
    setSelectedOption(null);
    setStatusMessage('idle');
    setStreak(0);
    setHadWrongAttemptOnCurrent(false);
    setTimerRunning(false);
    setElapsedDeciseconds(0);
    setScoreSubmitted(false);
    setVisitorName('');
    harmonicAudio.playChime('step', 1);
  };

  const handleRecordScore = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = visitorName.trim() || 'Booth Challenger';
    const finalSeconds = Math.max(1.2, Number((elapsedDeciseconds / 10).toFixed(1)));

    const newEntry: LeaderboardEntry = {
      id: `visitor-${Date.now()}`,
      name: cleanName,
      timeSeconds: finalSeconds,
      streak,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [...leaderboard, newEntry]
      .sort((a, b) => a.timeSeconds - b.timeSeconds)
      .slice(0, 8);

    setLeaderboard(updated);
    setScoreSubmitted(true);
    harmonicAudio.playChime('discover');

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }
  };

  const formattedTime = `${(elapsedDeciseconds / 10).toFixed(1)}s`;

  return (
    <section
      id="section-detective"
      className="lab-snap-section relative min-h-screen flex flex-col items-center justify-center py-24 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#020408] lab-grid-bg select-none overflow-hidden"
    >
      <div className="max-w-6xl mx-auto w-full flex flex-col items-center">
        {/* Clean Editorial Header */}
        <ScrollReveal direction="up">
          <div className="flex items-center justify-center gap-2 font-mono text-xs tracking-widest text-cyan-400 uppercase mb-3">
            <span>08</span>
            <span aria-hidden="true">·</span>
            <span>Interactive Exhibition Challenge</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-['Arial',sans-serif] font-semibold text-white tracking-wide uppercase mb-8 text-center">
            BECOME THE FIBONACCI DETECTIVE
          </h2>
        </ScrollReveal>

        {/* Main 2-Column Split: Active Detective Puzzle (7 cols) + Live Booth Leaderboard (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">
          {/* Left 7 Cols: Active Puzzle & Score Bar */}
          <ScrollReveal direction="right" delay={0.06} className="lg:col-span-7 flex flex-col">
            {/* Game Telemetry Bar */}
            <div className="w-full flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 rounded-xl bg-[#050a12] border border-cyan-500/25 mb-5 font-mono text-xs">
              <div className="text-amber-300 font-bold tracking-wider tabular-nums">
                CASES SOLVED: {solvedCount} / {DETECTIVE_CASES.length}
              </div>

              <div className="flex items-center gap-4 tabular-nums">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Streak: {streak}×</span>
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="flex items-center gap-1.5 text-slate-200 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{formattedTime}</span>
                </span>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <AnimatePresence mode="wait">
                {!isGameFinished ? (
                  <motion.div
                    key={currentCase.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full flex-1 p-6 sm:p-8 rounded-2xl bg-[#040811] border border-white/10 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between font-mono text-xs text-slate-400 mb-6">
                        <span>{currentCase.title}</span>
                        <span className="text-cyan-300">{currentCase.difficulty}</span>
                      </div>

                      {/* Sequence Puzzle Row */}
                      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 font-mono mb-8">
                        {currentCase.promptSequence.map((val, i) => {
                          const isTarget = val === '?';
                          return (
                            <React.Fragment key={i}>
                              <div
                                className={`px-4 sm:px-5 py-3 rounded-xl border text-xl sm:text-3xl font-bold tabular-nums transition-all duration-300 ${
                                  isTarget
                                    ? statusMessage === 'success'
                                      ? 'bg-[#ff69b4] text-slate-950 border-pink-300 scale-110 shadow-[0_0_25px_rgba(255,105,180,0.45)]'
                                      : 'bg-cyan-950/50 text-cyan-300 border-cyan-400'
                                    : 'bg-[#020408] text-slate-200 border-white/10'
                                }`}
                              >
                                {isTarget && statusMessage === 'success'
                                  ? currentCase.correctAnswer
                                  : val}
                              </div>
                              {i < currentCase.promptSequence.length - 1 && (
                                <span className="text-slate-600 select-none">,</span>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>

                      {/* 4 Possible Answers */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                        {currentCase.options.map((opt) => {
                          const isSelected = selectedOption === opt;
                          let btnStyle =
                            'bg-[#070d19] hover:bg-slate-800 text-slate-100 border-white/15 hover:border-cyan-400';

                          if (isSelected) {
                            if (opt === currentCase.correctAnswer) {
                              btnStyle = 'bg-[#ff69b4] text-slate-950 border-pink-300 font-bold shadow-[0_0_20px_rgba(255,105,180,0.45)]';
                            } else {
                              btnStyle = 'bg-rose-950/70 text-rose-300 border-rose-500';
                            }
                          }

                          return (
                            <button
                              key={opt}
                              type="button"
                              disabled={statusMessage === 'success'}
                              onClick={() => handleSelectAnswer(opt)}
                              className={`py-4 rounded-xl border text-xl sm:text-2xl font-mono font-bold tabular-nums transition-all cursor-pointer active:scale-95 ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Feedback & Next Case Trigger */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-white/10 font-mono text-xs">
                      <div>
                        {statusMessage === 'success' ? (
                          <span className="text-emerald-400 flex items-center gap-2 font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Case Solved: {currentCase.clue}</span>
                          </span>
                        ) : statusMessage === 'fail' ? (
                          <span className="text-rose-300">
                            Not quite. Sum the two preceding terms in the sequence.
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            Select the number that completes the Fibonacci pattern.
                          </span>
                        )}
                      </div>

                      {statusMessage === 'success' &&
                        currentCaseIndex < DETECTIVE_CASES.length - 1 && (
                          <button
                            type="button"
                            onClick={handleNextCase}
                            className="px-5 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold tracking-widest uppercase transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <span>NEXT CASE</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="master-complete"
                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full flex-1 p-6 sm:p-10 rounded-2xl bg-[#040811] border border-amber-400/50 text-center flex flex-col justify-center"
                  >
                    <Award className="w-11 h-11 text-amber-400 mx-auto mb-3" />

                    <h3 className="text-2xl sm:text-3xl font-['Arial',sans-serif] font-bold text-amber-300 uppercase tracking-wide mb-2 glow-gold">
                      FIBONACCI DETECTIVE LEVEL: MASTER
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 font-mono max-w-md mx-auto mb-6 tabular-nums">
                      Completed all 5 cases in{' '}
                      <strong className="text-cyan-300">{formattedTime}</strong> with a{' '}
                      <strong className="text-amber-300">{streak}×</strong> streak!
                    </p>

                    {!scoreSubmitted ? (
                      <form
                        onSubmit={handleRecordScore}
                        className="max-w-sm mx-auto w-full flex flex-col sm:flex-row gap-2 mb-6"
                      >
                        <input
                          type="text"
                          value={visitorName}
                          onChange={(e) => setVisitorName(e.target.value)}
                          placeholder="Enter your name for Booth Leaderboard..."
                          maxLength={24}
                          className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#020408] border border-white/15 text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-400"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap"
                        >
                          Record Score
                        </button>
                      </form>
                    ) : (
                      <div className="mb-6 font-mono text-xs text-emerald-400">
                        ✓ Score recorded on the Exhibition Booth Leaderboard!
                      </div>
                    )}

                    <div>
                      <button
                        type="button"
                        onClick={handleRestart}
                        className="px-6 py-3 rounded-xl bg-[#ff69b4] hover:bg-pink-300 text-slate-950 font-mono text-xs font-bold tracking-widest uppercase transition-all inline-flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,105,180,0.45)]"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>NEXT VISITOR / PLAY AGAIN</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollReveal>

          {/* Right 5 Cols: Live Exhibition Booth Leaderboard */}
          <ScrollReveal direction="left" delay={0.12} className="lg:col-span-5 flex">
            <div className="w-full p-6 rounded-2xl bg-[#050a14] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2 font-mono text-xs text-amber-400 uppercase tracking-widest font-bold">
                    <Trophy className="w-4 h-4" />
                    <span>Live Booth Leaderboard</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 uppercase">
                    Fastest 5-Case Clear
                  </span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  {leaderboard.map((entry, idx) => {
                    const isTop = idx === 0;
                    return (
                      <div
                        key={entry.id}
                        className={`px-3.5 py-2.5 rounded-xl border flex items-center justify-between tabular-nums ${
                          isTop
                            ? 'bg-amber-400/15 border-amber-400/50 text-amber-200'
                            : 'bg-[#02050b] border-white/10 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-5 text-center font-bold ${
                              isTop ? 'text-amber-300' : 'text-slate-500'
                            }`}
                          >
                            #{idx + 1}
                          </span>
                          <div className="truncate">
                            <div className="font-semibold text-white truncate">{entry.name}</div>
                            <div className="text-[10px] text-slate-500">
                              {entry.streak}× streak · {entry.timestamp}
                            </div>
                          </div>
                        </div>

                        <div
                          className={`text-sm font-bold shrink-0 ${
                            isTop ? 'text-amber-300' : 'text-cyan-300'
                          }`}
                        >
                          {entry.timeSeconds.toFixed(1)}s
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between font-mono text-[10px] text-slate-500">
                <span>Solve all 5 cases to post your time</span>
                <button
                  type="button"
                  onClick={() => {
                    setLeaderboard(DEFAULT_LEADERBOARD);
                    try {
                      localStorage.removeItem(STORAGE_KEY);
                    } catch {
                      // ignore
                    }
                  }}
                  className="hover:text-slate-300 underline cursor-pointer"
                >
                  Reset Board
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
