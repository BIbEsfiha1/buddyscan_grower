import React from 'react';
import DashboardStats from '../components/DashboardStats';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const GardenStatisticsPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="p-4 bg-slate-900 min-h-full text-slate-100 space-y-8 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-400">{t('gardenStatisticsPage.title')}</h1>
        <Link
          to="/"
          className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition-colors"
        >
          {t('gardenStatisticsPage.back_dashboard')}
        </Link>
      </div>
      <div className="bg-white dark:bg-slate-800 p-5 sm:p-8 rounded-xl shadow-xl transition-colors duration-300">
        <DashboardStats />
      </div>
    </div>
  );
};

export default GardenStatisticsPage;
