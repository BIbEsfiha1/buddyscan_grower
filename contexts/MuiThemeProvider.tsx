import React from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme } from './ThemeContext';

const baseOptions = {
  typography: {
    fontFamily: `'Inter', sans-serif`,
  },
};

let lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#7AC943' },
    secondary: { main: '#0284c7' },
  },
  ...baseOptions,
});

let darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7AC943' },
    secondary: { main: '#0284c7' },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
  },
  ...baseOptions,
});

lightTheme = responsiveFontSizes(lightTheme);
darkTheme = responsiveFontSizes(darkTheme);

export const MuiThemeProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();
  const appliedTheme = theme === 'dark' ? darkTheme : lightTheme;
  return (
    <MuiThemeProvider theme={appliedTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
