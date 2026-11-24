'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { Button } from './Button';

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

function sanitizeHtml(raw: string): string {
  return raw
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write something...',
  label = 'Rich text editor',
  className,
}: RichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const clean = sanitizeHtml(value);
    if (el.innerHTML !== clean) {
      el.innerHTML = clean;
    }
  }, [value]);

  const exec = (command: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false);
    if (editorRef.current) onChange(sanitizeHtml(editorRef.current.innerHTML));
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-md)',
      }}
      className={clsx('overflow-hidden border', className)}
    >
      <div
        role="toolbar"
        aria-label="Formatting options"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-canvas)' }}
        className="flex flex-wrap items-center gap-1 border-b px-2.5 py-1.5"
      >
        <Button variant="ghost" tone="neutral" size="xs" onClick={() => exec('bold')}>
          Bold
        </Button>
        <Button variant="ghost" tone="neutral" size="xs" onClick={() => exec('italic')}>
          Italic
        </Button>
        <Button variant="ghost" tone="neutral" size="xs" onClick={() => exec('insertUnorderedList')}>
          List
        </Button>
      </div>
      <div
        ref={editorRef}
        role="textbox"
        aria-multiline="true"
        aria-label={label}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={(e) => onChange(sanitizeHtml(e.currentTarget.innerHTML))}
        style={{ color: 'var(--color-text)' }}
        className="min-h-32 p-3 text-sm outline-none"
      />
    </div>
  );
}
