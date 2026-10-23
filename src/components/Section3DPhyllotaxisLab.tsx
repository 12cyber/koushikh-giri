import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Compass, Sliders, Sparkles } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { harmonicAudio } from '../utils/harmonicAudio';

type GeometryMode = 'dome' | 'pinecone' | 'torus';
type ParastichyPair = 'none' | '8-13' | '13-21' | '21-34';

const GOLDEN_ANGLE_EXACT = 137.507764;

interface Point3D {
  idx: number;
  x: number;
  y: number;
  z: number;
  px: number;
  py: number;
  pz: number;
  scale: number;
}

export const Section3DPhyllotaxisLab: React.FC = () => {
  const [geometryMode, setGeometryMode] = useState<GeometryMode>('dome');
  const [seedCount, setSeedCount] = useState<number>(233);
  const [divergenceAngle, setDivergenceAngle] = useState<number>(GOLDEN_ANGLE_EXACT);
  const [parastichyPair, setParastichyPair] = useState<ParastichyPair>('13-21');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef({
    yaw: 0.45,
    pitch: 0.58,
    isDragging: false,
    lastX: 0,
    lastY: 0,
  });

  const isAtGoldenAngle = Math.abs(divergenceAngle - GOLDEN_ANGLE_EXACT) < 0.08;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isVisible = true;
    let cachedWidth = canvas.parentElement?.clientWidth || 680;
    const height = 460;

    const updateDimensions = () => {
      cachedWidth = canvas.parentElement?.clientWidth || 680;
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== cachedWidth * dpr || canvas.height !== height * dpr) {
        canvas.width = cachedWidth * dpr;
        canvas.height = height * dpr;
      }
    };
    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.01 }
    );
    intersectionObserver.observe(canvas);

    const computePoint3D = (i: number, total: number, angleDeg: number, mode: GeometryMode) => {
      const theta = i * angleDeg * (Math.PI / 180);
      const norm = i / Math.max(1, total - 1);

      if (mode === 'dome') {
        // 3D Paraboloid Sunflower Meristem Dome
        const r = Math.sqrt(norm) * 165;
        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;
        const y = -72 + norm * 145; // apex at top (-72), curving down to +73
        return { x, y, z };
      } else if (mode === 'pinecone') {
        // 3D Conical Pinecone Bract Lattice
        const profileRadius = 28 + Math.sin(norm * Math.PI * 0.88) * 105;
        const x = Math.cos(theta) * profileRadius;
        const z = Math.sin(theta) * profileRadius;
        const y = -135 + norm * 270;
        return { x, y, z };
      } else {
        // 3D Golden Ratio Torus Manifold
        const majorR = 115;
        const minorR = 48;
        const phiAngle = i * 0.381966; // Golden ratio conjugate radians
        const tubeR = majorR + Math.cos(phiAngle) * minorR;
        const x = Math.cos(theta) * tubeR;
        const z = Math.sin(theta) * tubeR;
        const y = Math.sin(phiAngle) * minorR;
        return { x, y, z };
      }
    };

    const render = () => {
      if (!isVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      const width = cachedWidth;
      const dpr = window.devicePixelRatio || 1;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      if (autoRotate && !rotationRef.current.isDragging) {
        rotationRef.current.yaw += 0.0045;
      }

      const { yaw, pitch } = rotationRef.current;
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);

      const fov = 520;
      const cx = width / 2;
      const cy = height / 2;

      const project = (x: number, y: number, z: number) => {
        // Rotate around Y axis (yaw)
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;
        // Rotate around X axis (pitch)
        const y2 = y * cosP - z1 * sinP;
        const z2 = z1 * cosP + y * sinP;

        const scale = fov / Math.max(120, fov + z2 + 60);
        return {
          px: cx + x1 * scale,
          py: cy + y2 * scale,
          pz: z2,
          scale,
        };
      };

      // Draw subtle 3D equatorial reference ring
      ctx.beginPath();
      for (let a = 0; a <= 64; a++) {
        const ang = (a / 64) * Math.PI * 2;
        const rx = Math.cos(ang) * 175;
        const rz = Math.sin(ang) * 175;
        const p = project(rx, 45, rz);
        if (a === 0) ctx.moveTo(p.px, p.py);
        else ctx.lineTo(p.px, p.py);
      }
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Compute all 3D points
      const points: Point3D[] = [];
      for (let i = 0; i < seedCount; i++) {
        const { x, y, z } = computePoint3D(i, seedCount, divergenceAngle, geometryMode);
        const proj = project(x, y, z);
        points.push({
          idx: i,
          x,
          y,
          z,
          ...proj,
        });
      }

      // Draw 3D Parastichy Spiral Family Curves if enabled
      if (parastichyPair !== 'none') {
        const [cwStep, ccwStep] =
          parastichyPair === '8-13'
            ? [8, 13]
            : parastichyPair === '13-21'
            ? [13, 21]
            : [21, 34];

        // Clockwise Fibonacci spiral family (Gold)
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.42)';
        ctx.lineWidth = 1.6;
        for (let arm = 0; arm < cwStep; arm++) {
          ctx.beginPath();
          let started = false;
          for (let idx = arm; idx < seedCount; idx += cwStep) {
            const pt = points[idx];
            if (!started) {
              ctx.moveTo(pt.px, pt.py);
              started = true;
            } else {
              ctx.lineTo(pt.px, pt.py);
            }
          }
          ctx.stroke();
        }

        // Counterclockwise Fibonacci spiral family (Cyan)
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.36)';
        ctx.lineWidth = 1.3;
        for (let arm = 0; arm < ccwStep; arm++) {
          ctx.beginPath();
          let started = false;
          for (let idx = arm; idx < seedCount; idx += ccwStep) {
            const pt = points[idx];
            if (!started) {
              ctx.moveTo(pt.px, pt.py);
              started = true;
            } else {
              ctx.lineTo(pt.px, pt.py);
            }
          }
          ctx.stroke();
        }
      }

      // Depth-sort back to front for true 3D occlusion
      const sorted = [...points].sort((a, b) => b.pz - a.pz);

      for (let i = 0; i < sorted.length; i++) {
        const pt = sorted[i];
        const isGoldenHighlight = pt.idx % 13 === 0 || pt.idx % 21 === 0;
        const depthAlpha = Math.max(0.22, Math.min(1, 1 - (pt.pz + 160) / 380));
        const radius = Math.max(1.8, (isGoldenHighlight ? 4.4 : 3.1) * pt.scale);

        ctx.beginPath();
        ctx.arc(pt.px, pt.py, radius, 0, Math.PI * 2);
        if (isGoldenHighlight) {
          ctx.fillStyle = `rgba(251, 191, 36, ${depthAlpha})`;
        } else {
          ctx.fillStyle = `rgba(34, 211, 238, ${depthAlpha * 0.85})`;
        }
        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [geometryMode, seedCount, divergenceAngle, parastichyPair, autoRotate]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    rotationRef.current.isDragging = true;
    rotationRef.current.lastX = e.clientX;
    rotationRef.current.lastY = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!rotationRef.current.isDragging) return;
    const dx = e.clientX - rotationRef.current.lastX;
    const dy = e.clientY - rotationRef.current.lastY;
    rotationRef.current.lastX = e.clientX;
    rotationRef.current.lastY = e.clientY;

    rotationRef.current.yaw += dx * 0.007;
    rotationRef.current.pitch = Math.max(
      -1.2,
      Math.min(1.3, rotationRef.current.pitch + dy * 0.007)
    );
  };

  const handlePointerUp = () => {
    rotationRef.current.isDragging = false;
  };

  const handleResetView = () => {
    rotationRef.current.yaw = 0.45;
    rotationRef.current.pitch = 0.58;
    setDivergenceAngle(GOLDEN_ANGLE_EXACT);
    setSeedCount(233);
    harmonicAudio.playChime('step', 4);
  };

  return (
    <section
      id="section-3d-lab"
      className="lab-snap-section relative min-h-screen flex flex-col items-center justify-center py-24 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#02050b] lab-grid-dense select-none overflow-hidden"
    >
      <div className="max-w-6xl mx-auto w-full flex flex-col items-center">
        {/* Clean Editorial Header */}
        <ScrollReveal direction="up" className="w-full text-center mb-8">
          <div className="flex items-center justify-center gap-2 font-mono text-xs tracking-widest text-cyan-400 uppercase mb-3">
            <span>05</span>
            <span aria-hidden="true">·</span>
            <span>3D Spatial Phyllotaxis Lab</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-['Arial',sans-serif] font-semibold text-white tracking-wide uppercase mb-3 text-balance">
            3D GOLDEN ANGLE &amp; BOTANICAL GEOMETRY
          </h2>

          <p className="text-sm sm:text-base text-slate-400 font-mono max-w-2xl mx-auto">
            Drag to orbit in 3D space. Scrub the divergence angle away from 137.5077° to witness why nature locks onto the Golden Ratio.
          </p>
        </ScrollReveal>

        {/* Two-Zone Interactive Sandbox Layout (8 cols 3D stage + 4 cols control deck) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">
          {/* Left 8 Cols: Interactive 3D Viewport */}
          <ScrollReveal direction="right" delay={0.06} className="lg:col-span-8 flex">
            <div className="w-full rounded-2xl bg-[#040811] border border-cyan-500/25 p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-slate-400 px-2 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>3D Perspective Projection · Drag to Orbit</span>
                </div>
                <div className="flex items-center gap-3 tabular-nums">
                  <span>
                    Angle:{' '}
                    <strong className={isAtGoldenAngle ? 'text-amber-300' : 'text-cyan-300'}>
                      {divergenceAngle.toFixed(4)}°
                    </strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Seeds: {seedCount}</span>
                </div>
              </div>

              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="w-full h-[440px] cursor-grab active:cursor-grabbing block touch-none"
              />

              {/* Bottom 3D Legend & Status Readout */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 font-mono text-xs text-slate-400 px-2">
                <div className="flex items-center gap-4">
                  <span className="text-amber-300">
                    ● Clockwise Fibonacci Family (Fₖ)
                  </span>
                  <span className="text-cyan-300">
                    ● Counterclockwise Family (Fₖ₊₁)
                  </span>
                </div>
                <div>
                  {isAtGoldenAngle ? (
                    <span className="text-emerald-400 font-semibold">
                      Optimal 137.5077° Golden Packing Active
                    </span>
                  ) : (
                    <span className="text-amber-300">
                      Non-Golden Angle: Radial Spokes &amp; Gaps Forming
                    </span>
                  )}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Right 4 Cols: Parameter & Geometry Control Deck */}
          <ScrollReveal direction="left" delay={0.12} className="lg:col-span-4 flex">
            <div className="w-full rounded-2xl bg-[#050a14] border border-white/10 p-6 flex flex-col justify-between gap-6">
              <div className="space-y-6">
                {/* 1. 3D Manifold Selector */}
                <div>
                  <div className="font-mono text-xs text-cyan-400 uppercase tracking-widest mb-2.5">
                    1. 3D Botanical Manifold
                  </div>
                  <div className="grid grid-cols-1 gap-2 font-mono text-xs">
                    {[
                      { id: 'dome', label: 'Sunflower Meristem Dome (3D)' },
                      { id: 'pinecone', label: 'Pinecone Bract Helix (3D)' },
                      { id: 'torus', label: 'Golden Ratio Spiral Torus (3D)' },
                    ].map((item) => {
                      const active = geometryMode === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setGeometryMode(item.id as GeometryMode);
                            harmonicAudio.playChime('step', 3);
                          }}
                          className={`px-3.5 py-2.5 rounded-xl border text-left transition-colors cursor-pointer whitespace-nowrap ${
                            active
                              ? 'bg-cyan-400 text-slate-950 font-bold border-cyan-300'
                              : 'bg-slate-900/90 text-slate-300 hover:text-white border-white/10'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Divergence Angle Control */}
                <div>
                  <div className="flex items-center justify-between font-mono text-xs mb-1.5">
                    <label htmlFor="angle-3d-slider" className="text-slate-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      <span>Divergence Angle (θ)</span>
                    </label>
                    <span className="text-amber-300 font-bold tabular-nums">
                      {divergenceAngle.toFixed(2)}°
                    </span>
                  </div>

                  <input
                    id="angle-3d-slider"
                    type="range"
                    min="134.5"
                    max="140.5"
                    step="0.02"
                    value={divergenceAngle}
                    onChange={(e) => setDivergenceAngle(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 h-2 bg-slate-900 rounded-lg cursor-pointer"
                  />

                  <div className="flex items-center justify-between mt-2">
                    <span className="font-mono text-[10px] text-slate-500 tabular-nums">
                      134.5° (Spokes)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setDivergenceAngle(GOLDEN_ANGLE_EXACT);
                        harmonicAudio.playChime('discover');
                      }}
                      className="px-2.5 py-1 rounded bg-[#ff69b4] hover:bg-pink-300 text-slate-950 border border-pink-300 font-mono text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1 shadow-[0_0_15px_rgba(255,105,180,0.4)]"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Lock 137.5077° (φ)</span>
                    </button>
                    <span className="font-mono text-[10px] text-slate-500 tabular-nums">
                      140.5°
                    </span>
                  </div>
                </div>

                {/* 3. Seed Primordia Count (Fibonacci steps) */}
                <div>
                  <div className="flex items-center justify-between font-mono text-xs mb-2">
                    <span className="text-slate-300">Primordia Node Count (N)</span>
                    <span className="text-cyan-300 font-bold tabular-nums">{seedCount}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 font-mono text-xs">
                    {[89, 144, 233, 377].map((countVal, idx) => (
                      <button
                        key={countVal}
                        type="button"
                        onClick={() => {
                          setSeedCount(countVal);
                          harmonicAudio.playChime('step', idx + 2);
                        }}
                        className={`py-2 rounded-lg border tabular-nums transition-colors cursor-pointer ${
                          seedCount === countVal
                            ? 'bg-[#ff69b4] text-slate-950 font-bold border-pink-300 shadow-[0_0_15px_rgba(255,105,180,0.4)]'
                            : 'bg-slate-900 text-slate-300 hover:text-white border-white/10'
                        }`}
                      >
                        {countVal}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Parastichy Spiral Highlighter */}
                <div>
                  <div className="font-mono text-xs text-slate-300 mb-2">
                    Highlight Fibonacci Spiral Pairs
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
                    {[
                      { id: '8-13', label: '8 & 13 Spirals' },
                      { id: '13-21', label: '13 & 21 Spirals' },
                      { id: '21-34', label: '21 & 34 Spirals' },
                      { id: 'none', label: 'Nodes Only' },
                    ].map((pair) => (
                      <button
                        key={pair.id}
                        type="button"
                        onClick={() => {
                          setParastichyPair(pair.id as ParastichyPair);
                          harmonicAudio.playChime('step', 6);
                        }}
                        className={`px-2.5 py-2 rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                          parastichyPair === pair.id
                            ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 font-semibold'
                            : 'bg-slate-900 text-slate-400 hover:text-white border-white/10'
                        }`}
                      >
                        {pair.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Orbit Playback & Reset */}
              <div className="pt-4 border-t border-white/10 flex items-center gap-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setAutoRotate((prev) => !prev)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 font-semibold uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{autoRotate ? 'Pause Orbit' : 'Auto-Orbit'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetView}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 cursor-pointer transition-colors"
                  title="Reset 3D camera and angle"
                  aria-label="Reset 3D camera and angle"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
