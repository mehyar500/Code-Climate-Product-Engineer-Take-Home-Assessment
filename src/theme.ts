import { createTheme } from '@mui/material';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '8px 16px',
        },
      },
    },
  },
}); 