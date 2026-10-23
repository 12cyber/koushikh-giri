import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';
import { harmonicAudio } from '../utils/harmonicAudio';

const SECTIONS = [
  { id: 'section-discover', num: '01', label: 'DISCOVER' },
  { id: 'section-growth', num: '02', label: 'GROW' },
  { id: 'section-build', num: '03', label: 'BUILD' },
  { id: 'section-golden', num: '04', label: 'CONNECT' },
  { id: 'section-3d-lab', num: '05', label: '3D LAB' },
  { id: 'section-music-lab', num: '06', label: 'SYNTH' },
  { id: 'section-explore', num: '07', label: 'EXPLORE' },
  { id: 'section-detective', num: '08', label: 'PLAY' },
  { id: 'section-infinite', num: '09', label: 'INFINITY' },
];

export const SideNavHUD: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('section-discover');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(harmonicAudio.isEnabled());

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 28,
    restDelta: 0.001,
  });

  const spiralRotate = useTransform(smoothProgress, [0, 1], [0, 1080]);

  useEffect(() => {
    return harmonicAudio.subscribe(setSoundEnabled);
  }, []);

  useEffect(() => {
    let cachedOffsets: Array<{ id: string; top: number }> = [];
    let ticking = false;

    const measureOffsets = () => {
      cachedOffsets = SECTIONS.map((sec) => {
        const el = document.getElementById(sec.id);
        return { id: sec.id, top: el ? el.offsetTop : 0 };
      });
    };

    measureOffsets();

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollPos = window.scrollY + window.innerHeight * 0.42;
        for (let i = cachedOffsets.length - 1; i >= 0; i--) {
          if (cachedOffsets[i].top <= scrollPos) {
            setActiveSection((prev) =>
              prev === cachedOffsets[i].id ? prev : cachedOffsets[i].id
            );
            break;
          }
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', measureOffsets, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', measureOffsets);
    };
  }, []);

  const scrollToSection = (id: string, idx: number) => {
    harmonicAudio.playChime('step', idx);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Top GPU-Accelerated Golden Ratio Scroll Progress Bar */}
      <motion.div
        style={{ scaleX: smoothProgress, transformOrigin: '0% 50%' }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-amber-400 to-cyan-300 z-50 pointer-events-none shadow-[0_0_12px_rgba(245,158,11,0.7)]"
      />

      {/* Desktop Minimal Side Indicator */}
      <aside
        aria-label="Laboratory stage navigation"
        className="fixed right-4 xl:right-7 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-end gap-2 font-mono text-[11px]"
      >
        {/* Scroll-linked rotating Fibonacci emblem + Sound Chime Toggle */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => harmonicAudio.toggle()}
            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 text-[10px] transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-[#03060a]/90 border-cyan-500/40 text-cyan-300 hover:text-white'
                : 'bg-[#03060a]/85 border-white/10 text-slate-500 hover:text-slate-300'
            }`}
            title={soundEnabled ? 'Mute interaction harmonic chimes' : 'Enable harmonic chimes'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Chimes On' : 'Muted'}</span>
          </button>

          <div className="px-2.5 py-1.5 rounded-lg bg-[#03060a]/85 border border-white/10 flex items-center gap-1.5 text-[10px] text-slate-400">
            <motion.svg
              style={{ rotate: spiralRotate }}
              viewBox="-12 -12 24 24"
              className="w-4 h-4 text-amber-400"
            >
              <path
                d="M 0 0 A 2 2 0 0 1 2 2 A 4 4 0 0 1 -2 6 A 6 6 0 0 1 -8 0 A 9 9 0 0 1 1 -9"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </motion.svg>
            <span className="tracking-widest uppercase text-amber-300/90">φ</span>
          </div>
        </div>

        <div className="flex flex-col gap-0.5 py-2.5 px-2 bg-[#03060a]/85 backdrop-blur-md border-l border-white/10">
          {SECTIONS.map((sec, idx) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollToSection(sec.id, idx)}
                className={`flex items-center justify-between gap-4 text-left px-2.5 py-1.5 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 ${
                  isActive
                    ? 'text-cyan-300 font-semibold translate-x-[-3px]'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span
                    className={`tabular-nums transition-colors ${
                      isActive ? 'text-amber-400 font-bold' : 'text-slate-600'
                    }`}
                  >
                    {sec.num}
                  </span>
                  <span className="tracking-widest">{sec.label}</span>
                </div>
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee] scale-125'
                      : 'bg-white/10'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </aside>

      {/* Mobile Compact Bottom Stage Strip */}
      <nav
        aria-label="Mobile stage navigation"
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#03060a]/95 backdrop-blur-md border-t border-white/10 px-2 py-2 flex items-center justify-between overflow-x-auto font-mono text-[10px]"
      >
        {SECTIONS.map((sec, idx) => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => scrollToSection(sec.id, idx)}
              className={`px-2 py-1 rounded transition-colors flex flex-col items-center gap-0.5 whitespace-nowrap shrink-0 ${
                isActive ? 'text-cyan-300 font-bold' : 'text-slate-500'
              }`}
            >
              <span className={isActive ? 'text-amber-400' : 'text-slate-600'}>
                {sec.num}
              </span>
              <span className="tracking-wider text-[8px]">{sec.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
