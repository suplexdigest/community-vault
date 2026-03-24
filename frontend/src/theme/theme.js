import { createTheme } from '@mui/material/styles';

const GREEN = '#1B4332';
const GOLD = '#C5A258';

export function createAppTheme(mode) {
  const isLight = mode === 'light';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: GREEN,
        light: '#2D6A4F',
        dark: '#0F2B1F',
        contrastText: '#fff',
      },
      secondary: {
        main: GOLD,
        light: '#D4B36A',
        dark: '#A68940',
        contrastText: GREEN,
      },
      background: {
        default: isLight ? '#f5f5f0' : '#121212',
        paper: isLight ? '#fff' : '#1e1e1e',
      },
      text: {
        primary: isLight ? '#1a1a1a' : '#e0e0e0',
        secondary: isLight ? '#666' : '#aaa',
      },
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      h1: { fontFamily: '"Georgia", serif', fontWeight: 800 },
      h2: { fontFamily: '"Georgia", serif', fontWeight: 800 },
      h3: { fontFamily: '"Georgia", serif', fontWeight: 700 },
      h4: { fontFamily: '"Georgia", serif', fontWeight: 700 },
      h5: { fontFamily: '"Georgia", serif', fontWeight: 700 },
      h6: { fontFamily: '"Georgia", serif', fontWeight: 700 },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 8,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: isLight
              ? '0 2px 12px rgba(0,0,0,0.06)'
              : '0 2px 12px rgba(0,0,0,0.3)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0 1px 12px rgba(0,0,0,0.15)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: 'none',
          },
        },
      },
    },
  });
}
