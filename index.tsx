import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider as AppThemeProvider } from './contexts/ThemeContext';
import { MuiThemeProviderWrapper } from './contexts/MuiThemeProvider';
import { AuthProvider } from './contexts/AuthContext';
import './i18n';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AppThemeProvider>
        <MuiThemeProviderWrapper>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MuiThemeProviderWrapper>
      </AppThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);