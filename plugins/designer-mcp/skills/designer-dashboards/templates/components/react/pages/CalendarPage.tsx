'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import { FullCanvasShell } from '../../@layouts/AppShells';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export function CalendarPage() {
  const [month, setMonth] = React.useState(() => dayjs().startOf('month'));
  const daysInMonth = month.daysInMonth();
  const startOffset = month.day();

  return (
    <div className="anim-in">
      <FullCanvasShell
        toolbar={
          <div className="flex w-full items-center justify-between gap-3">
            <h1 className="text-base font-semibold">{month.format('MMMM YYYY')}</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" tone="neutral" size="xs" onClick={() => setMonth((m) => m.subtract(1, 'month'))}>
                Prev
              </Button>
              <Button variant="ghost" tone="primary" size="xs" onClick={() => setMonth(dayjs().startOf('month'))}>
                Today
              </Button>
              <Button variant="outline" tone="neutral" size="xs" onClick={() => setMonth((m) => m.add(1, 'month'))}>
                Next
              </Button>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-7 gap-2 text-xs">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} style={{ color: 'var(--color-text-muted)' }} className="pb-1 text-center font-semibold">
              {d}
            </div>
          ))}
          {Array.from({ length: startOffset }, (_, i) => (
            <div key={`empty-${i}`} className="h-20" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const isSampleEvent = day === 12 || day === 22;
            return (
              <div
                key={day}
                style={{
                  backgroundColor: 'var(--color-canvas)',
                  borderColor: 'var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                }}
                className="flex h-20 flex-col justify-between border p-2"
              >
                <span className="tabular-nums font-semibold">{day}</span>
                {isSampleEvent && (
                  <Badge tone="primary" variant="tonal" size="xs" className="truncate">
                    Release Sync
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </FullCanvasShell>
    </div>
  );
}
