import React, { useEffect, useRef } from 'react';

export const LabBackgroundCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let targetMouseX = window.innerWidth / 2;
    let targetMouseY = window.innerHeight / 2;
    let smoothMouseX = targetMouseX;
    let smoothMouseY = targetMouseY;

    // Track scroll position & velocity for smooth 60fps depth parallax without React re-renders
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY;
      lastScrollY = currentY;
      // Clamp velocity for silky motion
      scrollVelocity = Math.max(-18, Math.min(18, delta * 0.18));
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const numPoints = 58;
    const points: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      depth: number;
      size: number;
      baseAlpha: number;
      isGolden: boolean;
    }> = [];

    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.26,
        vy: (Math.random() - 0.5) * 0.26,
        depth: Math.random() * 0.75 + 0.25,
        size: Math.random() * 1.5 + 0.8,
        baseAlpha: Math.random() * 0.35 + 0.15,
        isGolden: Math.random() > 0.62,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      smoothMouseX += (targetMouseX - smoothMouseX) * 0.08;
      smoothMouseY += (targetMouseY - smoothMouseY) * 0.08;
      // Smoothly decay scroll velocity back to 0
      scrollVelocity *= 0.91;

      for (let idx = 0; idx < points.length; idx++) {
        const p = points[idx];
        p.x += p.vx;
        p.y += p.vy - scrollVelocity * p.depth;

        if (p.x < 0) p.x = canvas.width;
        else if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = (p.y % canvas.height) + canvas.height;
        else if (p.y > canvas.height) p.y = p.y % canvas.height;

        const dx = smoothMouseX - p.x;
        const dy = smoothMouseY - p.y;
        const distSq = dx * dx + dy * dy;
        const mouseFactor = distSq < 90000 ? Math.max(0, 1 - Math.sqrt(distSq) / 300) : 0;

        const speedBoost = Math.min(0.25, Math.abs(scrollVelocity) * 0.015);
        const currentAlpha = Math.min(1, p.baseAlpha + mouseFactor * 0.45 + speedBoost);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + mouseFactor * 1.1, 0, Math.PI * 2);
        ctx.fillStyle = p.isGolden
          ? `rgba(245, 158, 11, ${currentAlpha})`
          : `rgba(6, 182, 212, ${currentAlpha * 0.9})`;
        ctx.fill();

        for (let j = idx + 1; j < points.length; j++) {
          const p2 = points[j];
          const dxx = p.x - p2.x;
          const dyy = p.y - p2.y;
          const dSq = dxx * dxx + dyy * dyy;
          if (dSq < 14400) {
            const d = Math.sqrt(dSq);
            const lineAlpha = (1 - d / 120) * (0.11 + speedBoost * 0.15);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p.isGolden
              ? `rgba(245, 158, 11, ${lineAlpha})`
              : `rgba(6, 182, 212, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-65"
    />
  );
};
