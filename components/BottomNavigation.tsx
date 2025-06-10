import React from 'react';
import { NavLink, Link } from 'react-router-dom';
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
  const { t } = useTranslation();

  const navItems = [
    { label: t('sidebar.dashboard'), path: '/', icon: HomeIcon },
    { label: t('sidebar.plants'), path: '/plants', icon: LeafIcon },
    { label: t('sidebar.cultivos'), path: '/cultivos', icon: Squares2X2Icon },
    { label: t('sidebar.scanner'), path: '/scanner', icon: QrCodeIcon },
    { label: t('sidebar.statistics'), path: '/estatisticas-jardim', icon: ChartBarIcon },
    { label: t('sidebar.settings'), path: '/settings', icon: Cog6ToothIcon },
  ];

  const scannerItem = navItems.find(item => item.path === '/scanner');
  const otherItems = navItems.filter(item => item.path !== '/scanner');

  return (
    <nav
      role="navigation"
      className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-t border-slate-700 text-slate-200 flex justify-around md:hidden z-50 relative pt-2"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.5rem)' }}
    >
      {otherItems.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `flex flex-col items-center text-xs flex-1 py-2 ${isActive ? 'text-green-400' : 'text-slate-300'}`
          }
          aria-label={label}
        >
          <Icon className="w-6 h-6" />
          <span className="mt-1">{label}</span>
        </NavLink>
      ))}

      {scannerItem && (() => {
        const { path, label, icon: ScannerIcon } = scannerItem;
        return (
          <Link
            to={path}
            className="absolute left-1/2 -top-6 -translate-x-1/2 bg-emerald-500 text-white rounded-full p-3 shadow-lg"
            aria-label={label}
          >
            <ScannerIcon className="w-7 h-7" />
          </Link>
        );
      })()}
    </nav>
  );
};

export default BottomNavigation;
