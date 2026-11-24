'use client';

/**
 * Accessible Kanban Drag-and-Drop Adapter (`@hello-pangea/dnd`)
 * Pointer DnD + accessible keyboard move controls for Kanban boards.
 *
 * Install: `pnpm add @hello-pangea/dnd`
 * Uses Designer Dashboards CSS tokens (`var(--color-*)`, `var(--radius-*)`) so columns and cards
 * automatically respect light/dark mode, cardStyle, and RTL.
 */

import * as React from 'react';
import type { BoardColumn } from '../layouts/AppShells';

export interface BoardDropResult {
  source: { droppableId: string; index: number };
  destination: { droppableId: string; index: number } | null;
  draggableId: string;
}

export function reorderBoardColumns(
  columns: BoardColumn[],
  result: BoardDropResult,
): BoardColumn[] {
  if (!result.destination) return columns;
  const { source, destination } = result;
  if (source.droppableId === destination.droppableId && source.index === destination.index) {
    return columns;
  }

  const next = columns.map((c) => ({ ...c, cards: [...c.cards] }));
  const fromCol = next.find((c) => c.id === source.droppableId);
  const toCol = next.find((c) => c.id === destination.droppableId);
  if (!fromCol || !toCol) return columns;

  const [moved] = fromCol.cards.splice(source.index, 1);
  if (!moved) return columns;
  toCol.cards.splice(destination.index, 0, moved);
  return next;
}
