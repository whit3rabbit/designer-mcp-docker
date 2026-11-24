import * as React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { Languages, Moon, Sparkles, Sun } from 'lucide-react';

interface KpiItem {
  label: string;
  value: string;
  delta: string;
}

const KPI_ITEMS: KpiItem[] = [
  { label: 'Monthly Revenue', value: '$142,840', delta: '+14.2%' },
  { label: 'Active Workspaces', value: '3,419', delta: '+8.1%' },
  { label: 'API Latency (p95)', value: '42 ms', delta: '-6.4%' },
  { label: 'Uptime SLA', value: '99.98%', delta: '+0.02%' },
];

function DashboardHome() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>(() =>
    typeof document !== 'undefined' &&
    document.documentElement.getAttribute('data-theme') === 'dark'
      ? 'dark'
      : 'light',
  );
  const [dir, setDir] = React.useState<'ltr' | 'rtl'>('ltr');
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem('rd-theme', next);
    } catch {
      // ignore storage errors
    }
  };

  const toggleDirection = () => {
    const next = dir === 'ltr' ? 'rtl' : 'ltr';
    setDir(next);
    document.documentElement.setAttribute('dir', next);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-canvas)',
        color: 'var(--color-text)',
      }}
    >
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 'var(--layer-2)',
          backgroundColor: 'var(--color-surface)',
          borderBottom: 'var(--op-border-width) solid var(--color-border)',
          paddingInline: 'var(--op-space-lg)',
          paddingBlock: 'var(--op-space-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--op-space-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--op-space-sm)' }}>
          <strong style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)' }}>
            Designer Dashboards Open Props
          </strong>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              paddingInline: 'var(--op-space-sm)',
              paddingBlock: '2px',
              borderRadius: 'var(--op-radius-pill)',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: 'var(--color-primary-surface)',
              color: 'var(--color-primary)',
              border: 'var(--op-border-width) solid var(--color-primary-border)',
            }}
          >
            JIT CSS Tokens
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--op-space-xs)' }}>
          <button
            type="button"
            onClick={toggleDirection}
            aria-label={`Switch text direction to ${dir === 'ltr' ? 'RTL' : 'LTR'}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: 'var(--op-radius-sm)',
              border: 'var(--op-border-width) solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              cursor: 'pointer',
              transition: 'background-color 150ms var(--op-ease-standard)',
            }}
          >
            <Languages size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: 'var(--op-radius-sm)',
              border: 'var(--op-border-width) solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              cursor: 'pointer',
              transition: 'background-color 150ms var(--op-ease-standard)',
            }}
          >
            {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </button>
        </div>
      </header>

      <main
        style={{
          maxWidth: '72rem',
          marginInline: 'auto',
          paddingInline: 'var(--op-space-lg)',
          paddingBlock: 'var(--op-space-xl)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--op-space-lg)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 'var(--op-space-md)',
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)' }}>
              Analytics Overview
            </h1>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Lightweight Open Props spatial &amp; motion tokens bridged to OpenDesign OKLCH colors.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setStatusMessage('Open Props JIT tokens and OpenDesign theme variables are active.')
            }
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--op-space-xs)',
              paddingInline: 'var(--op-space-md)',
              paddingBlock: 'var(--op-space-sm)',
              borderRadius: 'var(--op-radius-sm)',
              border: 'none',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-solid)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: 'var(--op-shadow-card)',
              transition: 'transform 150ms var(--op-ease-spring), background-color 150ms var(--op-ease-standard)',
            }}
          >
            <Sparkles size={16} aria-hidden="true" />
            Verify Token Bridge
          </button>
        </div>

        {statusMessage && (
          <div
            role="status"
            style={{
              padding: 'var(--op-space-md)',
              borderRadius: 'var(--op-radius-sm)',
              backgroundColor: 'var(--color-primary-surface)',
              border: 'var(--op-border-width) solid var(--color-primary-border)',
              color: 'var(--color-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--op-space-md)',
            }}
          >
            <span style={{ fontSize: '0.875rem' }}>{statusMessage}</span>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              aria-label="Dismiss status message"
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--color-primary)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        <section
          aria-label="Key Performance Indicators"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
            gap: 'var(--op-space-md)',
          }}
        >
          {KPI_ITEMS.map((kpi) => (
            <article
              key={kpi.label}
              style={{
                backgroundColor: 'var(--color-surface)',
                border: 'var(--op-border-width) solid var(--color-border)',
                borderRadius: 'var(--op-radius-md)',
                padding: 'var(--op-space-lg)',
                boxShadow: 'var(--op-shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--op-space-sm)',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--color-text-muted)',
                }}
              >
                {kpi.label}
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 'var(--op-space-sm)',
                }}
              >
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)' }}>
                  {kpi.value}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    paddingInline: 'var(--op-space-sm)',
                    paddingBlock: '2px',
                    borderRadius: 'var(--op-radius-pill)',
                    backgroundColor: 'var(--color-primary-surface)',
                    color: 'var(--color-primary)',
                  }}
                >
                  {kpi.delta}
                </span>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard/analytics" replace />} />
      <Route path="/dashboard/analytics" element={<DashboardHome />} />
      <Route path="*" element={<Navigate to="/dashboard/analytics" replace />} />
    </Routes>
  );
}
