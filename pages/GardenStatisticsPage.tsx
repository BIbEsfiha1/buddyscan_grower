import React from 'react';
import DashboardStats from '../components/DashboardStats';
import { Link } from 'react-router-dom';

const GardenStatisticsPage: React.FC = () => {
  return (
    <div className="p-4 bg-slate-900 min-h-screen text-slate-100 space-y-8 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-400">Estatísticas do Jardim</h1>
        <Link 
          to="/"
          className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition-colors"
        >
          Voltar ao Dashboard
        </Link>
      </div>
      <div className="bg-white dark:bg-slate-800 p-5 sm:p-8 rounded-xl shadow-xl transition-colors duration-300">
        <DashboardStats />
      </div>
    </div>
  );
};

export default GardenStatisticsPage;
