'use client';

import * as React from 'react';
import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from 'motion/react';
import { clsx } from 'clsx';

export interface SpotlightProps {
  className?: string;
  fill?: string;
}

/**
 * Ambient radial spotlight cone wired to OpenDesign tokens.
 */
export function Spotlight({ className, fill }: SpotlightProps) {
  const gradientId = React.useId();

  return (
    <svg
      aria-hidden="true"
      className={clsx(
        'animate-aceternity-spotlight pointer-events-none absolute z-[1] h-[150%] w-[138%] opacity-0 lg:w-[84%]',
        className,
      )}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <defs>
        <filter
          id={`${gradientId}-blur`}
          x="0.860352"
          y="0.838989"
          width="3785.16"
          height="2840.26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur" />
        </filter>
      </defs>
      <g filter={`url(#${gradientId}-blur)`}>
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill={fill ?? 'var(--color-primary)'}
          fillOpacity="0.22"
        />
      </g>
    </svg>
  );
}

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  radius?: number;
  spotlightColor?: string;
}

/**
 * Interactive cursor-tracking spotlight card with reduced-motion fallback.
 */
export function SpotlightCard({
  children,
  className,
  style,
  radius = 320,
  spotlightColor = 'var(--color-primary-surface)',
  onMouseMove,
  ...rest
}: SpotlightCardProps) {
  const reducedMotion = Boolean(useReducedMotion());
  const mouseX = useMotionValue(-radius);
  const mouseY = useMotionValue(-radius);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    onMouseMove?.(e);
    if (reducedMotion) return;
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const background = useMotionTemplate`radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, ${spotlightColor}, transparent 75%)`;

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        color: 'var(--color-text)',
        ...style,
      }}
      className={clsx('group relative overflow-hidden border p-6', className)}
      {...rest}
    >
      {!reducedMotion ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background }}
        />
      ) : (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-40"
          style={{
            background: `linear-gradient(180deg, ${spotlightColor} 0%, transparent 100%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
