import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS v4 classes with deterministic conflict resolution.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export type Density = 'compact' | 'comfortable' | 'spacious';

export const DENSITY_PADDING: Record<Density, string> = {
  compact: 'p-3',
  comfortable: 'p-4 sm:p-5',
  spacious: 'p-5 sm:p-6',
};

export const DENSITY_GAP: Record<Density, string> = {
  compact: 'gap-2.5',
  comfortable: 'gap-4',
  spacious: 'gap-6',
};

export const DENSITY_CELL: Record<Density, string> = {
  compact: 'px-3 py-2 text-xs',
  comfortable: 'px-4 py-3 text-sm',
  spacious: 'px-5 py-4 text-sm',
};

/**
 * Crisp WCAG 2.1 AA focus-visible ring bridged to OpenDesign primary token.
 */
export const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]';

/**
 * Interactive control focus ring for inputs and triggers.
 */
export const CONTROL_RING =
  'focus-visible:outline-none focus-visible:border-[var(--color-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20';
