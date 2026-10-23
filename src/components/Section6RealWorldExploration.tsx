import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollReveal } from './ScrollReveal';
import { harmonicAudio } from '../utils/harmonicAudio';

type SectorKey = 'NATURE' | 'ART' | 'COMPUTING' | 'ARCHITECTURE' | 'MATHEMATICS';

interface SectorNode {
  id: SectorKey;
  label: string;
  coords: { x: number; y: number };
  title: string;
  subtitle: string;
  explanation: string;
  scientificNote: string;
  formula: string;
}

const MAP_NODES: Record<SectorKey, SectorNode> = {
  NATURE: {
    id: 'NATURE',
    label: 'NATURE',
    coords: { x: 180, y: 95 },
    title: 'Botanical Phyllotaxis & Spiral Growth',
    subtitle: 'Sunflower seed heads, pinecones, and leaf divergence angles',
    explanation:
      'In certain plant growth arrangements—such as sunflower florets (34 and 55 spirals) and pinecone bracts (8 and 13 spirals)—new primordia emerge at the Golden Angle of ~137.5°. This mathematical packing minimizes mutual shading and maximizes space efficiency.',
    scientificNote:
      'Scientific accuracy: Fibonacci numbers do not occur universally in every organism or shell. Rather than being a mystical law, phyllotactic spirals emerge mechanically when plant hormones (auxin) space new buds at the most irrational angle.',
    formula: 'Golden Angle = 360° × (1 − 1/φ) ≈ 137.5077°',
  },
  ART: {
    id: 'ART',
    label: 'ART',
    coords: { x: 460, y: 80 },
    title: 'Compositional Proportions & Visual Rhythm',
    subtitle: 'Modular typography scales, book design, and twentieth-century abstraction',
    explanation:
      'Fibonacci proportions and the Golden Ratio have consciously influenced specific design practices—such as Jan Tschichold’s book page canons, Béla Bartók’s musical phrasing, and modern typographic scales (8pt, 13pt, 21pt, 34pt, 55pt).',
    scientificNote:
      'Historical accuracy: While modern designers actively use Fibonacci ratios for harmonic hierarchy, not every famous Renaissance painting or classical sculpture was built on the Golden Ratio.',
    formula: 'Typographic Scale: 8 → 13 → 21 → 34 → 55 → 89 px',
  },
  COMPUTING: {
    id: 'COMPUTING',
    label: 'COMPUTING',
    coords: { x: 650, y: 175 },
    title: 'Algorithms, Complexity & Data Structures',
    subtitle: 'Fibonacci heaps, search algorithms, and dynamic programming',
    explanation:
      'In computer science, Fibonacci numbers underpin the Fibonacci Heap priority queue (achieving O(1) amortized time for insert and decrease-key in shortest-path network routing) and the Fibonacci Search algorithm, which divides sorted arrays using addition rather than division.',
    scientificNote:
      'Computing F(n) also serves as the foundational benchmark for comparing naive exponential recursion O(2ⁿ) against linear memoization O(n) and matrix exponentiation O(log n).',
    formula: 'Dijkstra Runtime with Fibonacci Heap: O(E + V log V)',
  },
  ARCHITECTURE: {
    id: 'ARCHITECTURE',
    label: 'ARCHITECTURE',
    coords: { x: 260, y: 245 },
    title: 'The Modulor & Spatial Harmonics',
    subtitle: 'Human-scaled architectural proportion systems and biomimetic solar arrays',
    explanation:
      'In the twentieth century, architect Le Corbusier developed the Modulor—two interwoven Fibonacci-like measurement series scaled to human stature to proportion structural bays, cabinetry, and facades. Today, engineers also arrange solar heliostat fields in Fibonacci spirals to reduce land footprint.',
    scientificNote:
      'Biomimetic sunflower layouts in concentrated solar power plants have been shown to reduce mirror shading and improve energy capture efficiency.',
    formula: 'Modulor Series: d(n) = d(n − 1) + d(n − 2)',
  },
  MATHEMATICS: {
    id: 'MATHEMATICS',
    label: 'MATHEMATICS',
    coords: { x: 520, y: 260 },
    title: 'Number Theory, Pascal’s Triangle & Pisano Cycles',
    subtitle: 'Shallow diagonals, Cassini’s identity, and Zeckendorf’s theorem',
    explanation:
      'Summing the shallow diagonals of Pascal’s Triangle produces the Fibonacci sequence directly. Furthermore, every positive integer can be written uniquely as a sum of non-consecutive Fibonacci numbers (Zeckendorf’s Theorem), and Fibonacci remainders modulo m always repeat in periodic Pisano cycles.',
    scientificNote:
      'Cassini’s Identity proves that for any Fibonacci number F(n), the difference between F(n−1)·F(n+1) and F(n)² is always exactly +1 or −1.',
    formula: 'F(n−1) · F(n+1) − F(n)² = (−1)ⁿ',
  },
};

const NODE_KEYS: SectorKey[] = ['NATURE', 'ART', 'COMPUTING', 'ARCHITECTURE', 'MATHEMATICS'];

export const Section6RealWorldExploration: React.FC = () => {
  const [activeSector, setActiveSector] = useState<SectorKey>('NATURE');
  const [seedAngle, setSeedAngle] = useState<number>(137.5);
  const current = MAP_NODES[activeSector];

  const handleSelectSector = (key: SectorKey, idx: number) => {
    setActiveSector(key);
    harmonicAudio.playChime('step', idx + 3);
  };

  return (
    <section
      id="section-explore"
      className="relative min-h-screen flex flex-col items-center justify-center py-24 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#03050a] lab-grid-dense lab-snap-section select-none overflow-hidden"
    >
      <div className="max-w-6xl mx-auto w-full flex flex-col items-center">
        {/* Clean Editorial Header */}
        <ScrollReveal direction="up">
          <div className="flex items-center justify-center gap-2 font-mono text-xs tracking-widest text-cyan-400 uppercase mb-3">
            <span>07</span>
            <span aria-hidden="true">·</span>
            <span>Explore</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-['Arial',sans-serif] font-semibold text-white tracking-wide uppercase mb-3 text-center">
            Fibonacci in the Real World
          </h2>

          <p className="text-sm sm:text-base text-slate-400 font-mono text-center max-w-xl mb-10">
            Select a coordinate node on the exploration map to transform the laboratory viewport.
          </p>
        </ScrollReveal>

        {/* Interactive Exploration Map */}
        <ScrollReveal direction="scale" delay={0.08} className="w-full mb-8">
          <div className="w-full rounded-2xl bg-[#040812] border border-cyan-500/25 p-4 sm:p-6">
            <div className="relative w-full h-[220px] sm:h-[270px] bg-[#020408] rounded-xl border border-white/10 overflow-hidden">
              <svg viewBox="0 0 800 340" className="w-full h-full">
                <line x1="0" y1="170" x2="800" y2="170" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                <line x1="400" y1="0" x2="400" y2="340" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

                <polygon
                  points="180,95 460,80 650,175 520,260 260,245"
                  fill="rgba(6, 182, 212, 0.03)"
                  stroke="rgba(6, 182, 212, 0.2)"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                />
                <line x1="180" y1="95" x2="520" y2="260" stroke="rgba(245, 158, 11, 0.15)" strokeWidth="1" />
                <line x1="260" y1="245" x2="460" y2="80" stroke="rgba(245, 158, 11, 0.15)" strokeWidth="1" />

                {NODE_KEYS.map((key, idx) => {
                  const node = MAP_NODES[key];
                  const isSelected = activeSector === key;
                  return (
                    <g
                      key={key}
                      transform={`translate(${node.coords.x}, ${node.coords.y})`}
                      onClick={() => handleSelectSector(key, idx)}
                      className="cursor-pointer"
                    >
                      {isSelected && (
                        <circle
                          r="28"
                          fill="rgba(245, 158, 11, 0.12)"
                          stroke="#fbbf24"
                          strokeWidth="1.5"
                        />
                      )}
                      <circle
                        r={isSelected ? 10 : 7}
                        fill={isSelected ? '#fbbf24' : '#06b6d4'}
                        stroke="#020408"
                        strokeWidth="2.5"
                        className="transition-all duration-300"
                      />
                      <text
                        y="-16"
                        textAnchor="middle"
                        fill={isSelected ? '#fde68a' : '#e2e8f0'}
                        fontSize="12"
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight={isSelected ? '700' : '500'}
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              {NODE_KEYS.map((key, idx) => {
                const isSelected = activeSector === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectSector(key, idx)}
                    className={`px-4 py-2 rounded-lg font-mono text-xs font-semibold tracking-widest uppercase transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#ff69b4] hover:bg-pink-300 text-slate-950 font-bold shadow-[0_0_15px_rgba(255,105,180,0.45)]'
                        : 'bg-slate-900 text-slate-300 hover:text-white border border-white/10'
                    }`}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* Transformed Environment Viewport for Selected Location with Smooth Crossfade */}
        <ScrollReveal direction="up" delay={0.14} className="w-full">
          <div className="w-full p-6 sm:p-10 rounded-2xl bg-[#050a14] border border-white/10 min-h-[340px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSector}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-2 font-mono text-xs text-amber-400 uppercase tracking-widest">
                    <span>Location Active</span>
                    <span aria-hidden="true">·</span>
                    <span>{current.label}</span>
                  </div>

                  <h3 className="text-2xl sm:text-4xl font-['Arial',sans-serif] font-semibold text-white">
                    {current.title}
                  </h3>

                  <p className="font-mono text-xs sm:text-sm text-cyan-300">
                    {current.subtitle}
                  </p>

                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                    {current.explanation}
                  </p>

                  <div className="p-4 rounded-xl bg-[#03060a] border-l-2 border-amber-400 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {current.scientificNote}
                  </div>

                  <div className="pt-2 font-mono text-xs text-amber-300">
                    {current.formula}
                  </div>
                </div>

                {/* Domain-Specific Interactive Visual Diagram */}
                <div className="lg:col-span-5 p-5 rounded-xl bg-[#020408] border border-white/10 flex flex-col items-center justify-center min-h-[260px]">
                  {activeSector === 'NATURE' && (
                    <div className="w-full flex flex-col items-center">
                      <svg viewBox="-100 -100 200 200" className="w-44 h-44">
                        {Array.from({ length: 89 }).map((_, i) => {
                          const r = Math.sqrt(i + 1) * 9.2;
                          const theta = i * seedAngle * (Math.PI / 180);
                          const x = Math.cos(theta) * r;
                          const y = Math.sin(theta) * r;
                          return (
                            <circle
                              key={i}
                              cx={x}
                              cy={y}
                              r={i % 8 === 0 ? 2.8 : 2}
                              fill={i % 8 === 0 ? '#fbbf24' : '#22d3ee'}
                            />
                          );
                        })}
                      </svg>
                      <label className="w-full font-mono text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                        <span>Seed Angle: {seedAngle.toFixed(1)}°</span>
                        <button
                          type="button"
                          onClick={() => setSeedAngle(137.5)}
                          className="text-amber-300 underline cursor-pointer"
                        >
                          Reset 137.5°
                        </button>
                      </label>
                      <input
                        type="range"
                        min="134"
                        max="141"
                        step="0.1"
                        value={seedAngle}
                        onChange={(e) => setSeedAngle(parseFloat(e.target.value))}
                        className="w-full accent-amber-400 mt-1 cursor-pointer"
                      />
                    </div>
                  )}

                  {activeSector === 'ART' && (
                    <div className="w-full space-y-2.5 font-mono">
                      <div className="text-xs text-slate-400 mb-2">
                        Proportional Golden Division (a : b = 1.618)
                      </div>
                      {[8, 13, 21, 34, 55].map((size) => (
                        <div key={size} className="flex items-center gap-3">
                          <span className="text-xs text-amber-400 w-10 tabular-nums">{size}px</span>
                          <div
                            style={{ width: `${(size / 55) * 100}%` }}
                            className="h-3 rounded bg-cyan-400/40 border border-cyan-400"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {activeSector === 'COMPUTING' && (
                    <div className="w-full space-y-3 font-mono text-xs">
                      <div className="text-slate-400">Operation Count for F(30):</div>
                      <div className="p-3 rounded bg-slate-900 border border-rose-500/30 flex justify-between">
                        <span className="text-rose-300">Naive Recursion O(2ⁿ)</span>
                        <span className="font-bold text-white tabular-nums">2,692,537 calls</span>
                      </div>
                      <div className="p-3 rounded bg-slate-900 border border-cyan-500/30 flex justify-between">
                        <span className="text-cyan-300">Dynamic Memoization O(n)</span>
                        <span className="font-bold text-white tabular-nums">30 additions</span>
                      </div>
                      <div className="p-3 rounded bg-slate-900 border border-amber-500/40 flex justify-between">
                        <span className="text-amber-300">Fast Matrix Doubling O(log n)</span>
                        <span className="font-bold text-white tabular-nums">5 steps</span>
                      </div>
                    </div>
                  )}

                  {activeSector === 'ARCHITECTURE' && (
                    <div className="w-full flex flex-col items-center font-mono text-xs">
                      <div className="w-full h-36 border-2 border-amber-400/70 grid grid-cols-12 rounded overflow-hidden">
                        <div className="col-span-7 border-r border-cyan-400/50 bg-amber-400/10 flex items-center justify-center text-amber-300 font-bold">
                          55 Parts (Major Span)
                        </div>
                        <div className="col-span-5 flex flex-col">
                          <div className="flex-1 border-b border-cyan-400/50 bg-cyan-400/10 flex items-center justify-center text-cyan-300">
                            34 Parts
                          </div>
                          <div className="h-12 bg-slate-900 flex items-center justify-center text-slate-300">
                            21 Parts
                          </div>
                        </div>
                      </div>
                      <span className="text-slate-400 mt-3">
                        Harmonic Structural Partition (55 : 34 : 21)
                      </span>
                    </div>
                  )}

                  {activeSector === 'MATHEMATICS' && (
                    <div className="w-full font-mono text-xs space-y-2 text-center">
                      <div className="text-slate-400 mb-2">Pascal’s Triangle Shallow Diagonal Sums</div>
                      <div className="p-2 rounded bg-slate-900 text-amber-300">1 = 1</div>
                      <div className="p-2 rounded bg-slate-900 text-amber-300">1 + 1 = 2</div>
                      <div className="p-2 rounded bg-slate-900 text-amber-300">1 + 2 = 3</div>
                      <div className="p-2 rounded bg-slate-900 text-amber-300">1 + 3 + 1 = 5</div>
                      <div className="p-2 rounded bg-slate-900 text-cyan-300 font-bold">1 + 4 + 3 = 8</div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
