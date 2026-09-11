import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#667eea' },
    secondary: { main: '#764ba2' },
    background: { default: '#0f172a', paper: '#1e293b' },
    text: { primary: '#f8fafc', secondary: '#94a3b8' },
  },
  typography: { fontFamily: '"Inter", sans-serif' },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 6, textTransform: 'none', fontWeight: 600 } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 8, backgroundImage: 'none', backgroundColor: '#1e293b', border: '1px solid #334155' } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none', backgroundColor: '#1e293b', border: '1px solid #334155' } } },
  },
});

export default theme;