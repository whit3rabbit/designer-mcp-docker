export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading dashboard"
      className="flex min-h-[40vh] items-center justify-center p-8"
    >
      <div
        style={{
          borderColor: 'var(--color-primary-border)',
          borderTopColor: 'var(--color-primary)',
        }}
        className="size-8 animate-spin rounded-full border-2"
      />
    </div>
  );
}
