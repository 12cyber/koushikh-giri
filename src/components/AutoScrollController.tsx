import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Gauge, Film, ChevronUp, ChevronDown, Repeat } from 'lucide-react';
import { harmonicAudio } from '../utils/harmonicAudio';

interface AutoScrollControllerProps {
  disabled?: boolean;
  onReplayMovieIntro: () => void;
}

const SPEED_PRESETS = [0.5, 1, 2, 3];
const BASE_PIXELS_PER_SEC = 90; // Silky exhibition reading cadence at 1.0x

export const AutoScrollController: React.FC<AutoScrollControllerProps> = ({
  disabled = false,
  onReplayMovieIntro,
}) => {
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [loopOnFinish, setLoopOnFinish] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Store live controls in refs so the 60fps/120fps rAF loop never restarts when scrubbing the speed slider
  const speedMultiplierRef = useRef<number>(speedMultiplier);
  const loopOnFinishRef = useRef<boolean>(loopOnFinish);
  const onReplayRef = useRef(onReplayMovieIntro);

  useEffect(() => {
    speedMultiplierRef.current = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    loopOnFinishRef.current = loopOnFinish;
  }, [loopOnFinish]);

  useEffect(() => {
    onReplayRef.current = onReplayMovieIntro;
  }, [onReplayMovieIntro]);

  // Stop auto-scroll if disabled (e.g., while Movie Intro or Exhibition Slide Mode is active)
  useEffect(() => {
    if (disabled && isAutoScrolling) {
      setIsAutoScrolling(false);
    }
  }, [disabled, isAutoScrolling]);

  // Zero-Layout-Thrash Sub-Pixel Auto-Scroll Engine with Smooth Velocity Interpolation
  useEffect(() => {
    if (!isAutoScrolling || disabled) {
      document.documentElement.style.scrollSnapType = '';
      document.documentElement.style.scrollBehavior = '';
      return;
    }

    // Bypass CSS scroll-snap and CSS smooth-behavior so rAF has direct 1:1 sub-pixel control
    document.documentElement.style.scrollSnapType = 'none';
    document.documentElement.style.scrollBehavior = 'auto';

    let animFrameId: number;
    let lastTime = performance.now();
    let virtualScrollY = window.scrollY;
    let currentVelocity = BASE_PIXELS_PER_SEC * speedMultiplierRef.current;
    let frameCounter = 0;
    let cachedMaxScroll =
      Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) -
      window.innerHeight;

    const updateMaxScroll = () => {
      cachedMaxScroll =
        Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) -
        window.innerHeight;
    };

    window.addEventListener('resize', updateMaxScroll, { passive: true });

    const stepScroll = (now: number) => {
      // Clamp frame delta to avoid jumps after tab-switching
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      // Refresh cached document height every 45 frames instead of forcing layout reflow every frame
      frameCounter++;
      if (frameCounter % 45 === 0) {
        updateMaxScroll();
      }

      // If external navigation jumped scroll position, resync virtualScrollY smoothly
      if (Math.abs(window.scrollY - virtualScrollY) > 45) {
        virtualScrollY = window.scrollY;
      }

      // Smoothly interpolate velocity when user adjusts the speed slider
      const targetVelocity = BASE_PIXELS_PER_SEC * speedMultiplierRef.current;
      currentVelocity += (targetVelocity - currentVelocity) * Math.min(1, dt * 12);

      virtualScrollY += currentVelocity * dt;

      // Sub-pixel direct scroll assignment (zero CSS smooth-scroll fighting)
      window.scrollTo(0, virtualScrollY);

      if (virtualScrollY >= cachedMaxScroll - 3 && cachedMaxScroll > 100) {
        if (loopOnFinishRef.current) {
          setIsAutoScrolling(false);
          onReplayRef.current();
          return;
        } else {
          setIsAutoScrolling(false);
          return;
        }
      }

      animFrameId = requestAnimationFrame(stepScroll);
    };

    animFrameId = requestAnimationFrame(stepScroll);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', updateMaxScroll);
      document.documentElement.style.scrollSnapType = '';
      document.documentElement.style.scrollBehavior = '';
    };
  }, [isAutoScrolling, disabled]);

  // Pause auto-scroll if the user manually scrolls with mouse wheel or touch
  useEffect(() => {
    if (!isAutoScrolling) return;

    const handleUserInterrupt = () => {
      setIsAutoScrolling(false);
    };

    window.addEventListener('wheel', handleUserInterrupt, { passive: true });
    window.addEventListener('touchmove', handleUserInterrupt, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleUserInterrupt);
      window.removeEventListener('touchmove', handleUserInterrupt);
    };
  }, [isAutoScrolling]);

  if (disabled) return null;

  return (
    <div
      aria-label="Auto-Scroll and Cinema Controls"
      className="fixed bottom-16 md:bottom-6 left-3 sm:left-6 z-40 font-mono text-xs select-none"
    >
      <div className="rounded-2xl bg-[#040914]/95 backdrop-blur-xl border border-cyan-400/40 shadow-[0_0_30px_rgba(0,0,0,0.8)] p-3 flex flex-col gap-2.5 w-[260px] sm:w-[290px]">
        {/* Header Row: Title + Minimize + Replay Movie */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
            <Gauge className="w-3.5 h-3.5 text-[#ff69b4]" />
            <span>Auto-Scroll Director</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setIsAutoScrolling(false);
                onReplayMovieIntro();
              }}
              className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-400/30 text-[10px] flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
              title="Replay 'GRADE 10 AND 9 PRESENTS' Movie Intro"
            >
              <Film className="w-3 h-3" />
              <span>Intro</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMinimized((prev) => !prev)}
              className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 cursor-pointer"
              title={isMinimized ? 'Expand speed controls' : 'Minimize speed controls'}
              aria-label="Toggle auto-scroll speed panel"
            >
              {isMinimized ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Primary Auto-Scroll Play / Pause Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const next = !isAutoScrolling;
              setIsAutoScrolling(next);
              harmonicAudio.playChime('step', next ? 5 : 2);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
              isAutoScrolling
                ? 'bg-[#ff69b4] hover:bg-pink-300 text-slate-950 shadow-[0_0_20px_rgba(255,105,180,0.45)]'
                : 'bg-cyan-500/20 hover:bg-cyan-400 text-cyan-200 hover:text-slate-950 border border-cyan-400/50'
            }`}
          >
            {isAutoScrolling ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Scroll ({speedMultiplier.toFixed(1)}×)</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Auto-Scroll ({speedMultiplier.toFixed(1)}×)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setLoopOnFinish((prev) => !prev)}
            className={`p-2.5 rounded-xl border cursor-pointer transition-colors ${
              loopOnFinish
                ? 'bg-[#ff69b4] text-slate-950 border-pink-300 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border-white/10'
            }`}
            title={
              loopOnFinish
                ? 'Auto-Loop ON: Replays Movie Intro when reaching bottom'
                : 'Enable Auto-Loop at bottom of page'
            }
            aria-label="Toggle auto-restart at bottom of page"
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Expandable Speed Slider & Quick Presets */}
        {!isMinimized && (
          <div className="pt-2 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <label htmlFor="autoscroll-speed-range" className="text-slate-400">
                Scroll Speed
              </label>
              <span className="text-[#ff69b4] font-bold tabular-nums">
                {speedMultiplier.toFixed(1)}× ({Math.round(speedMultiplier * BASE_PIXELS_PER_SEC)} px/s)
              </span>
            </div>

            <input
              id="autoscroll-speed-range"
              type="range"
              min="0.3"
              max="4.0"
              step="0.1"
              value={speedMultiplier}
              onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
              className="w-full accent-[#ff69b4] h-1.5 bg-slate-900 rounded-lg cursor-pointer"
            />

            <div className="grid grid-cols-4 gap-1.5 pt-0.5">
              {SPEED_PRESETS.map((preset) => {
                const isSelected = Math.abs(speedMultiplier - preset) < 0.05;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSpeedMultiplier(preset)}
                    className={`py-1 rounded border text-[10px] tabular-nums cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#ff69b4] text-slate-950 border-pink-300 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white border-white/10'
                    }`}
                  >
                    {preset}×
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
