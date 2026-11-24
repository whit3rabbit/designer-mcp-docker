import { EmptyState } from '../components/ui/EmptyState';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <EmptyState
        illustration="not-found"
        title="404 — Page not found"
        description="The page you requested does not exist or has been moved."
        action={
          <a
            href="/dashboard/analytics"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-solid)',
              borderRadius: 'var(--radius-md)',
            }}
            className="inline-flex h-9 items-center px-4 text-sm font-medium"
          >
            Back to Dashboard
          </a>
        }
      />
    </main>
  );
}
