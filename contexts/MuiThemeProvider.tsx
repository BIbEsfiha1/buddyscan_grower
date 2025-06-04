import React from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme } from './ThemeContext';

const lightTheme = createTheme({
  palette: { mode: 'light' },
});

const darkTheme = createTheme({
  palette: { mode: 'dark' },
});

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
