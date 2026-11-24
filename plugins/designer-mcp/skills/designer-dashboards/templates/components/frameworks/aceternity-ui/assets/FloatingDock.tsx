'use client';

import * as React from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { clsx } from 'clsx';

export interface FloatingDockItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onSelect?: () => void;
  href?: string;
}

export interface FloatingDockProps {
  items: FloatingDockItem[];
  ariaLabel?: string;
  className?: string;
}

function DockIcon({
  item,
  mouseX,
  reducedMotion,
}: {
  item: FloatingDockItem;
  mouseX: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = React.useState(false);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const sizeTransform = useTransform(distance, [-140, 0, 140], [40, 62, 40]);
  const size = useSpring(sizeTransform, { mass: 0.15, stiffness: 180, damping: 14 });

  const content = (
    <motion.div
      ref={ref}
      style={{
        width: reducedMotion ? 42 : size,
        height: reducedMotion ? 42 : size,
        backgroundColor: item.active ? 'var(--color-primary-surface)' : 'var(--color-surface)',
        borderColor: item.active ? 'var(--color-primary-border)' : 'var(--color-border)',
        color: item.active ? 'var(--color-primary)' : 'var(--color-text)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex items-center justify-center rounded-full border transition-colors"
    >
      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-sm)',
            }}
            className="pointer-events-none absolute -top-9 whitespace-nowrap border px-2 py-0.5 text-xs font-medium"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
      <span className="flex items-center justify-center">{item.icon}</span>
    </motion.div>
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        aria-label={item.label}
        aria-current={item.active ? 'page' : undefined}
        onClick={(e) => {
          if (item.onSelect) {
            e.preventDefault();
            item.onSelect();
          }
        }}
        className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      aria-label={item.label}
      aria-current={item.active ? 'page' : undefined}
      onClick={item.onSelect}
      className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {content}
    </button>
  );
}

/**
 * Interactive magnifying dock wired to OpenDesign tokens and reduced-motion preferences.
 */
export function FloatingDock({
  items,
  ariaLabel = 'Quick actions dock',
  className,
}: FloatingDockProps) {
  const mouseX = useMotionValue(Infinity);
  const reducedMotion = Boolean(useReducedMotion());

  return (
    <nav
      aria-label={ariaLabel}
      onMouseMove={(e) => {
        if (!reducedMotion) mouseX.set(e.pageX);
      }}
      onMouseLeave={() => mouseX.set(Infinity)}
      style={{
        backgroundColor: 'var(--color-surface-elevated)',
        borderColor: 'var(--color-border)',
        boxShadow: 'var(--shadow-lg)',
      }}
      className={clsx(
        'inline-flex h-16 items-end gap-3 rounded-2xl border px-4 pb-3 backdrop-blur-md',
        className,
      )}
    >
      {items.map((item) => (
        <DockIcon
          key={item.id}
          item={item}
          mouseX={mouseX}
          reducedMotion={reducedMotion}
        />
      ))}
    </nav>
  );
}
