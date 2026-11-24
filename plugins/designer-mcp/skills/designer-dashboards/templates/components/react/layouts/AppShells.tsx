'use client';

import * as React from 'react';
import { Button } from '../components/ui/Button';

/** 1. List–Detail Shell (Mail, File Manager, Orders, Invoices — 2/3/4-pane) */
export interface ListDetailShellProps {
  sidebar?: React.ReactNode;
  list: React.ReactNode;
  detail: React.ReactNode;
  inspector?: React.ReactNode;
  fixedHeight?: boolean;
}

export function ListDetailShell({ sidebar, list, detail, inspector, fixedHeight = false }: ListDetailShellProps) {
  const listCols = sidebar && inspector ? 'lg:col-span-3' : sidebar ? 'lg:col-span-4' : inspector ? 'lg:col-span-4' : 'lg:col-span-5';
  const detailCols = sidebar && inspector ? 'lg:col-span-5' : sidebar ? 'lg:col-span-6' : inspector ? 'lg:col-span-5' : 'lg:col-span-7';
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-lg)',
      }}
      className={`rd-card grid min-h-[560px] grid-cols-1 overflow-hidden border lg:grid-cols-12 ${fixedHeight ? 'rd-content-fixed' : ''}`}
    >
      {sidebar && (
        <aside
          style={{ borderColor: 'var(--color-border)' }}
          className="overflow-y-auto border-b p-4 lg:col-span-2 lg:border-b-0 lg:border-e"
        >
          {sidebar}
        </aside>
      )}
      <section
        aria-label="Items list"
        style={{ borderColor: 'var(--color-border)' }}
        className={`overflow-y-auto border-b lg:border-b-0 lg:border-e ${listCols}`}
      >
        {list}
      </section>
      <section
        aria-label="Selected item detail"
        className={`overflow-y-auto p-6 ${inspector ? 'border-b lg:border-b-0 lg:border-e' : ''} ${detailCols}`}
        style={inspector ? { borderColor: 'var(--color-border)' } : undefined}
      >
        {detail}
      </section>
      {inspector && (
        <aside
          aria-label="Inspector panel"
          className="overflow-y-auto p-4 lg:col-span-3"
        >
          {inspector}
        </aside>
      )}
    </div>
  );
}

/** 2. Board Shell (Kanban / Pipeline with WCAG AA keyboard move controls) */
export interface BoardCard {
  id: string;
  title: string;
  meta?: string;
}

export interface BoardColumn {
  id: string;
  title: string;
  cards: BoardCard[];
}

export interface BoardShellProps {
  columns: BoardColumn[];
  onMoveCard: (cardId: string, fromColId: string, toColId: string) => void;
}

export function BoardShell({ columns, onMoveCard }: BoardShellProps) {
  const [dragged, setDragged] = React.useState<{ cardId: string; fromColId: string } | null>(null);

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {columns.map((col, colIdx) => (
        <section
          key={col.id}
          aria-label={col.title}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (dragged && dragged.fromColId !== col.id) {
              onMoveCard(dragged.cardId, dragged.fromColId, col.id);
            }
            setDragged(null);
          }}
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            borderRadius: 'var(--radius-lg)',
          }}
          className="rd-card flex min-w-72 flex-1 flex-col border p-4"
        >
          <header className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">{col.title}</h2>
            <span
              style={{
                backgroundColor: 'var(--color-canvas)',
                color: 'var(--color-text-muted)',
                borderRadius: 'var(--radius-full)',
              }}
              className="tabular-nums px-2 py-0.5 text-xs font-semibold"
            >
              {col.cards.length}
            </span>
          </header>

          <ul className="space-y-2.5">
            {col.cards.map((card) => (
              <li
                key={card.id}
                draggable
                onDragStart={() => setDragged({ cardId: card.id, fromColId: col.id })}
                onDragEnd={() => setDragged(null)}
                style={{
                  backgroundColor: 'var(--color-canvas)',
                  borderColor: 'var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                }}
                className="cursor-grab space-y-2 border p-3 active:cursor-grabbing"
              >
                <p className="text-sm font-medium">{card.title}</p>
                {card.meta && (
                  <p style={{ color: 'var(--color-text-muted)' }} className="text-xs">
                    {card.meta}
                  </p>
                )}
                <div className="flex items-center justify-end gap-1.5">
                  {colIdx > 0 && (
                    <Button
                      size="xs"
                      variant="ghost"
                      tone="neutral"
                      aria-label={`Move ${card.title} to ${columns[colIdx - 1].title}`}
                      onClick={() => onMoveCard(card.id, col.id, columns[colIdx - 1].id)}
                    >
                      Prev
                    </Button>
                  )}
                  {colIdx < columns.length - 1 && (
                    <Button
                      size="xs"
                      variant="tonal"
                      tone="primary"
                      aria-label={`Move ${card.title} to ${columns[colIdx + 1].title}`}
                      onClick={() => onMoveCard(card.id, col.id, columns[colIdx + 1].id)}
                    >
                      Next
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** 3. Threaded Stream Shell (Chat, AI Chat, Activity Stream) */
export interface ThreadedStreamShellProps {
  threadsSidebar?: React.ReactNode;
  stream: React.ReactNode;
  composer: React.ReactNode;
  inspector?: React.ReactNode;
  fixedHeight?: boolean;
}

export function ThreadedStreamShell({
  threadsSidebar,
  stream,
  composer,
  inspector,
  fixedHeight = false,
}: ThreadedStreamShellProps) {
  const mainCols = threadsSidebar && inspector ? 'lg:col-span-6' : threadsSidebar || inspector ? 'lg:col-span-9' : 'lg:col-span-12';
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-lg)',
      }}
      className={`rd-card grid min-h-[560px] grid-cols-1 overflow-hidden border lg:grid-cols-12 ${fixedHeight ? 'rd-content-fixed' : ''}`}
    >
      {threadsSidebar && (
        <aside
          style={{ borderColor: 'var(--color-border)' }}
          className="overflow-y-auto border-b p-4 lg:col-span-3 lg:border-b-0 lg:border-e"
        >
          {threadsSidebar}
        </aside>
      )}
      <div
        className={`flex min-h-0 flex-col ${inspector ? 'border-b lg:border-b-0 lg:border-e' : ''} ${mainCols}`}
        style={inspector ? { borderColor: 'var(--color-border)' } : undefined}
      >
        <div aria-live="polite" className="flex-1 overflow-y-auto p-5">
          {stream}
        </div>
        <div
          style={{ borderColor: 'var(--color-border)' }}
          className="border-t p-4"
        >
          {composer}
        </div>
      </div>
      {inspector && (
        <aside
          aria-label="Conversation details"
          className="overflow-y-auto p-4 lg:col-span-3"
        >
          {inspector}
        </aside>
      )}
    </div>
  );
}

/** 4. Full-Canvas Shell (Calendar, Tabbed Settings, Profile) */
export interface FullCanvasShellProps {
  toolbar: React.ReactNode;
  children: React.ReactNode;
}

export function FullCanvasShell({ toolbar, children }: FullCanvasShellProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-lg)',
      }}
      className="rd-card flex flex-col overflow-hidden border"
    >
      <div
        style={{ borderColor: 'var(--color-border)' }}
        className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4"
      >
        {toolbar}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

/** 5. POS Split Shell (Catalog grid + sticky ticket cart) */
export interface PosSplitShellProps {
  catalog: React.ReactNode;
  ticket: React.ReactNode;
}

export function PosSplitShell({ catalog, ticket }: PosSplitShellProps) {
  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      <section aria-label="Catalog" className="lg:col-span-8 xl:col-span-9">
        {catalog}
      </section>
      <aside
        aria-label="Order ticket"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          borderRadius: 'var(--radius-lg)',
        }}
        className="rd-card sticky top-20 border p-5 lg:col-span-4 xl:col-span-3"
      >
        {ticket}
      </aside>
    </div>
  );
}

/** 6. Map Split Shell (50/50 or 5+7 list & interactive map with fullscreen toggle) */
export interface MapSplitShellProps {
  list: React.ReactNode;
  map: React.ReactNode;
  fixedHeight?: boolean;
}

export function MapSplitShell({ list, map, fixedHeight = true }: MapSplitShellProps) {
  const [mapExpanded, setMapExpanded] = React.useState(false);
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-lg)',
      }}
      className={`rd-card grid min-h-[560px] grid-cols-1 overflow-hidden border lg:grid-cols-12 ${fixedHeight ? 'rd-content-fixed' : ''}`}
    >
      {!mapExpanded && (
        <section
          aria-label="Locations list"
          style={{ borderColor: 'var(--color-border)' }}
          className="overflow-y-auto border-b p-4 lg:col-span-5 lg:border-b-0 lg:border-e"
        >
          {list}
        </section>
      )}
      <section
        aria-label="Interactive map"
        className={`relative min-h-[360px] ${mapExpanded ? 'lg:col-span-12' : 'lg:col-span-7'}`}
      >
        <div className="no-print absolute end-3 top-3 z-10">
          <Button
            size="xs"
            variant="outline"
            tone="neutral"
            onClick={() => setMapExpanded((v) => !v)}
          >
            {mapExpanded ? 'Show List' : 'Expand Map'}
          </Button>
        </div>
        {map}
      </section>
    </div>
  );
}

/** 7. Docs + ScrollSpy TOC Shell (3-column nav + prose + sticky right TOC) */
export interface DocsTocShellProps {
  nav: React.ReactNode;
  content: React.ReactNode;
  toc: React.ReactNode;
}

export function DocsTocShell({ nav, content, toc }: DocsTocShellProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <aside
        aria-label="Documentation navigation"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          borderRadius: 'var(--radius-lg)',
        }}
        className="rd-card h-fit border p-4 lg:sticky lg:top-20 lg:col-span-3"
      >
        {nav}
      </aside>
      <article
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          borderRadius: 'var(--radius-lg)',
        }}
        className="rd-card mx-auto w-full max-w-[800px] border p-6 lg:col-span-6"
      >
        {content}
      </article>
      <aside
        aria-label="On this page"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          borderRadius: 'var(--radius-lg)',
        }}
        className="rd-card hidden h-fit border p-4 lg:sticky lg:top-20 lg:col-span-3 lg:block"
      >
        {toc}
      </aside>
    </div>
  );
}

/** 8. Workspace + Right Rail Shell (9+3 asymmetric dashboard layout) */
export interface WorkspaceRailShellProps {
  main: React.ReactNode;
  rail: React.ReactNode;
}

export function WorkspaceRailShell({ main, rail }: WorkspaceRailShellProps) {
  return (
    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
      <div className="space-y-6 xl:col-span-9">{main}</div>
      <aside aria-label="Workspace summary rail" className="space-y-6 xl:sticky xl:top-20 xl:col-span-3">
        {rail}
      </aside>
    </div>
  );
}

/** 9. Affix Form Shell (Sticky step/section navigator + form + sticky bottom bar) */
export interface AffixFormShellProps {
  nav: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AffixFormShell({ nav, children, footer }: AffixFormShellProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <aside
          aria-label="Form sections"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            borderRadius: 'var(--radius-lg)',
          }}
          className="rd-card border p-4 lg:sticky lg:top-20 lg:col-span-3"
        >
          {nav}
        </aside>
        <div className="space-y-6 lg:col-span-9">{children}</div>
      </div>
      {footer && (
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            borderRadius: 'var(--radius-lg)',
          }}
          className="rd-card sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-3 border px-6 py-4 shadow-md"
        >
          {footer}
        </div>
      )}
    </div>
  );
}

/** 10. Masonry Grid Shell (Notes, Gallery, Feed cards) */
export interface MasonryGridShellProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

export function MasonryGridShell({ children, columns = 3 }: MasonryGridShellProps) {
  const colClass =
    columns === 4
      ? 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4'
      : columns === 2
        ? 'columns-1 md:columns-2'
        : 'columns-1 md:columns-2 xl:columns-3';
  return (
    <div className={`${colClass} gap-5 [&>*]:mb-5 [&>*]:break-inside-avoid`}>
      {children}
    </div>
  );
}

/** 11. Resizable Split Shell (Gantt+Table, AI Studio+Preview) */
export interface ResizableSplitShellProps {
  left: React.ReactNode;
  right: React.ReactNode;
  initialLeftPct?: number;
}

export function ResizableSplitShell({ left, right, initialLeftPct = 45 }: ResizableSplitShellProps) {
  const [pct, setPct] = React.useState(initialLeftPct);
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-lg)',
      }}
      className="rd-card flex min-h-[540px] flex-col overflow-hidden border lg:flex-row"
    >
      <section style={{ flexBasis: `${pct}%` }} className="min-w-[240px] overflow-auto p-4">
        {left}
      </section>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize split pane"
        aria-valuenow={pct}
        aria-valuemin={25}
        aria-valuemax={75}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setPct((p) => Math.max(25, p - 5));
          if (e.key === 'ArrowRight') setPct((p) => Math.min(75, p + 5));
        }}
        style={{ backgroundColor: 'var(--color-border)' }}
        className="hidden w-1.5 shrink-0 cursor-col-resize items-center justify-center transition-colors hover:bg-[var(--color-primary)] lg:flex"
      />
      <section className="min-w-[240px] flex-1 overflow-auto p-4">{right}</section>
    </div>
  );
}
