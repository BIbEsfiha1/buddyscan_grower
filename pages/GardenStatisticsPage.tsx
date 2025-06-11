import React from 'react';
import DashboardStats from '../components/DashboardStats';
import { Link } from 'react-router-dom';
import { Box, Typography, Paper, Button as MuiButton } from '@mui/material';

const GardenStatisticsPage: React.FC = () => {
  return (
    <Box p={4} bgcolor="background.default" color="text.primary" minHeight="100%" width="100%">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Typography variant="h4" color="primary" fontWeight="bold">
          Estatísticas do Jardim
        </Typography>
        <MuiButton component={Link} to="/" variant="contained" color="primary">
          Voltar ao Dashboard
        </MuiButton>
      </Box>
      <Paper sx={{ p: { xs: 2.5, sm: 4 } }}>
        <DashboardStats />
      </Paper>
    </Box>
  );
};

export default GardenStatisticsPage;
