import { Navigate, Route, Routes } from 'react-router';
import { ShowcasePage } from './components/framework/ShowcasePage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard/analytics" replace />} />
      <Route path="/dashboard/analytics" element={<ShowcasePage />} />
      <Route path="*" element={<Navigate to="/dashboard/analytics" replace />} />
    </Routes>
  );
}
