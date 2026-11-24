import * as React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import * as stylex from '@stylexjs/stylex';
import { ShowcasePage } from './components/framework/ShowcasePage';

const styles = stylex.create({
  shell: {
    minHeight: '100dvh',
    backgroundColor: 'var(--color-canvas)',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-sans)',
  },
});

export function App() {
  return (
    <div {...stylex.props(styles.shell)}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard/analytics" replace />} />
        <Route path="/dashboard/analytics" element={<ShowcasePage />} />
        <Route path="*" element={<Navigate to="/dashboard/analytics" replace />} />
      </Routes>
    </div>
  );
}
