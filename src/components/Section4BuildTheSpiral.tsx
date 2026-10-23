import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, RotateCcw, Check } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { harmonicAudio } from '../utils/harmonicAudio';

interface BuildSquare {
  step: string;
  size: number;
  label: string;
  x: number;
  y: number;
  arcStartAngle: number;
  arcEndAngle: number;
  arcCenterX: number;
  arcCenterY: number;
}

const BUILD_STEPS: BuildSquare[] = [
  {
    step: 'STEP 01',
    size: 1,
    label: '1 × 1',
    x: 0,
    y: -1,
    arcCenterX: 0,
    arcCenterY: 0,
    arcStartAngle: -Math.PI / 2,
    arcEndAngle: 0,
  },
  {
    step: 'STEP 02',
    size: 1,
    label: '1 × 1',
    x: -1,
    y: -1,
    arcCenterX: 0,
    arcCenterY: -1,
    arcStartAngle: -Math.PI,
    arcEndAngle: -Math.PI / 2,
  },
  {
    step: 'STEP 03',
    size: 2,
    label: '2 × 2',
    x: -1,
    y: -3,
    arcCenterX: -1,
    arcCenterY: -1,
    arcStartAngle: Math.PI / 2,
    arcEndAngle: Math.PI,
  },
  {
    step: 'STEP 04',
    size: 3,
    label: '3 × 3',
    x: 1,
    y: -3,
    arcCenterX: 1,
    arcCenterY: 0,
    arcStartAngle: 0,
    arcEndAngle: Math.PI / 2,
  },
  {
    step: 'STEP 05',
    size: 5,
    label: '5 × 5',
    x: -1,
    y: 0,
    arcCenterX: -1,
    arcCenterY: 0,
    arcStartAngle: -Math.PI / 2,
    arcEndAngle: 0,
  },
  {
    step: 'STEP 06',
    size: 8,
    label: '8 × 8',
    x: -9,
    y: -3,
    arcCenterX: -1,
    arcCenterY: 5,
    arcStartAngle: -Math.PI,
    arcEndAngle: -Math.PI / 2,
  },
];

export const Section4BuildTheSpiral: React.FC = () => {
  const [placedCount, setPlacedCount] = useState<number>(1);
  const [isCompleteBannerVisible, setIsCompleteBannerVisible] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const cameraRef = useRef({
    scale: 120,
    centerX: 0.5,
    centerY: -0.5,
    arcProgress: 1,
    squareAlpha: 1,
  });

  const allSquaresPlaced = placedCount >= BUILD_STEPS.length;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    cameraRef.current.squareAlpha = 0.15;

    const visibleSquares = BUILD_STEPS.slice(0, placedCount);
    let minX = 0,
      maxX = 1,
      minY = -1,
      maxY = 0;
    visibleSquares.forEach((sq) => {
      minX = Math.min(minX, sq.x);
      maxX = Math.max(maxX, sq.x + sq.size);
      minY = Math.min(minY, sq.y);
      maxY = Math.max(maxY, sq.y + sq.size);
    });

    const targetCenterX = (minX + maxX) / 2;
    const targetCenterY = (minY + maxY) / 2;
    const targetArc = allSquaresPlaced ? BUILD_STEPS.length : placedCount - 0.1;

    if (!allSquaresPlaced) {
      setIsCompleteBannerVisible(false);
    }

    const renderFrame = () => {
      const width = canvas.parentElement?.clientWidth || 680;
      const height = 420;
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const boxWidth = maxX - minX;
      const boxHeight = maxY - minY;
      const padding = 48;
      const scaleX = (width - padding * 2) / Math.max(boxWidth, 2);
      const scaleY = (height - padding * 2) / Math.max(boxHeight, 2);
      const targetScale = Math.min(scaleX, scaleY);

      const cam = cameraRef.current;
      cam.scale += (targetScale - cam.scale) * 0.14;
      cam.centerX += (targetCenterX - cam.centerX) * 0.14;
      cam.centerY += (targetCenterY - cam.centerY) * 0.14;
      cam.squareAlpha = Math.min(1, cam.squareAlpha + 0.08);

      const arcSpeed = allSquaresPlaced ? 0.08 : 0.15;
      if (cam.arcProgress < targetArc) {
        cam.arcProgress = Math.min(targetArc, cam.arcProgress + arcSpeed);
      } else if (cam.arcProgress > targetArc) {
        cam.arcProgress = targetArc;
      }

      if (allSquaresPlaced && cam.arcProgress >= BUILD_STEPS.length - 0.05) {
        setIsCompleteBannerVisible(true);
      }

      const offsetX = width / 2 - cam.centerX * cam.scale;
      const offsetY = height / 2 + cam.centerY * cam.scale;

      const toScreenX = (x: number) => offsetX + x * cam.scale;
      const toScreenY = (y: number) => offsetY - y * cam.scale;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let gx = -12; gx <= 12; gx++) {
        const sx = toScreenX(gx);
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, height);
        ctx.stroke();
      }
      for (let gy = -10; gy <= 10; gy++) {
        const sy = toScreenY(gy);
        ctx.beginPath();
        ctx.moveTo(0, sy);
        ctx.lineTo(width, sy);
        ctx.stroke();
      }

      visibleSquares.forEach((sq, i) => {
        const sx = toScreenX(sq.x);
        const sy = toScreenY(sq.y + sq.size);
        const sSize = sq.size * cam.scale;
        const isLatest = i === placedCount - 1;
        const alpha = isLatest ? cam.squareAlpha : 1;

        ctx.fillStyle =
          isLatest && !allSquaresPlaced
            ? `rgba(6, 182, 212, ${0.18 * alpha})`
            : `rgba(245, 158, 11, ${0.07 * alpha})`;
        ctx.fillRect(sx, sy, sSize, sSize);

        ctx.strokeStyle =
          isLatest && !allSquaresPlaced
            ? `rgba(34, 211, 238, ${alpha})`
            : `rgba(245, 158, 11, ${0.58 * alpha})`;
        ctx.lineWidth = isLatest && !allSquaresPlaced ? 2 : 1.25;
        ctx.strokeRect(sx, sy, sSize, sSize);

        ctx.fillStyle = isLatest && !allSquaresPlaced ? '#67e8f9' : '#fde68a';
        ctx.globalAlpha = alpha;
        ctx.font = `${Math.max(11, Math.min(18, sSize * 0.22))}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sq.label, sx + sSize / 2, sy + sSize / 2);
        ctx.globalAlpha = 1;
      });

      ctx.strokeStyle = allSquaresPlaced ? '#fbbf24' : 'rgba(6, 182, 212, 0.55)';
      ctx.lineWidth = allSquaresPlaced ? 3.5 : 2.2;
      ctx.lineCap = 'round';
      if (allSquaresPlaced) {
        ctx.shadowColor = 'rgba(245, 158, 11, 0.65)';
        ctx.shadowBlur = 14;
      }

      visibleSquares.forEach((sq, idx) => {
        if (idx > cam.arcProgress) return;
        const localFraction = Math.min(1, Math.max(0, cam.arcProgress - idx));
        if (localFraction <= 0) return;

        const cx = toScreenX(sq.arcCenterX);
        const cy = toScreenY(sq.arcCenterY);
        const r = sq.size * cam.scale;

        const startA = -sq.arcStartAngle;
        const fullEndA = -sq.arcEndAngle;
        let delta = fullEndA - startA;
        while (delta > 0) delta -= Math.PI * 2;
        const currentEndA = startA + delta * localFraction;

        ctx.beginPath();
        ctx.arc(cx, cy, r, startA, currentEndA, true);
        ctx.stroke();
      });

      ctx.restore();

      const stillMoving =
        Math.abs(targetScale - cam.scale) > 0.05 ||
        Math.abs(targetCenterX - cam.centerX) > 0.01 ||
        Math.abs(targetCenterY - cam.centerY) > 0.01 ||
        Math.abs(targetArc - cam.arcProgress) > 0.01 ||
        cam.squareAlpha < 0.99;

      if (stillMoving) {
        animId = requestAnimationFrame(renderFrame);
      }
    };

    animId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(animId);
  }, [placedCount, allSquaresPlaced]);

  const handleNext = () => {
    if (placedCount < BUILD_STEPS.length) {
      const next = placedCount + 1;
      setPlacedCount(next);
      harmonicAudio.playChime(next === BUILD_STEPS.length ? 'success' : 'spiral', next + 2);
    }
  };

  const handleReset = () => {
    cameraRef.current.arcProgress = 0.8;
    setPlacedCount(1);
    setIsCompleteBannerVisible(false);
    harmonicAudio.playChime('step', 1);
  };

  return (
    <section
      id="section-build"
      className="relative min-h-screen flex flex-col items-center justify-center py-24 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#020409] lab-grid-dense lab-snap-section select-none overflow-hidden"
    >
      <div className="max-w-6xl mx-auto w-full flex flex-col items-center">
        {/* Clean Editorial Header */}
        <ScrollReveal direction="up">
          <div className="flex items-center justify-center gap-2 font-mono text-xs tracking-widest text-cyan-400 uppercase mb-3">
            <span>03</span>
            <span aria-hidden="true">·</span>
            <span>Build the Spiral</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-['Arial',sans-serif] font-semibold text-white tracking-wide uppercase mb-8 text-center">
            Construct the Fibonacci Spiral
          </h2>
        </ScrollReveal>

        {/* Main Interactive Grid: Step Track + Blueprint Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">
          {/* Left Column: The 6 Explicit Construction Steps */}
          <ScrollReveal direction="right" delay={0.06} className="lg:col-span-4 flex">
            <div className="w-full flex flex-col justify-between p-6 rounded-2xl bg-[#040811] border border-white/10">
              <div>
                <div className="font-mono text-xs text-slate-400 uppercase tracking-widest mb-4">
                  Construction Sequence
                </div>

                <div className="space-y-2.5 font-mono">
                  {BUILD_STEPS.map((s, idx) => {
                    const isPlaced = idx < placedCount;
                    const isCurrent = idx === placedCount - 1;
                    return (
                      <motion.button
                        key={s.step}
                        type="button"
                        initial={{ opacity: 0, x: -16 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.2 }}
                        transition={{
                          type: 'spring',
                          stiffness: 120,
                          damping: 18,
                          delay: idx * 0.045,
                        }}
                        onClick={() => setPlacedCount(idx + 1)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-colors duration-200 cursor-pointer ${
                          isCurrent
                            ? 'bg-cyan-500/15 border-cyan-400 text-white'
                            : isPlaced
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                            : 'bg-slate-950/60 border-white/5 text-slate-600'
                        }`}
                      >
                        <span className="text-xs tracking-widest font-semibold">{s.step}</span>
                        <span className="text-sm font-bold tabular-nums">{s.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* NEXT & RESET Controls */}
              <div className="mt-6 pt-5 border-t border-white/10 flex items-center gap-3">
                {!allSquaresPlaced ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 py-3.5 px-5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono text-xs sm:text-sm font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.35)] active:scale-95"
                  >
                    <span>NEXT</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 py-3.5 px-5 rounded-xl bg-[#ff69b4] hover:bg-pink-300 text-slate-950 font-mono text-xs sm:text-sm font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,105,180,0.45)]"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>REBUILD SPIRAL</span>
                  </button>
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* Right Column: Live Geometric Canvas */}
          <ScrollReveal direction="left" delay={0.12} className="lg:col-span-8 flex">
            <div className="w-full rounded-2xl bg-[#040811] border border-cyan-500/25 p-4 flex flex-col justify-between relative overflow-hidden min-h-[420px]">
              <canvas ref={canvasRef} className="w-full h-[420px] block" />

              {isCompleteBannerVisible && (
                <div className="mt-3 p-4 rounded-xl bg-amber-400/15 border border-amber-400/50 flex flex-col sm:flex-row items-center justify-between gap-2 animate-fadeIn">
                  <div className="flex items-center gap-2.5 font-['Arial',sans-serif] text-lg sm:text-xl font-bold text-amber-300 tracking-wide uppercase">
                    <Check className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>YOU BUILT THE FIBONACCI SPIRAL.</span>
                  </div>
                  <span className="font-mono text-xs text-slate-300">
                    6 contiguous squares · Continuous quarter-circle arc
                  </span>
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
