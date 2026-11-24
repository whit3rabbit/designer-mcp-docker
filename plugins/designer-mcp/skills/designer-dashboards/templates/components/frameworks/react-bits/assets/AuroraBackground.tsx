'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { useMotionPreferences } from '../theme/motionConfig';

export interface AuroraBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Animation speed multiplier (ignored when prefers-reduced-motion is active). */
  speed?: number;
  /** Opacity of the aurora shader mesh (0 to 1). */
  intensity?: number;
  /** Render via HTML5 Canvas shader loop or pure CSS radial layers. */
  mode?: 'canvas' | 'css';
}

interface BlobNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  token: string;
}

function readCssVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return val || fallback;
}

/**
 * Token-driven Aurora background supporting both Canvas 2D shader-style rendering
 * and pure-CSS layered gradients. Automatically pauses animation when
 * `prefers-reduced-motion: reduce` is active.
 */
export function AuroraBackground({
  speed = 1,
  intensity = 0.28,
  mode = 'canvas',
  className,
  style,
  children,
  ...rest
}: AuroraBackgroundProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const { prefersReducedMotion } = useMotionPreferences();

  React.useEffect(() => {
    if (mode !== 'canvas' || prefersReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    const blobs: BlobNode[] = [
      { x: 0.22, y: 0.28, vx: 0.00045 * speed, vy: 0.0003 * speed, radius: 0.42, token: '--color-primary' },
      { x: 0.78, y: 0.32, vx: -0.00035 * speed, vy: 0.0004 * speed, radius: 0.38, token: '--chart-2' },
      { x: 0.5, y: 0.72, vx: 0.0003 * speed, vy: -0.00035 * speed, radius: 0.44, token: '--chart-3' },
    ];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = intensity;

      for (const blob of blobs) {
        blob.x += blob.vx;
        blob.y += blob.vy;
        if (blob.x < 0.1 || blob.x > 0.9) blob.vx *= -1;
        if (blob.y < 0.1 || blob.y > 0.9) blob.vy *= -1;

        const cx = blob.x * width;
        const cy = blob.y * height;
        const r = Math.max(width, height) * blob.radius;
        const color = readCssVar(blob.token, 'oklch(0.62 0.2 260)');

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [intensity, mode, prefersReducedMotion, speed]);

  return (
    <div
      className={clsx('relative isolate overflow-hidden', className)}
      style={{
        backgroundColor: 'var(--color-canvas)',
        color: 'var(--color-text)',
        ...style,
      }}
      {...rest}
    >
      {/* Static / CSS fallback gradient layer */}
      <div
        aria-hidden="true"
        className={clsx(
          'pointer-events-none absolute inset-0 -z-20',
          !prefersReducedMotion && mode === 'css' && 'rb-aurora-layer',
        )}
        style={{
          opacity: mode === 'canvas' && !prefersReducedMotion ? 0.35 : intensity + 0.15,
          backgroundImage: [
            'radial-gradient(60% 50% at 20% 20%, color-mix(in oklch, var(--color-primary) 28%, transparent), transparent 70%)',
            'radial-gradient(50% 45% at 80% 25%, color-mix(in oklch, var(--chart-2) 24%, transparent), transparent 70%)',
            'radial-gradient(55% 50% at 50% 85%, color-mix(in oklch, var(--chart-3) 20%, transparent), transparent 72%)',
          ].join(', '),
        }}
      />

      {mode === 'canvas' && !prefersReducedMotion && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full blur-2xl"
        />
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}
