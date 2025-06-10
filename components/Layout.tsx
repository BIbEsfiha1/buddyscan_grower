import React, { ReactNode } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { APP_NAME } from '../constants';
import { Box, Typography } from '@mui/material';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Mantém o hook para não quebrar contexto de tema, mas não desestrutura nada
  useTheme();
  useAuth();
  // Apenas mantém os hooks para garantir que os provedores estejam ativos

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <Box component="footer" sx={{ bgcolor: 'background.paper', py: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          &copy; {new Date().getFullYear()} {APP_NAME}. Todos os direitos reservados.
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;