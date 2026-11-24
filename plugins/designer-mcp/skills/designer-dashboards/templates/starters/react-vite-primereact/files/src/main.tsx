import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrimeThemeProvider } from './components/framework/theme/PrimeThemeProvider';
import { App } from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <PrimeThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PrimeThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
