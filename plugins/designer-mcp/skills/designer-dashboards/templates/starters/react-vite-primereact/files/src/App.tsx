import { Navigate, Route, Routes } from 'react-router';
import { ShowcasePage } from './components/framework/ShowcasePage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard/enterprise" replace />} />
      <Route path="/dashboard/enterprise" element={<ShowcasePage />} />
      <Route path="*" element={<Navigate to="/dashboard/enterprise" replace />} />
    </Routes>
  );
}
