'use client';

import * as React from 'react';
import { AppIcon } from '../@core/icons/registry';

/**
 * Scroll-progress top bar + Back-to-Top FAB.
 */
export function ScrollToTop({ threshold = 280 }: { threshold?: number }) {
  const [visible, setVisible] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const onScroll = () => {
      const top = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(top > threshold);
      setProgress(height > 0 ? Math.min(100, Math.round((top / height) * 100)) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return (
    <>
      <div
        aria-hidden="true"
        style={{
          backgroundColor: 'var(--color-primary)',
          width: `${progress}%`,
          zIndex: 'var(--z-sticky, 30)',
        }}
        className="fixed start-0 top-0 h-0.5 transition-[width] duration-75 print:hidden"
      />
      {visible && (
        <button
          type="button"
          aria-label="Scroll back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-on-solid)',
            zIndex: 'var(--z-sticky, 30)',
          }}
          className="fixed end-6 bottom-6 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 print:hidden"
        >
          <AppIcon name="arrow-up" size={18} />
        </button>
      )}
    </>
  );
}
