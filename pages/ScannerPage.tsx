import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import QrCodeScanner from '../components/QrCodeScanner';
import { Plant } from '../types';

const ScannerPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleScanSuccess = (plant: Plant) => {
    navigate(`/plant/${plant.id}`);
  };

  const handleScanError = (message: string) => {
    setScanError(message);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={t('header.scan_qr')}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenAddModal={() => navigate('/nova-planta')}
          onOpenScannerModal={() => {}}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col items-center">
          {scanError && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
              {scanError}
            </div>
          )}
          <QrCodeScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} />
        </main>
      </div>
    </div>
  );
};

export default ScannerPage;
