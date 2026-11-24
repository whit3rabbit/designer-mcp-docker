import * as React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { AppBar, Box, Container, IconButton, Stack, Toolbar, Tooltip, Typography } from '@mui/material';
import { Languages, Moon, Sun } from 'lucide-react';
import { useMuiThemeMode } from './components/framework/theme/MuiThemeProvider';
import { ShowcasePage } from './components/framework/ShowcasePage';

function EnterpriseShell({ children }: { children: React.ReactNode }) {
  const { mode, dir, toggleMode, toggleDir } = useMuiThemeMode();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 'var(--radius-md)',
                bgcolor: 'var(--color-primary)',
                color: 'var(--color-on-solid)',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
                fontSize: '0.875rem',
              }}
              aria-hidden="true"
            >
              R
            </Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Designer Dashboards Enterprise
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Tooltip title={dir === 'ltr' ? 'Switch to RTL' : 'Switch to LTR'}>
              <IconButton
                onClick={toggleDir}
                aria-label={dir === 'ltr' ? 'Switch layout direction to RTL' : 'Switch layout direction to LTR'}
                size="small"
                sx={{ color: 'text.primary' }}
              >
                <Languages size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              <IconButton
                onClick={toggleMode}
                aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                size="small"
                sx={{ color: 'text.primary' }}
              >
                {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" component="main" sx={{ py: 3, flexGrow: 1 }}>
        {children}
      </Container>
    </Box>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard/analytics" replace />} />
      <Route
        path="/dashboard/analytics"
        element={
          <EnterpriseShell>
            <ShowcasePage />
          </EnterpriseShell>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard/analytics" replace />} />
    </Routes>
  );
}
