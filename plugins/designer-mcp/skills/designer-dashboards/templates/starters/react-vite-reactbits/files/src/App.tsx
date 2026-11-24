import * as React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { ShowcasePage } from './components/framework/ShowcasePage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard/showcase" replace />} />
      <Route path="/dashboard/showcase" element={<ShowcasePage />} />
      <Route path="*" element={<Navigate to="/dashboard/showcase" replace />} />
    </Routes>
  );
}
