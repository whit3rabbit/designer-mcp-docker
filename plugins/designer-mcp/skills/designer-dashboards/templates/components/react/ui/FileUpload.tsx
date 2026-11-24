'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { AppIcon } from '../../@core/icons/registry';
import { Button } from './Button';

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
  files: File[];
  onFilesChange: (files: File[]) => void;
  label?: string;
  hint?: string;
  className?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({
  accept,
  multiple = true,
  maxSizeMb = 10,
  files,
  onFilesChange,
  label = 'Drop files here or click to browse',
  hint,
  className,
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  const acceptFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const maxBytes = maxSizeMb * 1024 * 1024;
    const valid = Array.from(incoming).filter((f) => f.size <= maxBytes);
    onFilesChange(multiple ? [...files, ...valid] : valid.slice(0, 1));
  };

  return (
    <div className={clsx('space-y-3', className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          acceptFiles(e.dataTransfer.files);
        }}
        style={{
          backgroundColor: dragging ? 'var(--color-primary-surface)' : 'var(--color-canvas)',
          borderColor: dragging ? 'var(--color-primary)' : 'var(--color-border)',
          borderRadius: 'var(--radius-lg)',
        }}
        className="flex cursor-pointer flex-col items-center justify-center border-2 border-dashed px-6 py-8 text-center transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => acceptFiles(e.target.files)}
          className="sr-only"
        />
        <AppIcon name="download" size={24} className="mb-2 rotate-180" />
        <p style={{ color: 'var(--color-text)' }} className="text-xs font-semibold">
          {label}
        </p>
        <p style={{ color: 'var(--color-text-muted)' }} className="mt-1 text-[11px]">
          {hint || `Max file size ${maxSizeMb} MB`}
        </p>
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, idx) => (
            <li
              key={`${file.name}-${idx}`}
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                borderRadius: 'var(--radius-md)',
              }}
              className="flex items-center justify-between gap-3 border px-3 py-2 text-xs"
            >
              <div className="min-w-0">
                <p style={{ color: 'var(--color-text)' }} className="truncate font-medium">
                  {file.name}
                </p>
                <p style={{ color: 'var(--color-text-muted)' }} className="tabular-nums text-[11px]">
                  {formatBytes(file.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                tone="neutral"
                size="xs"
                iconOnly
                aria-label={`Remove ${file.name}`}
                onClick={() => onFilesChange(files.filter((_, i) => i !== idx))}
              >
                <AppIcon name="x" size={14} />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  AvatarUpload (14/17 dashboards: profile avatar / logo preview + reset)    */
/* -------------------------------------------------------------------------- */

export interface AvatarUploadProps {
  value?: string | null;
  onChange: (file: File | null, previewUrl: string | null) => void;
  fallbackText?: string;
  shape?: 'circle' | 'square';
  maxSizeMb?: number;
  label?: string;
  hint?: string;
  className?: string;
}

export function AvatarUpload({
  value,
  onChange,
  fallbackText = 'RD',
  shape = 'circle',
  maxSizeMb = 4,
  label = 'Upload photo',
  hint,
  className,
}: AvatarUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | null>(value ?? null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setPreview(value ?? null);
  }, [value]);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File exceeds ${maxSizeMb} MB limit`);
      return;
    }
    setError(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange(file, url);
  };

  const handleReset = () => {
    setError(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
    onChange(null, null);
  };

  const radiusClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl';

  return (
    <div className={clsx('flex flex-wrap items-center gap-4', className)}>
      <div
        style={{
          backgroundColor: 'var(--color-primary-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-primary)',
        }}
        className={clsx(
          'relative flex size-20 shrink-0 items-center justify-center overflow-hidden border text-lg font-bold',
          radiusClass,
        )}
      >
        {preview ? (
          <img src={preview} alt="Avatar preview" className="size-full object-cover" />
        ) : (
          <span>{fallbackText}</span>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label={label}
          style={{ backgroundColor: 'var(--color-scrim)' }}
          className="absolute inset-0 flex cursor-pointer items-center justify-center text-white opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100"
        >
          <AppIcon name="upload" size={18} />
        </button>
      </div>

      <div className="space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="sr-only"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="tonal" tone="primary" size="sm" onClick={() => inputRef.current?.click()}>
            <AppIcon name="upload" size={14} />
            <span>{label}</span>
          </Button>
          {preview && (
            <Button type="button" variant="ghost" tone="neutral" size="sm" onClick={handleReset}>
              Reset
            </Button>
          )}
        </div>
        <p style={{ color: error ? 'var(--color-error)' : 'var(--color-text-muted)' }} className="text-[11px]">
          {error ?? hint ?? `PNG, JPG or WebP up to ${maxSizeMb} MB`}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  ImageUpload (Multi-image gallery dropzone with thumbnail previews)        */
/* -------------------------------------------------------------------------- */

export interface ImageUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxSizeMb?: number;
  className?: string;
}

export function ImageUpload({ files, onFilesChange, maxSizeMb = 5, className }: ImageUploadProps) {
  const [previews, setPreviews] = React.useState<string[]>([]);

  React.useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  return (
    <div className={clsx('space-y-3', className)}>
      <FileUpload
        accept="image/*"
        multiple
        maxSizeMb={maxSizeMb}
        files={[]}
        onFilesChange={(incoming) => onFilesChange([...files, ...incoming])}
        label="Drop product images or click to browse"
        hint={`PNG, JPG, WebP up to ${maxSizeMb} MB each`}
      />
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {previews.map((src, idx) => (
            <div
              key={`${files[idx]?.name ?? 'img'}-${idx}`}
              style={{
                borderColor: 'var(--color-border)',
                borderRadius: 'var(--radius-md)',
              }}
              className="group relative aspect-square overflow-hidden border"
            >
              <img src={src} alt={files[idx]?.name ?? `Upload ${idx + 1}`} className="size-full object-cover" />
              <div className="absolute end-1.5 top-1.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <Button
                  type="button"
                  variant="solid"
                  tone="error"
                  size="xs"
                  iconOnly
                  aria-label={`Remove ${files[idx]?.name ?? 'image'}`}
                  onClick={() => onFilesChange(files.filter((_, i) => i !== idx))}
                >
                  <AppIcon name="trash-2" size={12} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
