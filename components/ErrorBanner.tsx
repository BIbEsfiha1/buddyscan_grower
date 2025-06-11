import React from 'react';
import { Alert } from '@mui/material';

interface ErrorBannerProps {
  message: string;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ message }) => (
  <Alert severity="error" sx={{ my: 2 }}>
    {message}
  </Alert>
);

export default ErrorBanner;
