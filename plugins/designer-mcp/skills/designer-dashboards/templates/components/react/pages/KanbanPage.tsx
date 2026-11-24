'use client';

import * as React from 'react';
import { BoardShell, type BoardColumn } from '../../@layouts/AppShells';
import { Button } from '../../components/ui/Button';

const INITIAL_COLUMNS: BoardColumn[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    cards: [
      { id: 't1', title: 'Audit RTL logical properties', meta: 'A11y · High' },
      { id: 't2', title: 'Wire Supabase auth adapter', meta: 'Security' },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    cards: [{ id: 't3', title: 'Build Vue 3 AppShell parity', meta: 'UI · Due Fri' }],
  },
  {
    id: 'done',
    title: 'Done',
    cards: [{ id: 't4', title: 'Verify 21 WCAG AA presets', meta: 'Design Tokens' }],
  },
];

export function KanbanPage() {
  const [columns, setColumns] = React.useState<BoardColumn[]>(INITIAL_COLUMNS);

  const handleMove = (cardId: string, fromId: string, toId: string) => {
    setColumns((prev) => {
      const card = prev.find((c) => c.id === fromId)?.cards.find((x) => x.id === cardId);
      if (!card) return prev;
      return prev.map((col) => {
        if (col.id === fromId) return { ...col, cards: col.cards.filter((x) => x.id !== cardId) };
        if (col.id === toId) return { ...col, cards: [...col.cards, card] };
        return col;
      });
    });
  };

  const addQuickTask = () => {
    setColumns((prev) =>
      prev.map((col, idx) =>
        idx === 0
          ? {
              ...col,
              cards: [
                ...col.cards,
                { id: `t-${Date.now()}`, title: 'New Sprint Task', meta: 'Triage' },
              ],
            }
          : col,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Sprint Board</h1>
          <p style={{ color: 'var(--color-text-muted)' }} className="text-xs">
            Drag cards or use keyboard move controls between columns.
          </p>
        </div>
        <Button variant="solid" tone="primary" size="sm" onClick={addQuickTask}>
          Add Task
        </Button>
      </div>
      <BoardShell columns={columns} onMoveCard={handleMove} />
    </div>
  );
}
