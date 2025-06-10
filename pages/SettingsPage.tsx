import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ThemeToggle from '../components/ThemeToggle';
import { useTranslation } from 'react-i18next';

const SettingsPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { t } = useTranslation();

  return (
    <div className="flex min-h-full bg-gray-900 text-white overflow-y-auto">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={t('settingsPage.title')}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenAddModal={() => {}}
          onOpenScannerModal={() => {}}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
            <span>{t('settingsPage.theme')}</span>
            <ThemeToggle />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;

