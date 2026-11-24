import * as React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { Layout } from 'antd';
import { ShowcasePage } from './components/framework/ShowcasePage';

const { Content } = Layout;

function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--color-canvas)' }}>
      <Content
        style={{
          padding: '24px',
          maxWidth: 1440,
          width: '100%',
          marginInline: 'auto',
        }}
      >
        {children}
      </Content>
    </Layout>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard/admin" replace />} />
      <Route
        path="/dashboard/admin"
        element={
          <AdminShell>
            <ShowcasePage />
          </AdminShell>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard/admin" replace />} />
    </Routes>
  );
}
