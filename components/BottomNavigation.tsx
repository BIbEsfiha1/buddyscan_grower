import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HomeIcon,
  Squares2X2Icon,
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import LeafIcon from './icons/LeafIcon';
import QrCodeIcon from './icons/QrCodeIcon';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { label: t('sidebar.dashboard'), path: '/', icon: HomeIcon },
    { label: t('sidebar.plants'), path: '/plants', icon: LeafIcon },
    { label: t('sidebar.cultivos'), path: '/cultivos', icon: Squares2X2Icon },
    { label: t('sidebar.scanner'), path: '/scanner', icon: QrCodeIcon },
    { label: t('sidebar.statistics'), path: '/estatisticas-jardim', icon: ChartBarIcon },
    { label: t('sidebar.settings'), path: '/settings', icon: Cog6ToothIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-t border-slate-700 text-slate-200 flex justify-around py-2 md:hidden z-50">
      {navItems.map(({ label, path, icon: Icon }) => {
        const isActive = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center text-xs flex-1 py-2 ${isActive ? 'text-green-400' : 'text-slate-300'}`}
          >
            <Icon className="w-6 h-6" />
            <span className="mt-1">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;
