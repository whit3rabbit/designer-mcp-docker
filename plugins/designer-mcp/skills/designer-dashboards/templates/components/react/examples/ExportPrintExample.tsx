'use client';

/**
 * Spreadsheet Export (`xlsx`) & Component-Scoped Print (`react-to-print`) Helpers
 * Distilled from midone_v5.0.5 and gogo_v6.3.0.
 *
 * Install when needed: `pnpm add xlsx react-to-print`
 */

import * as React from 'react';
import { Button } from '../components/ui/Button';

export function exportRowsToCsv<T extends Record<string, unknown>>(rows: T[], filename = 'export.csv') {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? '')).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function PrintContainerAction({
  onPrint,
  label = 'Print Report',
}: {
  onPrint?: () => void;
  label?: string;
}) {
  return (
    <Button
      size="sm"
      variant="outline"
      className="print:hidden"
      onClick={() => (onPrint ? onPrint() : window.print())}
    >
      {label}
    </Button>
  );
}
