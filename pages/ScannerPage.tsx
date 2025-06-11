import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import QrCodeScanner, { ScanResult } from '../components/QrCodeScanner';
import { Box, Container, Typography } from '@mui/material';

const ScannerPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleScanSuccess = (result: ScanResult) => {
    if (result.type === 'plant' && result.plant) {
      navigate(`/plant/${result.plant.id}`);
    } else if (result.type === 'grow' && result.grow) {
      navigate(`/grow/${result.grow.id}`);
    }
  };

  const handleScanError = (message: string) => {
    setScanError(message);
  };

  return (
    <Box sx={{ display: 'flex', backgroundColor: 'background.default', color: 'text.primary', minHeight: '100vh' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Header
          title={t('header.scan_qr')}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenAddModal={() => navigate('/nova-planta')}
          onOpenScannerModal={() => {}}
          showBack
          onBack={() => navigate(-1)}
        />
        <Container sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {scanError && (
            <Typography color="error" sx={{ mb: 2 }}>
              {scanError}
            </Typography>
          )}
          <QrCodeScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} scanType="auto" />
        </Container>
      </Box>
    </Box>
  );
};

export default ScannerPage;
